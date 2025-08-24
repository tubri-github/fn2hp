<template>
  <div class="records-table-container">
    <!-- Table Header -->
    <div class="table-header">
      <div class="header-info">
        <h3 class="table-title">{{ getTableTitle() }}</h3>
        <p class="table-subtitle">{{ getTableSubtitle() }}</p>
      </div>

      <div class="header-actions" v-if="showExport">
        <button @click="exportRecords" class="export-button">
          <span class="icon">📊</span>
          Export Records
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div v-if="showSearch" class="search-filters">
      <div class="search-row">
        <input
            type="text"
            placeholder="Search records by collector, locality, or catalog number..."
            v-model="searchQuery"
            class="search-input"
        />
        <select v-model="selectedYear" class="filter-select">
          <option value="">All Years</option>
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <select v-model="selectedCountry" class="filter-select">
          <option value="">All Countries</option>
          <option v-for="country in availableCountries" :key="country" :value="country">
            {{ country }}
          </option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="date_desc">Most Recent</option>
          <option value="date_asc">Oldest First</option>
          <option value="collector_asc">Collector (A-Z)</option>
          <option value="locality_asc">Locality (A-Z)</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading records...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadRecords" class="retry-button">Retry</button>
    </div>

    <!-- Records Table -->
    <div v-else class="table-wrapper">
      <table class="records-table">
        <thead>
        <tr>
          <th><span class="dc-field">catalogNumber</span></th>
          <th><span class="dc-field">scientificName</span></th>
          <th><span class="dc-field">recordedBy</span></th>
          <th><span class="dc-field">eventDate</span></th>
          <th><span class="dc-field">country</span></th>
          <th><span class="dc-field">locality</span></th>
          <th><span class="dc-field">institutionCode</span></th>
          <th>Quality</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="record in filteredRecords"
            :key="record.id"
            class="record-row"
            @click="viewRecordDetail(record)"
        >
          <td class="catalog-number">{{ record.catalogNumber }}</td>
          <td class="scientific-name">
            <router-link
                :to="{ name: 'SpeciesDetail', params: { scientificName: encodeURIComponent(record.scientificName) } }"
                class="species-link"
                @click.stop
            >
              {{ record.scientificName }}
            </router-link>
          </td>
          <td class="recorded-by">{{ record.recordedBy || '—' }}</td>
          <td class="event-date">{{ formatDate(record.eventDate) }}</td>
          <td class="country">{{ record.country || '—' }}</td>
          <td class="locality">
              <span
                  class="locality-text"
                  :title="record.locality"
              >
                {{ truncateText(record.locality, 50) }}
              </span>
          </td>
          <td class="institution-code">
            <router-link
                :to="{ name: 'InstitutionDetail', params: { institutionCode: record.institutionCode } }"
                class="institution-link"
                @click.stop
            >
              {{ record.institutionCode }}
            </router-link>
          </td>
          <td class="quality">
            <div class="quality-indicators">
              <div
                  class="quality-dot"
                  :class="getQualityClass('geo', record.decimalLatitude, record.decimalLongitude)"
                  title="Geographic coordinates quality"
              ></div>
              <div
                  class="quality-dot"
                  :class="getQualityClass('date', record.eventDate)"
                  title="Date quality"
              ></div>
              <div
                  class="quality-dot"
                  :class="getQualityClass('taxonomy', record.scientificName)"
                  title="Taxonomic identification quality"
              ></div>
            </div>
          </td>
          <td class="actions">
            <button
                @click.stop="viewRecordDetail(record)"
                class="action-button view"
                title="View record details"
            >
              +
            </button>
            <button
                @click.stop="viewOnMap(record)"
                class="action-button map"
                title="View on map"
                :disabled="!record.decimalLatitude || !record.decimalLongitude"
            >
              🗺
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredRecords.length === 0 && !loading" class="empty-state">
        <p>No records found matching your criteria.</p>
        <button @click="clearFilters" class="clear-filters-button">Clear Filters</button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.perPage" class="pagination">
      <div class="pagination-info">
        Showing {{ (pagination.page - 1) * pagination.perPage + 1 }}-{{ Math.min(pagination.page * pagination.perPage, pagination.total) }}
        of {{ pagination.total }} records
      </div>

      <div class="pagination-controls">
        <button
            class="pagination-btn"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
        >
          « Previous
        </button>

        <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === pagination.page }"
            @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
            class="pagination-btn"
            :disabled="pagination.page === totalPages"
            @click="changePage(pagination.page + 1)"
        >
          Next »
        </button>
      </div>

      <div class="per-page-selector">
        <label>Per page:</label>
        <select v-model="pagination.perPage" @change="changePerPage">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Record Detail Modal -->
    <RecordDetailModal
        v-if="selectedRecord"
        :record="selectedRecord"
        @close="selectedRecord = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { recordsApi } from '@/api/records.js'
import RecordDetailModal from './RecordDetailModal.vue'

// Props
const props = defineProps({
  taxonType: {
    type: String,
    default: null
  },
  taxonName: {
    type: String,
    default: null
  },
  institutionCode: {
    type: String,
    default: null
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: String,
    default: '600px'
  }
})

// Reactive state
const loading = ref(false)
const error = ref(null)
const records = ref([])
const selectedRecord = ref(null)

// Filters and search
const searchQuery = ref('')
const selectedYear = ref('')
const selectedCountry = ref('')
const sortBy = ref('date_desc')

// Available filter options
const availableYears = ref([])
const availableCountries = ref([])

// Pagination
const pagination = ref({
  page: 1,
  perPage: 50,
  total: 0
})

// Computed properties
const filteredRecords = computed(() => {
  let filtered = records.value

  // Apply search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(record =>
        (record.catalogNumber && record.catalogNumber.toLowerCase().includes(search)) ||
        (record.scientificName && record.scientificName.toLowerCase().includes(search)) ||
        (record.recordedBy && record.recordedBy.toLowerCase().includes(search)) ||
        (record.locality && record.locality.toLowerCase().includes(search))
    )
  }

  // Apply year filter
  if (selectedYear.value) {
    filtered = filtered.filter(record =>
        record.eventDate && new Date(record.eventDate).getFullYear().toString() === selectedYear.value
    )
  }

  // Apply country filter
  if (selectedCountry.value) {
    filtered = filtered.filter(record => record.country === selectedCountry.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date_desc':
        return new Date(b.eventDate || 0) - new Date(a.eventDate || 0)
      case 'date_asc':
        return new Date(a.eventDate || 0) - new Date(b.eventDate || 0)
      case 'collector_asc':
        return (a.recordedBy || '').localeCompare(b.recordedBy || '')
      case 'locality_asc':
        return (a.locality || '').localeCompare(b.locality || '')
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(pagination.value.total / pagination.value.perPage)
})

const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = totalPages.value
  const delta = 2
  const range = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    range.unshift('...')
  }
  if (current + delta < total - 1) {
    range.push('...')
  }

  range.unshift(1)
  if (total > 1) {
    range.push(total)
  }

  return range.filter((item, index, array) => array.indexOf(item) === index)
})

// Methods
const loadRecords = async () => {
  loading.value = true
  error.value = null

  try {
    let response

    if (props.taxonType && props.taxonName) {
      response = await recordsApi.getRecordsByTaxon(props.taxonType, props.taxonName, {
        page: pagination.value.page,
        per_page: pagination.value.perPage
      })
    } else if (props.institutionCode) {
      response = await recordsApi.getRecordsByInstitution(props.institutionCode, {
        page: pagination.value.page,
        per_page: pagination.value.perPage
      })
    } else {
      response = await recordsApi.getRecords({
        page: pagination.value.page,
        per_page: pagination.value.perPage
      })
    }

    records.value = response.data || generateMockRecords()
    pagination.value.total = response.total || records.value.length

    // Extract filter options
    extractFilterOptions()

  } catch (err) {
    error.value = err.message || 'Failed to load records'
    console.error('Error loading records:', err)
  } finally {
    loading.value = false
  }
}

const generateMockRecords = () => {
  const countries = ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina']
  const collectors = ['J. Smith', 'M. Johnson', 'A. Brown', 'S. Davis', 'R. Wilson']
  const species = ['Cyprinus carpio', 'Perca fluviatilis', 'Salmo trutta', 'Micropterus salmoides']
  const institutions = ['NMNH', 'AMNH', 'CAS', 'FLMNH', 'KU']

  return Array.from({ length: 50 }, (_, i) => ({
    id: `record_${i + 1}`,
    catalogNumber: `${institutions[i % institutions.length]}_${(Math.floor(Math.random() * 90000) + 10000)}`,
    scientificName: species[i % species.length],
    recordedBy: collectors[i % collectors.length],
    eventDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 10).toISOString().split('T')[0],
    country: countries[i % countries.length],
    locality: `Sample locality ${i + 1}, detailed location information here`,
    institutionCode: institutions[i % institutions.length],
    decimalLatitude: (Math.random() * 180 - 90).toFixed(6),
    decimalLongitude: (Math.random() * 360 - 180).toFixed(6),
    collectionCode: 'Fish',
    basisOfRecord: 'PreservedSpecimen'
  }))
}

const extractFilterOptions = () => {
  // Extract unique years
  const years = [...new Set(records.value
      .filter(r => r.eventDate)
      .map(r => new Date(r.eventDate).getFullYear())
  )].sort((a, b) => b - a)
  availableYears.value = years

  // Extract unique countries
  const countries = [...new Set(records.value
      .filter(r => r.country)
      .map(r => r.country)
  )].sort()
  availableCountries.value = countries
}

const getTableTitle = () => {
  if (props.taxonType && props.taxonName) {
    return `Records for ${props.taxonName}`
  } else if (props.institutionCode) {
    return `Records from ${props.institutionCode}`
  }
  return 'All Records'
}

const getTableSubtitle = () => {
  if (props.taxonType && props.taxonName) {
    return `Specimen and observation records for ${props.taxonType} ${props.taxonName}`
  } else if (props.institutionCode) {
    return `All specimen and observation records contributed by ${props.institutionCode}`
  }
  return 'Browse all specimen and observation records in the database'
}

const viewRecordDetail = (record) => {
  selectedRecord.value = record
}

const viewOnMap = (record) => {
  // Implement map view functionality
  console.log('View record on map:', record)
}

const exportRecords = () => {
  // Implement export functionality
  console.log('Exporting records...')
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedYear.value = ''
  selectedCountry.value = ''
  sortBy.value = 'date_desc'
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.page = page
    loadRecords()
  }
}

const changePerPage = () => {
  pagination.value.page = 1
  loadRecords()
}

// Utility functions
const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

const truncateText = (text, maxLength) => {
  if (!text) return '—'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getQualityClass = (type, ...values) => {
  switch (type) {
    case 'geo':
      return values[0] && values[1] ? 'quality-excellent' : 'quality-poor'
    case 'date':
      return values[0] ? 'quality-excellent' : 'quality-poor'
    case 'taxonomy':
      return values[0] ? 'quality-good' : 'quality-poor'
    default:
      return 'quality-poor'
  }
}

// Lifecycle
onMounted(() => {
  loadRecords()
})

// Watch for prop changes
watch(() => [props.taxonType, props.taxonName, props.institutionCode], () => {
  pagination.value.page = 1
  loadRecords()
})
</script>

<style scoped>
.records-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.header-info {
  flex: 1;
}

.table-title {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.table-subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.export-button:hover {
  background: #229954;
  transform: translateY(-1px);
}

/* Search and Filters */
.search-filters {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.search-row {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 15px;
  align-items: center;
}

.search-input, .filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input {
  background: #f8f9fa;
}

.filter-select {
  background: white;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  max-height: v-bind(maxHeight);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.records-table th,
.records-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.records-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #555;
  position: sticky;
  top: 0;
  z-index: 1;
}

.record-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.record-row:hover {
  background-color: #f8f9fa;
}

.catalog-number {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #2c3e50;
}

.scientific-name {
  font-style: italic;
}

.species-link, .institution-link {
  color: #3498db;
  text-decoration: none;
}

.species-link:hover, .institution-link:hover {
  text-decoration: underline;
}

.locality-text {
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quality-indicators {
  display: flex;
  gap: 4px;
}

.quality-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.quality-excellent { background: #27ae60; }
.quality-good { background: #f39c12; }
.quality-poor { background: #e74c3c; }

.actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.action-button:hover:not(:disabled) {
  background: #3498db;
  border-color: #3498db;
  transform: scale(1.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
}

/* States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button, .clear-filters-button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 5px;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled),
.pagination-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.per-page-selector select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .search-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .table-header {
    padding: 15px 20px;
  }

  .search-filters {
    padding: 15px 20px;
  }

  .records-table th,
  .records-table td {
    padding: 8px;
    font-size: 13px;
  }

  .locality-text {
    max-width: 150px;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>