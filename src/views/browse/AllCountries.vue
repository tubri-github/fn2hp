<template>
  <div class="all-countries-page">
    <!-- Page Header -->
    <div class="page-header">
      <span class="eyebrow">Browse</span>
      <h1 class="page-title">Browse Countries</h1>
      <p class="page-subtitle">
        Explore fish specimen records by country. Each country links to a
        detail page with state-level breakdowns and top contributing institutions.
      </p>
    </div>

    <!-- World choropleth -->
    <WorldChoroplethMap
      v-if="allCountriesForMap.length"
      class="world-map-block"
      :data="allCountriesForMap"
      @country-click="navigateToCountry"
    />
    <div v-else-if="mapLoadError" class="map-load-error">
      Failed to load world map data: {{ mapLoadError }}
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by country code or name..."
        class="search-input"
        @input="onSearchInput"
      />
      <select v-model="filters.recordCount" class="filter-select" @change="loadCountries(1)">
        <option value="">All Sizes</option>
        <option value="major">Major (&gt; 100K records)</option>
        <option value="medium">Medium (1K – 100K)</option>
        <option value="small">Small (&lt; 1K)</option>
      </select>
      <select v-model="filters.sortBy" class="filter-select" @change="loadCountries(1)">
        <option value="records_desc">Sort by Records</option>
        <option value="species_desc">Sort by Species</option>
        <option value="name_asc">Sort by Name (A–Z)</option>
        <option value="code_asc">Sort by Code (A–Z)</option>
      </select>
    </div>

    <!-- Table -->
    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <div v-else-if="!countries.length" class="state-msg">No countries match your filters.</div>
    <div v-else class="table-container">
      <table class="countries-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Country</th>
            <th>Records</th>
            <th>Species</th>
            <th>Families</th>
            <th>Institutions</th>
            <th>States</th>
            <th>Georeferenced</th>
            <th>Date Quality</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in countries"
            :key="c.countryCode"
            class="table-row"
            @click="navigateToCountry(c.countryCode)"
          >
            <td><span class="code-badge">{{ c.countryCode }}</span></td>
            <td><span class="country-name">{{ displayName(c) }}</span></td>
            <td>{{ formatNumber(c.recordCount) }}</td>
            <td>{{ formatNumber(c.speciesCount) }}</td>
            <td>{{ formatNumber(c.familiesCount) }}</td>
            <td>{{ formatNumber(c.institutionsCount) }}</td>
            <td>{{ formatNumber(c.statesCount) }}</td>
            <td>
              <span class="quality-badge" :class="qualityClass(c.georeferencingQuality)">
                {{ c.georeferencingQuality }}%
              </span>
            </td>
            <td>
              <span class="quality-badge" :class="qualityClass(c.dateQuality)">
                {{ c.dateQuality }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click="loadCountries(1)" class="page-btn">First</button>
      <button :disabled="page === 1" @click="loadCountries(page - 1)" class="page-btn">Prev</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }} · {{ formatNumber(total) }} countries</span>
      <button :disabled="page === totalPages" @click="loadCountries(page + 1)" class="page-btn">Next</button>
      <button :disabled="page === totalPages" @click="loadCountries(totalPages)" class="page-btn">Last</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import { countriesApi } from '@/api/countries.js'
import WorldChoroplethMap from '@/components/charts/WorldChoroplethMap.vue'

const router = useRouter()

const countries = ref([])
const total = ref(0)
const page = ref(1)
const perPage = 50
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filters = reactive({
  recordCount: '',
  sortBy: 'records_desc',
})

// Separate dataset for the choropleth map: every country in one shot,
// independent of the paginated/filtered table below.
const allCountriesForMap = ref([])
const mapLoadError = ref('')

const loadAllForMap = async () => {
  mapLoadError.value = ''
  try {
    const r = await countriesApi.getCountries({ page: 1, per_page: 500, sort_by: 'records_desc' })
    allCountriesForMap.value = r.data || []
  } catch (e) {
    const msg = e?.response?.data?.detail || e?.message || String(e)
    mapLoadError.value = msg
    console.error('Failed to load countries for choropleth:', e)
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const loadCountries = async (newPage = 1) => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: newPage,
      per_page: perPage,
      sort_by: filters.sortBy,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (filters.recordCount) params.record_count = filters.recordCount
    const r = await countriesApi.getCountries(params)
    countries.value = r.data || []
    total.value = r.total || 0
    page.value = newPage
  } catch (e) {
    error.value = e?.message || 'Failed to load countries'
    countries.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const onSearchInput = debounce(() => loadCountries(1), 300)

const navigateToCountry = (code) => {
  router.push({ name: 'CountryDetail', params: { countryCode: code } })
}

// Display name: prefer the dirty-but-real backend value; if it looks identical
// to (or weaker than) the ISO code, fall back to the code itself so the column
// never shows a blank cell.
const displayName = (c) => {
  if (c.countryName && c.countryName.trim().length > 2) return c.countryName
  return c.countryCode
}

const formatNumber = (n) => (n ?? 0).toLocaleString('en-US')

const qualityClass = (q) => {
  if (q >= 80) return 'quality-high'
  if (q >= 50) return 'quality-mid'
  return 'quality-low'
}

onMounted(() => {
  loadCountries(1)
  loadAllForMap()
})
</script>

<style scoped>
.all-countries-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px 64px;
  font-family: 'Inter', sans-serif;
}

.page-header {
  margin-bottom: 32px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2c7cb9;
}
.eyebrow::before {
  content: '';
  width: 24px;
  height: 2px;
  background: #2c7cb9;
  border-radius: 2px;
  margin-right: 10px;
}

.page-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.12;
  margin: 14px 0 0;
  color: #16232e;
}

.page-subtitle {
  font-size: clamp(15px, 2vw, 18px);
  color: #566672;
  line-height: 1.6;
  margin: 12px 0 0;
  max-width: 70ch;
}

.world-map-block {
  margin-bottom: 24px;
}

.map-load-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 24px;
  font-size: 13px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1 1 240px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.state-msg {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.state-msg.error {
  color: #d73027;
}

.table-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.countries-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.countries-table thead {
  background: #f8f9fa;
}

.countries-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.countries-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f3f5;
}

.table-row {
  cursor: pointer;
  transition: background 0.12s;
}

.table-row:hover {
  background: #f8f9fa;
}

.code-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e7f3ff;
  color: #2c7cb9;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-weight: 600;
  font-size: 12px;
}

.country-name {
  font-weight: 500;
  color: #2c3e50;
}

.quality-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.quality-high { background: #d4edda; color: #155724; }
.quality-mid  { background: #fff3cd; color: #856404; }
.quality-low  { background: #f8d7da; color: #721c24; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #666;
}

@media (max-width: 640px) {
  .all-countries-page {
    overflow-x: hidden;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>