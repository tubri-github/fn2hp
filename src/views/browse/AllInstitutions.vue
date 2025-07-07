<template>
  <div class="all-institutions-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Browse All Contributing Data Providers</h1>
      <p class="page-subtitle">Explore data providers and their collections based on Darwin Core institutional fields</p>

      <div class="global-stats" v-if="institutionStats">
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(institutionStats.totalInstitutions) }}</div>
          <div class="global-stat-label">Total Data Providers</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(institutionStats.totalCollectionCodes) }}</div>
          <div class="global-stat-label">Collection Codes</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(institutionStats.totalRecords, 'short') }}</div>
          <div class="global-stat-label">Total Records</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(institutionStats.totalCountries) }}</div>
          <div class="global-stat-label">Countries</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ institutionStats.avgGeoreferenced }}%</div>
          <div class="global-stat-label">Avg. Georeferenced</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ institutionStats.avgDateQuality }}%</div>
          <div class="global-stat-label">Avg. Date Quality</div>
        </div>
      </div>

      <div class="page-actions">
        <button disabled class="action-button export" @click="exportInstitutionReport">
          <span class="action-icon">📊</span> Export Data Providers Report
        </button>
        <button disabled class="action-button network" @click="showCollaborationNetwork">
          <span class="action-icon">🌐</span> Collaboration Network
        </button>
        <button disabled class="action-button quality" @click="showDataQualityAssessment">
          <span class="action-icon">✅</span> Data Quality Assessment
        </button>
        <button disabled class="action-button refresh" @click="refreshStats">
          <span class="action-icon">🔄</span> Refresh Statistics
        </button>
      </div>
    </div>

    <!-- Top Institutions Highlight -->
    <div class="top-institutions" v-if="topInstitutions.length">
      <div class="stats-title">Top Contributing Data Providers</div>
      <div class="top-institutions-grid">
        <div
            v-for="(institution, index) in topInstitutions"
            :key="institution.institutionCode"
            class="top-institution-item"
            @click="navigateToInstitution(institution.institutionCode)"
        >
          <div class="top-institution-rank">{{ index + 1 }}</div>
          <div class="top-institution-code">{{ institution.institutionCode }}</div>
          <div class="top-institution-stats">
            {{ formatNumber(institution.recordCount) }} records<br>
            {{ formatNumber(institution.speciesCount) }} species
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Geographic Distribution -->
    <div class="geo-distribution">
      <div class="stats-title">Data Providers by Geographic Region</div>
      <div class="geo-stats">
        <div class="geo-region" @click="filterByRegion('North America')">
          <div class="geo-region-name">North America</div>
          <div class="geo-region-count">{{ institutionStats.northAmericaInstitutions || 0 }}</div>
          <div class="geo-region-desc">Data Providers contributing</div>
        </div>
        <div class="geo-region" @click="filterByRegion('Europe')">
          <div class="geo-region-name">Europe</div>
          <div class="geo-region-count">{{ institutionStats.europeInstitutions || 0 }}</div>
          <div class="geo-region-desc">Data Providers contributing</div>
        </div>
        <div class="geo-region" @click="filterByRegion('Asia-Pacific')">
          <div class="geo-region-name">Asia-Pacific</div>
          <div class="geo-region-count">{{ institutionStats.asiaPacificInstitutions || 0 }}</div>
          <div class="geo-region-desc">Data Providers contributing</div>
        </div>
        <div class="geo-region" @click="filterByRegion('Other')">
          <div class="geo-region-name">Other Regions</div>
          <div class="geo-region-count">{{ institutionStats.otherRegionsInstitutions || 0 }}</div>
          <div class="geo-region-desc">Data Providers contributing</div>
        </div>
      </div>
    </div>

    <!-- Enhanced Institution Categories -->
    <div class="quick-stats">
      <div class="stats-title">Data Providers Categories</div>
      <div class="stats-grid">
        <div class="stat-category">
          <div class="stat-category-title">Major Contributors</div>
          <div class="stat-category-value">{{ institutionStats.majorContributors || 0 }}</div>
          <div class="stat-category-desc">>10,000 records each</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Active Contributors</div>
          <div class="stat-category-value">{{ institutionStats.activeContributors || 0 }}</div>
          <div class="stat-category-desc">1,000-10,000 records</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Research Collections</div>
          <div class="stat-category-value">{{ institutionStats.researchCollections || 0 }}</div>
          <div class="stat-category-desc">Universities & museums</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">High Quality Data</div>
          <div class="stat-category-value">{{ institutionStats.highQualityData || 0 }}</div>
          <div class="stat-category-desc">>90% georeferencing</div>
        </div>
      </div>
    </div>

    <!-- Collection Analytics -->
    <div class="collection-analytics">
      <div class="stats-title">Collection Analytics</div>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-header">
            <h3>Collection Diversity</h3>
            <span class="analytics-icon">📚</span>
          </div>
          <div class="analytics-metrics">
            <div class="metric">
              <span class="metric-label">Data Providers with Collections:</span>
              <span class="metric-value">{{ institutionStats.institutionsWithCollections || 0 }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Unique Collection Codes:</span>
              <span class="metric-value">{{ institutionStats.uniqueCollectionCodes || 0 }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Avg Collections per Institution:</span>
              <span class="metric-value">{{ institutionStats.avgCollectionsPerInstitution || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="analytics-header">
            <h3>Temporal Coverage</h3>
            <span class="analytics-icon">📅</span>
          </div>
          <div class="analytics-metrics">
            <div class="metric">
              <span class="metric-label">Recent Records (2020+):</span>
              <span class="metric-value">{{ formatNumber(institutionStats.recentRecords, 'short') || '0' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Last Decade (2010-2019):</span>
              <span class="metric-value">{{ formatNumber(institutionStats.decadeRecords, 'short') || '0' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Historical Records (<2000):</span>
              <span class="metric-value">{{ formatNumber(institutionStats.historicalRecords, 'short') || '0' }}</span>
            </div>
          </div>
        </div>

        <div class="analytics-card">
          <div class="analytics-header">
            <h3>Data Quality Overview</h3>
            <span class="analytics-icon">⭐</span>
          </div>
          <div class="analytics-metrics">
            <div class="metric">
              <span class="metric-label">Average Georeferencing:</span>
              <span class="metric-value">{{ institutionStats.avgGeoreferenced || 0 }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Average Date Quality:</span>
              <span class="metric-value">{{ institutionStats.avgDateQuality || 0 }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Last Updated:</span>
              <span class="metric-value">{{ formatCalculationTime(institutionStats.calculatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="controls-section">
      <div class="controls-grid">
        <input
            type="text"
            class="search-input"
            placeholder="Search by institutionCode, institution name, or country..."
            v-model="searchQuery"
            @input="debouncedSearch"
        />
        <select class="filter-select" v-model="filters.region" @change="applyFilters">
          <option value="">All Regions</option>
          <option v-for="region in availableRegions" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
        <select class="filter-select" v-model="filters.recordCount" @change="applyFilters">
          <option value="">All Record Counts</option>
          <option value="major">Major (>10,000)</option>
          <option value="medium">Medium (1,000-10,000)</option>
          <option value="small">Small (<1,000)</option>
        </select>
        <select class="filter-select" v-model="filters.institutionType" @change="applyFilters">
          <option value="">All Data Providers Types</option>
          <option value="museum">Museums</option>
          <option value="university">Universities</option>
          <option value="government">Government</option>
          <option value="private">Private</option>
        </select>
        <select class="filter-select" v-model="filters.sortBy" @change="applyFilters">
          <option value="records_desc">Sort by Records</option>
          <option value="species_desc">Sort by Species</option>
          <option value="quality_desc">Sort by Quality</option>
          <option value="name_asc">Sort by Name</option>
        </select>
        <div class="view-toggle">
          <button
              class="view-btn"
              :class="{ active: viewMode === 'cards' }"
              @click="viewMode = 'cards'"
          >
            Cards
          </button>
          <button
              class="view-btn"
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
          >
            Table
          </button>
        </div>
      </div>
    </div>

    <!-- Institutions Container -->
    <div class="institutions-container">
      <div class="institutions-header">
        <div class="institutions-title">All Contributing Data Providers</div>
        <div class="results-info">Showing {{ filteredInstitutions.length }} Data Providers</div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading institutions...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadInstitutions" class="retry-button">Retry</button>
      </div>

      <!-- Card View -->
      <div v-else-if="viewMode === 'cards'" class="institutions-grid">
        <div
            v-for="institution in paginatedInstitutions"
            :key="institution.institutionCode"
            class="institution-card"
            @click="navigateToInstitution(institution.institutionCode)"
        >
          <div class="institution-card-header">
            <div class="institution-logo">{{ institution.institutionCode }}</div>
            <div class="institution-info">
              <h3 class="institution-name">{{ institution.institutionName }}</h3>
              <div class="institution-codes">
                <span class="institution-code-tag">
                  <span class="dc-field">institutionCode:</span> {{ institution.institutionCode }}
                </span>
                <span v-if="institution.ownerInstitutionCode" class="institution-code-tag">
                  <span class="dc-field">ownerInstitutionCode:</span> {{ institution.ownerInstitutionCode }}
                </span>
              </div>
              <div class="institution-location">{{ formatLocation(institution) }}</div>
            </div>
          </div>
          <div class="institution-stats-row">
            <div class="institution-stat">
              <div class="institution-stat-number">{{ formatNumber(institution.recordCount) }}</div>
              <div class="institution-stat-label">Records</div>
            </div>
            <div class="institution-stat">
              <div class="institution-stat-number">{{ formatNumber(institution.speciesCount) }}</div>
              <div class="institution-stat-label">Species</div>
            </div>
            <div class="institution-stat">
              <div class="institution-stat-number">{{ formatNumber(institution.familiesCount) }}</div>
              <div class="institution-stat-label">Families</div>
            </div>
            <div class="institution-stat">
              <div class="institution-stat-number">{{ formatNumber(institution.countriesCount) }}</div>
              <div class="institution-stat-label">Countries</div>
            </div>
          </div>
          <div class="institution-meta">
            <span>Last updated: {{ formatDate(institution.lastUpdated) }}</span>
            <div class="institution-quality">
              <span
                  class="quality-badge"
                  :class="getQualityClass(institution.geoReferencingQuality)"
              >
                Geo: {{ institution.geoReferencingQuality }}%
              </span>
              <span
                  class="quality-badge"
                  :class="getQualityClass(institution.dateQuality)"
              >
                Date: {{ institution.dateQuality }}%
              </span>
            </div>
          </div>
          <div class="collection-codes" v-if="institution.collectionCodes">
            <div class="collection-codes-label">
              <span class="dc-field">collectionCode</span> values:
            </div>
            <div class="collection-code-list">
              <span
                  v-for="code in institution.collectionCodes.slice(0, 3)"
                  :key="code"
                  class="collection-code"
              >
                {{ code }}
              </span>
              <span
                  v-if="institution.collectionCodes.length > 3"
                  class="collection-code more"
              >
                +{{ institution.collectionCodes.length - 3 }} more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <table v-else class="institutions-table">
        <thead>
        <tr>
          <th><span class="dc-field">institutionCode</span></th>
          <th>Data Provider Name</th>
          <th><span class="dc-field">ownerInstitutionCode</span></th>
          <th>Country</th>
          <th>Records</th>
          <th>Species</th>
          <th><span class="dc-field">collectionCode</span> Count</th>
          <th>Georeferenced</th>
          <th>Date Quality</th>
          <th>Last Updated</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="institution in paginatedInstitutions"
            :key="institution.institutionCode"
            @click="navigateToInstitution(institution.institutionCode)"
            class="clickable-row"
        >
          <td><span class="table-institution-code">{{ institution.institutionCode }}</span></td>
          <td><span class="table-institution-name">{{ institution.institutionName }}</span></td>
          <td>{{ institution.ownerInstitutionCode || '—' }}</td>
          <td>{{ institution.country }}</td>
          <td>{{ formatNumber(institution.recordCount) }}</td>
          <td>{{ formatNumber(institution.speciesCount) }}</td>
          <td>{{ institution.collectionCodes ? institution.collectionCodes.length : 0 }}</td>
          <td>{{ institution.geoReferencingQuality }}%</td>
          <td>{{ institution.dateQuality }}%</td>
          <td>{{ formatDate(institution.lastUpdated) }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
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

        <div class="pagination-info">
          Showing {{ (pagination.page - 1) * pagination.perPage + 1 }}-{{ Math.min(pagination.page * pagination.perPage, filteredInstitutions.length) }}
          of {{ filteredInstitutions.length }} institutions
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInstitutions } from '@/composables/useInstitutions.js'
import { debounce } from 'lodash-es'

const router = useRouter()

// 使用 composable
const {
  loading,
  error,
  institutions,
  institutionStats,
  fetchInstitutions,
  fetchInstitutionStats
} = useInstitutions()

// 本地状态
const viewMode = ref('cards')
const searchQuery = ref('')
const filters = ref({
  region: '',
  recordCount: '',
  institutionType: '',
  sortBy: 'records_desc'
})
const pagination = ref({
  page: 1,
  perPage: 25
})

// 可用选项
const availableRegions = ref([])

// 计算属性
const topInstitutions = computed(() => {
  return institutions.value
      .slice()
      .sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))
      .slice(0, 5)
})

const filteredInstitutions = computed(() => {
  let filtered = institutions.value

  // 应用搜索过滤
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(institution =>
        institution.institutionCode?.toLowerCase().includes(search) ||
        institution.institutionName?.toLowerCase().includes(search) ||
        institution.country?.toLowerCase().includes(search)
    )
  }

  // 应用地区过滤
  if (filters.value.region) {
    filtered = filtered.filter(institution => institution.region === filters.value.region)
  }

  // 应用记录数过滤
  if (filters.value.recordCount) {
    filtered = filtered.filter(institution => {
      const count = institution.recordCount || 0
      switch (filters.value.recordCount) {
        case 'major': return count > 10000
        case 'medium': return count >= 1000 && count <= 10000
        case 'small': return count < 1000
        default: return true
      }
    })
  }

  // 应用机构类型过滤
  if (filters.value.institutionType) {
    filtered = filtered.filter(institution =>
        institution.institutionType === filters.value.institutionType
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'records_desc':
        return (b.recordCount || 0) - (a.recordCount || 0)
      case 'species_desc':
        return (b.speciesCount || 0) - (a.speciesCount || 0)
      case 'quality_desc':
        return (b.geoReferencingQuality || 0) - (a.geoReferencingQuality || 0)
      case 'name_asc':
        return (a.institutionName || '').localeCompare(b.institutionName || '')
      default:
        return 0
    }
  })

  return filtered
})

const paginatedInstitutions = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredInstitutions.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredInstitutions.value.length / pagination.value.perPage)
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

// 方法
const loadInstitutions = async () => {
  try {
    await fetchInstitutions()
    extractRegionOptions()
  } catch (err) {
    console.error('Failed to load institutions:', err)
  }
}

const loadStats = async () => {
  try {
    await fetchInstitutionStats()
  } catch (err) {
    console.error('Failed to load institution stats:', err)
  }
}

const refreshStats = async () => {
  try {
    await loadStats()
    console.log('Statistics refreshed successfully')
  } catch (err) {
    console.error('Failed to refresh statistics:', err)
  }
}

const extractRegionOptions = () => {
  const regions = [...new Set(institutions.value.map(i => i.region).filter(Boolean))]
  availableRegions.value = regions.sort()
}

const navigateToInstitution = (institutionCode) => {
  router.push({
    name: 'InstitutionDetail',
    params: { institutionCode }
  })
}

const filterByRegion = (regionName) => {
  filters.value.region = regionName
  applyFilters()
}

const applyFilters = () => {
  pagination.value.page = 1
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.page = page
  }
}

// 工具函数
const formatNumber = (num, format = 'full') => {
  if (!num) return '0'

  if (format === 'short') {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
  }

  return num.toLocaleString()
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

const formatLocation = (institution) => {
  const parts = []
  if (institution.locality) parts.push(institution.locality)
  if (institution.stateProvince) parts.push(institution.stateProvince)
  if (institution.country) parts.push(institution.country)
  return parts.join(', ') || 'Location not specified'
}

const formatCalculationTime = (timestamp) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
  return date.toLocaleDateString()
}

const getQualityClass = (percentage) => {
  if (percentage >= 90) return 'quality-excellent'
  if (percentage >= 80) return 'quality-good'
  return 'quality-fair'
}

// 操作按钮方法
const exportInstitutionReport = () => {
  console.log('Exporting institution report...')
}

const showCollaborationNetwork = () => {
  console.log('Opening collaboration network...')
}

const showDataQualityAssessment = () => {
  console.log('Starting data quality assessment...')
}

// 生命周期
onMounted(() => {
  loadInstitutions()
  loadStats()
})

// 监听搜索变化
watch(() => searchQuery.value, debouncedSearch)
</script>

<style scoped>
/* 页面基础样式 */
.all-institutions-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 25px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.global-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.global-stat {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.global-stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.global-stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.page-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-button.export { background: #e8f5e9; color: #2e7d32; }
.action-button.network { background: #fff3e0; color: #f57c00; }
.action-button.quality { background: #e8f4fd; color: #0288d1; }
.action-button.refresh { background: #f3e5f5; color: #7b1fa2; }

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-icon { margin-right: 5px; }

/* Top institutions highlight */
.top-institutions {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.stats-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.top-institutions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.top-institution-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.top-institution-item:hover {
  transform: translateY(-2px);
}

.top-institution-rank {
  background: #3498db;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 10px;
}

.top-institution-code {
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
  font-size: 16px;
}

.top-institution-stats {
  font-size: 12px;
  color: #666;
}

/* Geographic distribution */
.geo-distribution {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.geo-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.geo-region {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.geo-region:hover {
  background-color: #e9ecef;
}

.geo-region-name {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.geo-region-count {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.geo-region-desc {
  font-size: 12px;
  color: #666;
}

/* Quick stats */
.quick-stats {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-category {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.stat-category-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.stat-category-value {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
}

.stat-category-desc {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* Collection Analytics */
.collection-analytics {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.analytics-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.analytics-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.analytics-icon {
  font-size: 20px;
}

.analytics-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.metric:last-child {
  border-bottom: none;
}

.metric-label {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.metric-value {
  font-weight: bold;
  color: #2c3e50;
  margin-left: 10px;
}

/* Search and filter controls */
.controls-section {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr) 120px;
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

.view-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.view-btn.active {
  background: #3498db;
  color: white;
}

/* Institutions container */
.institutions-container {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
}

.institutions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.institutions-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.results-info {
  color: #666;
  font-size: 14px;
}

/* Card view */
.institutions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.institution-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.institution-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.institution-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.institution-logo {
  width: 50px;
  height: 50px;
  background: #3498db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.institution-info {
  flex: 1;
}

.institution-name {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 5px 0;
  line-height: 1.3;
}

.institution-codes {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.institution-code-tag {
  background: #e8f4fd;
  color: #0288d1;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.institution-location {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.institution-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.institution-stat {
  text-align: center;
  background: white;
  border-radius: 6px;
  padding: 8px;
}

.institution-stat-number {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 2px;
}

.institution-stat-label {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.institution-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.institution-quality {
  display: flex;
  gap: 6px;
}

.quality-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.quality-excellent { background: #d4edda; color: #155724; }
.quality-good { background: #fff3cd; color: #856404; }
.quality-fair { background: #f8d7da; color: #721c24; }

.collection-codes {
  margin-top: 12px;
}

.collection-codes-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.collection-code-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.collection-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  color: #666;
}

.collection-code.more {
  background: #e8f4fd;
  color: #0288d1;
  font-style: italic;
}

/* Table view */
.institutions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.institutions-table th, .institutions-table td {
  border-bottom: 1px solid #eee;
  padding: 12px;
  text-align: left;
}

.institutions-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #555;
  position: sticky;
  top: 0;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f8f9fa;
}

.table-institution-code {
  font-weight: bold;
  color: #2c3e50;
}

.table-institution-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover, .pagination-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

/* Responsive */
@media (max-width: 1024px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .global-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .institutions-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid, .geo-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .institutions-grid {
    grid-template-columns: 1fr;
  }

  .top-institutions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>