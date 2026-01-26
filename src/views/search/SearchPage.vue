<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/base.js";
import SearchBox from "@/components/Search/SearchBox.vue";
import AdvancedSearch from "@/components/Search/AdvancedSearch.vue";
import SearchHistory from "@/components/Search/SearchHistory.vue";
import FilterSidebar from "@/components/Search/FilterSidebar.vue";
import GeoFilter from "@/components/Search/GeoFilter.vue";
import GeoFilterDisplay from "@/components/Search/GeoFilterDisplay.vue";
import DataTable from "@/components/Search/DataTable.vue";
import StatsPanel from "@/components/Search/StatsPanel.vue";
import MapView from "@/components/Search/MapView.vue";
import TimelineView from "@/components/Search/TimelineView.vue";
import DiversityChart from "@/components/Search/DiversityChart.vue";
import CustomChart from "@/components/Search/CustomChart.vue";
import RecordDetailModal from "@/components/Search/RecordDetailModal.vue";
import { exportToCSV, exportToXLSX, exportRecordsToGeoJSON, generateFilename, exportChartToSVG, exportChartToPDF, exportChartToPNG } from "@/utils/exportUtils.js";
import { ArrowDown } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const searchTerm = ref("");
const conditions = ref([]);
const treeData = ref([]);
const tableRows = ref([]);
const tableFields = ref([]);
const page = ref(0);
const pageSize = ref(10);
const total = ref(0);
const currentFilter = ref({});

// Filter sidebar state
const multiFilters = ref({});
const rangeFilters = ref({});
const aggregations = ref({});
const yearBounds = ref({ min: 1800, max: new Date().getFullYear() });

// Geo filter state (polygon/rectangle/circle drawing on map)
const geoFilter = ref(null);

// View state
const activeView = ref("table");  // 'table' or 'analysis'
const activeAnalysisTab = ref("map");  // 'map', 'timeline', 'diversity', 'custom'
const showDetailModal = ref(false);
const selectedRecord = ref(null);
const mapViewRef = ref(null);
const searchHistoryRef = ref(null);
const searchBoxRef = ref(null);
const advancedSearchRef = ref(null);
const timelineViewRef = ref(null);
const diversityChartRef = ref(null);
const customChartRef = ref(null);

// Search state: 'initial' | 'loading' | 'results' | 'empty'
const searchState = ref("initial");
const isLoading = ref(false);

// Quick search suggestions
const quickSearches = [
  { label: "Salmonidae", term: "Salmonidae" },
  { label: "Cyprinidae", term: "Cyprinidae" },
  { label: "Cichlidae", term: "Cichlidae" },
  { label: "USA specimens", term: "USA" },
  { label: "Amazon fish", term: "Amazon" },
];

const hasSearched = computed(() => searchState.value !== "initial");

// Check for query parameter on mount
onMounted(async () => {
  const q = route.query.q;
  if (q) {
    searchTerm.value = q;
    await fetchTableData();
    fetchTreeData();
    // Clear URL query params while preserving the base path
    router.replace({ path: route.path });
  }
});

// Tab switching with map refresh
const switchTab = (tab) => {
  activeView.value = tab;
  // Refresh map when switching to analysis tab with map sub-tab
  if (tab === 'analysis' && activeAnalysisTab.value === 'map' && mapViewRef.value) {
    setTimeout(() => {
      mapViewRef.value.refresh();
    }, 100);
  }
};

// Analysis sub-tab switching
const switchAnalysisTab = (tab) => {
  activeAnalysisTab.value = tab;
  // Refresh map when switching to map tab
  if (tab === 'map' && mapViewRef.value) {
    setTimeout(() => {
      mapViewRef.value.refresh();
    }, 100);
  }
};

// Stats data
const stats = ref({
  totalRecords: 0,
  speciesCount: 0,
  institutionCount: 0,
  countryCount: 0,
  georefPercent: 0
});

// Chart data from backend
const mapPoints = ref([]);
const timelineData = ref([]);
const chartDiversityData = ref([]);

const onNodeClick = (filter) => {
  currentFilter.value = { [filter.field]: filter.value };
  fetchTableData();
};

const onRowClick = (row) => {
  selectedRecord.value = row;
  showDetailModal.value = true;
};


// Fetch table data
const fetchTableData = async () => {
  isLoading.value = true;
  searchState.value = "loading";

  try {
    // Build multi-select filter conditions
    const activeMultiFilters = {};
    Object.keys(multiFilters.value).forEach(key => {
      if (multiFilters.value[key] && multiFilters.value[key].length > 0) {
        activeMultiFilters[key] = multiFilters.value[key];
      }
    });

    // Build range filter conditions
    const activeRangeFilters = {};
    Object.keys(rangeFilters.value).forEach(key => {
      if (rangeFilters.value[key]) {
        activeRangeFilters[key] = rangeFilters.value[key];
      }
    });

    const payload = {
      term: searchTerm.value || undefined,
      conditions: conditions.value.length > 0 ? conditions.value : undefined,
      filter_conditions: Object.keys(currentFilter.value).length > 0 ? currentFilter.value : undefined,
      multi_filters: Object.keys(activeMultiFilters).length > 0 ? activeMultiFilters : undefined,
      range_filters: Object.keys(activeRangeFilters).length > 0 ? activeRangeFilters : undefined,
      geo_filter: geoFilter.value || undefined,
      page: page.value,
      page_size: pageSize.value,
    };

    const response = await api.post('/adsearch', payload);
    const { hits } = response;

    tableRows.value = hits || [];
    total.value = response.total || 0;

    stats.value.totalRecords = response.total || 0;

    // Use backend stats if available
    const backendStats = response.stats;
    if (backendStats) {
      stats.value.totalRecords = backendStats.total || 0;
      stats.value.speciesCount = backendStats.speciesCount || 0;
      stats.value.institutionCount = backendStats.institutionCount || 0;
      stats.value.countryCount = backendStats.countryCount || 0;
      stats.value.georefPercent = backendStats.georefPercent || 0;
    }

    // Use backend chart data if available
    const charts = response.charts;
    if (charts) {
      mapPoints.value = charts.mapPoints || [];
      timelineData.value = charts.timeline || [];
      chartDiversityData.value = charts.diversity || [];
    }

    if (hits && hits.length > 0) {
      tableFields.value = Object.keys(hits[0]).map((key) => ({
        prop: key,
        label: key.replace(/([A-Z])/g, " $1").trim(),
      }));
      searchState.value = "results";
    } else {
      tableFields.value = [];
      searchState.value = "empty";
    }
  } catch (error) {
    console.error("Error fetching table data:", error);
    searchState.value = "empty";
  } finally {
    isLoading.value = false;
  }
};

// Pending history item (for first search when component not mounted)
let pendingHistoryItem = null;

// Quick search handler
const onQuickSearch = (term) => {
  searchTerm.value = term;
  conditions.value = [];
  page.value = 0;
  fetchTableData();
  fetchTreeData();

  const historyItem = { type: 'simple', term: term };
  if (term && searchHistoryRef.value) {
    searchHistoryRef.value.addToHistory(historyItem);
  } else if (term) {
    // Store for later when component is mounted
    pendingHistoryItem = historyItem;
  }
};

// Watch for SearchHistory component mount and add pending item
watch(() => searchHistoryRef.value, (newVal) => {
  if (newVal && pendingHistoryItem) {
    nextTick(() => {
      newVal.addToHistory(pendingHistoryItem);
      pendingHistoryItem = null;
    });
  }
});

// Fetch tree data and aggregations for filter sidebar
const fetchTreeData = async () => {
  try {
    const payload = {
      term: searchTerm.value || undefined,
      conditions: conditions.value.length > 0 ? conditions.value : undefined,
    };

    const response = await api.post('/adaggregation', payload);
    const aggData = response.aggregations;

    // Update aggregations for FilterSidebar
    aggregations.value = aggData;

    treeData.value = JSON.parse(
      JSON.stringify([
        {
          id: "taxon",
          label: `Taxon`,
          children: [
            {
              id: "scientific-name",
              label: "ScientificName",
              children: aggData.Taxon.ScientificName.map((bucket, index) => ({
                id: `scientific-name-${index}`,
                field: "ScientificName",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
            {
              id: "family",
              label: "Family",
              children: aggData.Taxon.Family.map((bucket, index) => ({
                id: `family-${index}`,
                field: "Family",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
          ],
        },
        {
          id: "occurrence",
          label: `Occurrence`,
          children: [
            {
              id: "institution-code",
              label: "InstitutionCode",
              children: aggData.Occurrence.InstitutionCode.map((bucket, index) => ({
                id: `institution-code-${index}`,
                field: "InstitutionCode",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
            {
              id: "collection-code",
              label: "CollectionCode",
              children: aggData.Occurrence.CollectionCode.map((bucket, index) => ({
                id: `collection-code-${index}`,
                field: "CollectionCode",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
            {
              id: "individual-count",
              label: "IndividualCount",
              children: (aggData.Occurrence.IndividualCount || []).map((bucket, index) => ({
                id: `individual-count-${index}`,
                field: "IndividualCount",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
          ],
        },
        {
          id: "location",
          label: `Location`,
          children: [
            {
              id: "country",
              label: "Country",
              children: aggData.Location.Country.map((bucket, index) => ({
                id: `country-${index}`,
                field: "Country",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
            {
              id: "state-province",
              label: "StateProvince",
              children: aggData.Location.StateProvince.map((bucket, index) => ({
                id: `state-province-${index}`,
                field: "StateProvince",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
            {
              id: "county",
              label: "County",
              children: aggData.Location.County.map((bucket, index) => ({
                id: `county-${index}`,
                field: "County",
                value: bucket.key,
                label: `${bucket.key} (${bucket.doc_count})`,
              })),
            },
          ],
        },
      ])
    );
  } catch (error) {
    console.error("Error fetching tree data:", error);
  }
};

const onSimpleSearch = (term) => {
  searchTerm.value = term;
  conditions.value = [];
  page.value = 0;
  fetchTableData();
  fetchTreeData();

  // Add to search history
  const historyItem = { type: 'simple', term: term };
  if (term && searchHistoryRef.value) {
    searchHistoryRef.value.addToHistory(historyItem);
  } else if (term) {
    pendingHistoryItem = historyItem;
  }
};

const onAdvancedSearch = (newConditions) => {
  conditions.value = newConditions;
  searchTerm.value = "";
  page.value = 0;
  fetchTableData();
  fetchTreeData();

  // Add to search history
  const historyItem = { type: 'advanced', conditions: newConditions };
  if (newConditions.length > 0 && searchHistoryRef.value) {
    searchHistoryRef.value.addToHistory(historyItem);
  } else if (newConditions.length > 0) {
    pendingHistoryItem = historyItem;
  }
};

const onPageChange = (newPage) => {
  page.value = newPage;
  fetchTableData();
};

// Load saved/history search
const onLoadSearch = (item) => {
  if (item.type === 'simple') {
    searchTerm.value = item.term;
    conditions.value = [];
    page.value = 0;
    fetchTableData();
    fetchTreeData();
  } else if (item.type === 'advanced') {
    conditions.value = item.conditions;
    searchTerm.value = "";
    page.value = 0;
    fetchTableData();
    fetchTreeData();
  }
};

// Handle filter sidebar changes (live update search results)
const onFilterChange = (filters) => {
  const newMultiFilters = {};
  const newRangeFilters = {};

  Object.keys(filters).forEach(key => {
    if (key === 'YearRange') {
      // Range filter
      if (filters[key] && filters[key].length === 2) {
        newRangeFilters['YearCollected'] = {
          min: filters[key][0],
          max: filters[key][1]
        };
      }
    } else if (Array.isArray(filters[key])) {
      // Multi-select filter
      newMultiFilters[key] = filters[key];
    }
  });

  multiFilters.value = newMultiFilters;
  rangeFilters.value = newRangeFilters;
  page.value = 0; // Reset page

  // Live update search results
  fetchTableData();
};

// Handle geo filter from map drawing (polygon/rectangle/circle)
const onGeoFilter = (filter) => {
  geoFilter.value = filter;
  page.value = 0;

  if (hasSearched.value) {
    fetchTableData();
  }
};

// Handle geo filter apply from GeoFilter component
const onGeoFilterApply = (filter) => {
  geoFilter.value = filter;
  page.value = 0;

  if (hasSearched.value) {
    fetchTableData();
  }
};

// Handle geo filter clear from GeoFilter component
const onGeoFilterClear = () => {
  geoFilter.value = null;
  page.value = 0;

  if (hasSearched.value) {
    fetchTableData();
  }
};

// Export state
const isExporting = ref(false);

// Fetch all records for export (bypasses pagination)
const fetchAllRecordsForExport = async () => {
  const activeMultiFilters = {};
  Object.keys(multiFilters.value).forEach(key => {
    if (multiFilters.value[key] && multiFilters.value[key].length > 0) {
      activeMultiFilters[key] = multiFilters.value[key];
    }
  });

  const activeRangeFilters = {};
  Object.keys(rangeFilters.value).forEach(key => {
    if (rangeFilters.value[key]) {
      activeRangeFilters[key] = rangeFilters.value[key];
    }
  });

  const payload = {
    term: searchTerm.value || undefined,
    conditions: conditions.value.length > 0 ? conditions.value : undefined,
    filter_conditions: Object.keys(currentFilter.value).length > 0 ? currentFilter.value : undefined,
    multi_filters: Object.keys(activeMultiFilters).length > 0 ? activeMultiFilters : undefined,
    range_filters: Object.keys(activeRangeFilters).length > 0 ? activeRangeFilters : undefined,
    geo_filter: geoFilter.value || undefined,
    page: 0,
    page_size: 10000, // Fetch all records
  };

  const response = await api.post('/adsearch', payload);
  return response.hits || [];
};

// Handle document export (CSV, XLSX)
const handleDocExport = async (format) => {
  if (total.value === 0) {
    alert('No data to export. Please perform a search first.');
    return;
  }

  isExporting.value = true;

  try {
    const allRecords = await fetchAllRecordsForExport();

    if (allRecords.length === 0) {
      alert('No data to export.');
      return;
    }

    const filename = generateFilename('fishnet2_export');

    const columns = tableFields.value.map(field => ({
      prop: field.prop,
      label: field.label
    }));

    switch (format) {
      case 'csv':
        exportToCSV(allRecords, columns, filename);
        break;
      case 'xlsx':
        await exportToXLSX(allRecords, columns, filename);
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    isExporting.value = false;
  }
};

// Handle GIS export (GeoJSON)
const handleGISExport = async (format) => {
  if (total.value === 0) {
    alert('No data to export. Please perform a search first.');
    return;
  }

  isExporting.value = true;

  try {
    const allRecords = await fetchAllRecordsForExport();

    if (allRecords.length === 0) {
      alert('No data to export.');
      return;
    }

    const filename = generateFilename('fishnet2_geo');

    switch (format) {
      case 'geojson':
        const count = exportRecordsToGeoJSON(allRecords, filename);
        if (count) {
          console.log(`Exported ${count} records with coordinates to GeoJSON`);
        }
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    isExporting.value = false;
  }
};

// Handle chart/map export (PNG, SVG, PDF)
const handleChartExport = async (format) => {
  let targetEl = null;
  let chartTitle = '';

  if (activeView.value !== 'analysis') {
    alert('Please switch to the Analysis tab to export charts.');
    return;
  }

  switch (activeAnalysisTab.value) {
    case 'map':
      targetEl = mapViewRef.value?.$el;
      chartTitle = 'Geographic Distribution';
      break;
    case 'timeline':
      targetEl = timelineViewRef.value?.$el;
      chartTitle = 'Collection Timeline';
      break;
    case 'diversity':
      targetEl = diversityChartRef.value?.$el;
      chartTitle = 'Family Distribution';
      break;
    case 'custom':
      targetEl = customChartRef.value?.$el;
      chartTitle = 'Custom Chart';
      break;
    default:
      alert('Please select a chart to export.');
      return;
  }

  if (!targetEl) {
    alert('View not available for export.');
    return;
  }

  const filename = generateFilename(`fishnet2_${activeView.value}`);

  try {
    switch (format) {
      case 'png':
        await exportChartToPNG(targetEl, filename, chartTitle);
        break;
      case 'svg':
        await exportChartToSVG(targetEl, filename, chartTitle);
        break;
      case 'pdf':
        await exportChartToPDF(targetEl, filename, chartTitle);
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }
};
</script>

<template>
  <div class="search-page">
    <!-- Search Section -->
    <section class="search-section">
      <div class="search-container">
        <!-- Main Search Input -->
        <SearchBox ref="searchBoxRef" :initial-value="searchTerm" @simpleSearch="onSimpleSearch" />

        <!-- Search Options Row -->
        <div class="search-options">
          <AdvancedSearch ref="advancedSearchRef" @search="onAdvancedSearch" />
          <span class="options-divider"></span>
          <GeoFilter
            :initial-filter="geoFilter"
            :default-collapsed="true"
            @filter-apply="onGeoFilterApply"
            @filter-clear="onGeoFilterClear"
          />
        </div>
      </div>
    </section>

    <!-- Initial State: Before Search -->
    <div v-if="searchState === 'initial'" class="initial-state">
      <div class="welcome-section">
        <div class="quick-search">
          <span class="quick-label">Try:</span>
          <button
            v-for="item in quickSearches"
            :key="item.term"
            class="quick-btn"
            @click="onQuickSearch(item.term)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Panel (shown after search) -->
    <StatsPanel v-if="hasSearched" :stats="stats" />

    <!-- Main Content (shown after search) -->
    <main v-if="hasSearched" class="main-content">
      <div class="content-layout">
        <!-- Left Sidebar: History & Filters -->
        <aside class="left-sidebar">
          <!-- Search History -->
          <SearchHistory ref="searchHistoryRef" @load="onLoadSearch" />

          <!-- Geographic Filter Display (shows active filter) -->
          <GeoFilterDisplay
            v-if="geoFilter"
            :filter="geoFilter"
            @clear="onGeoFilterClear"
          />

          <!-- Filter Sidebar -->
          <FilterSidebar
            :aggregations="aggregations"
            :yearBounds="yearBounds"
            @filterChange="onFilterChange"
          />
        </aside>

        <!-- Right Content: Views -->
        <div class="view-area">
          <!-- View Tabs -->
          <div class="view-tabs">
            <div class="tab-group">
              <button
                class="tab-btn"
                :class="{ active: activeView === 'table' }"
                @click="switchTab('table')"
              >
                Table
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeView === 'analysis' }"
                @click="switchTab('analysis')"
              >
                Analysis
              </button>
            </div>
            <div class="tab-actions">
              <!-- Document Export -->
              <el-dropdown trigger="click" @command="handleDocExport" :disabled="isExporting">
                <el-button size="small" :loading="isExporting">
                  Data <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="csv">CSV</el-dropdown-item>
                    <el-dropdown-item command="xlsx">Excel (XLSX)</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- GIS Export -->
              <el-dropdown trigger="click" @command="handleGISExport" :disabled="isExporting">
                <el-button size="small" :loading="isExporting">
                  GIS <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="geojson">GeoJSON</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- Chart/Map Export (only show when in Analysis tab) -->
              <el-dropdown v-if="activeView === 'analysis'" trigger="click" @command="handleChartExport" :disabled="isExporting">
                <el-button size="small">
                  {{ activeAnalysisTab === 'map' ? 'Map' : 'Chart' }} <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="png">PNG</el-dropdown-item>
                    <el-dropdown-item command="svg">SVG</el-dropdown-item>
                    <el-dropdown-item command="pdf">PDF</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- View Content -->
          <div class="view-content">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <div class="loading-text">Searching...</div>
            </div>

            <!-- Empty State -->
            <div v-else-if="searchState === 'empty'" class="empty-state">
              <div class="empty-icon">?</div>
              <div class="empty-title">No results found</div>
              <div class="empty-desc">
                Try adjusting your search terms or filters
              </div>
              <div class="empty-suggestions">
                <p>Suggestions:</p>
                <ul>
                  <li>Check spelling of scientific names</li>
                  <li>Try broader search terms</li>
                  <li>Remove some filter conditions</li>
                </ul>
              </div>
              <div class="empty-actions">
                <button
                  v-for="item in quickSearches.slice(0, 3)"
                  :key="item.term"
                  class="quick-btn"
                  @click="onQuickSearch(item.term)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <!-- Results -->
            <template v-else>
            <!-- Table View -->
            <div v-show="activeView === 'table'" class="view-panel">
              <DataTable
                :rows="tableRows"
                :fields="tableFields"
                :page="page"
                :pageSize="pageSize"
                :total="total"
                @changePage="onPageChange"
                @row-click="onRowClick"
              />
            </div>

            <!-- Analysis View -->
            <div v-show="activeView === 'analysis'" class="view-panel analysis-panel">
              <!-- Analysis Sub-tabs -->
              <div class="analysis-tabs">
                <button
                  v-for="tab in [{id: 'map', label: 'Map'}, {id: 'timeline', label: 'Timeline'}, {id: 'diversity', label: 'Diversity'}, {id: 'custom', label: 'Custom'}]"
                  :key="tab.id"
                  class="analysis-tab-btn"
                  :class="{ active: activeAnalysisTab === tab.id }"
                  @click="switchAnalysisTab(tab.id)"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Analysis Content -->
              <div class="analysis-content">
                <!-- Map View -->
                <div v-show="activeAnalysisTab === 'map'">
                  <MapView ref="mapViewRef" :points="mapPoints" />
                </div>

                <!-- Timeline View -->
                <div v-show="activeAnalysisTab === 'timeline'">
                  <TimelineView ref="timelineViewRef" :data="timelineData" />
                </div>

                <!-- Diversity View -->
                <div v-show="activeAnalysisTab === 'diversity'">
                  <DiversityChart ref="diversityChartRef" title="Family Distribution" :data="chartDiversityData" />
                </div>

                <!-- Custom Chart View -->
                <div v-show="activeAnalysisTab === 'custom'">
                  <CustomChart ref="customChartRef" :searchTerm="searchTerm" :conditions="conditions" />
                </div>
              </div>
            </div>
            </template>
          </div>
        </div>
      </div>
    </main>

    <!-- Record Detail Modal -->
    <RecordDetailModal
      v-model="showDetailModal"
      :record="selectedRecord"
    />
  </div>
</template>

<style scoped>
.search-page {
  min-height: calc(100vh - 200px);
  background: #f5f7fa;
  padding: 16px 24px;
}

.search-section {
  max-width: 700px;
  margin: 0 auto 12px;
}

.search-container {
  position: relative;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.search-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.options-divider {
  width: 1px;
  height: 16px;
  background: #e0e0e0;
  margin: 0 4px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.content-layout {
  display: flex;
  gap: 20px;
}

.left-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.view-area {
  flex: 1;
  min-width: 0;
}

.view-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tab-group {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f5f5f5;
  color: #2c3e50;
}

.tab-btn.active {
  background: #3498db;
  color: white;
}

.tab-actions {
  display: flex;
  gap: 8px;
}

.view-content {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  min-height: 500px;
}

.view-panel {
  padding: 20px;
  min-height: 480px;
}

/* Analysis Panel */
.analysis-panel {
  padding: 0;
}

.analysis-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e9ecef;
  background: #fafafa;
}

.analysis-tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.analysis-tab-btn:hover {
  color: #333;
  background: #f0f0f0;
}

.analysis-tab-btn.active {
  color: #3498db;
  background: white;
  border-bottom-color: #3498db;
}

.analysis-content {
  padding: 20px;
  min-height: 460px;
}

@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
  }
}

/* Initial State */
.initial-state {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
}

.quick-search {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.quick-label {
  color: #888;
  font-size: 14px;
}

.quick-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f0f7ff;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #888;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #888;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.empty-suggestions {
  text-align: left;
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.empty-suggestions p {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.empty-suggestions li {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.empty-actions {
  display: flex;
  gap: 10px;
}
</style>
