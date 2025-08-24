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
      </div>

      <div class="page-actions">
        <button class="action-button export" @click="exportInstitutionReport">
          <span class="action-icon">📊</span> Export Data Providers Report
        </button>
        <button class="action-button network" @click="showCollaborationNetwork">
          <span class="action-icon">🌐</span> Collaboration Network
        </button>
        <button class="action-button quality" @click="showDataQualityAssessment">
          <span class="action-icon">✅</span> Data Quality Assessment
        </button>
      </div>
    </div>
    <WorldMap
        :map-data="transformedMapData"
        :loading="loading"
        @provider-clicked="navigateToInstitution"
    />

<!--    &lt;!&ndash; Quick Stats &ndash;&gt;-->
<!--    <div class="quick-stats">-->
<!--      <div class="stats-title">Data Providers Categories</div>-->
<!--      <div class="stats-grid">-->
<!--        <div class="stat-category">-->
<!--          <div class="stat-category-title">Major Contributors</div>-->
<!--          <div class="stat-category-value">{{ institutionStats?.majorContributors || 0 }}</div>-->
<!--          <div class="stat-category-desc">>10,000 records each</div>-->
<!--        </div>-->
<!--        <div class="stat-category">-->
<!--          <div class="stat-category-title">Active Contributors</div>-->
<!--          <div class="stat-category-value">{{ institutionStats?.activeContributors || 0 }}</div>-->
<!--          <div class="stat-category-desc">1,000-10,000 records</div>-->
<!--        </div>-->
<!--        <div class="stat-category">-->
<!--          <div class="stat-category-title">Research Collections</div>-->
<!--          <div class="stat-category-value">{{ institutionStats?.researchCollections || 0 }}</div>-->
<!--          <div class="stat-category-desc">Universities & museums</div>-->
<!--        </div>-->
<!--        <div class="stat-category">-->
<!--          <div class="stat-category-title">High Quality Data</div>-->
<!--          <div class="stat-category-value">{{ institutionStats?.highQualityData || 0 }}</div>-->
<!--          <div class="stat-category-desc">>90% georeferencing</div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

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
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia-Pacific">Asia-Pacific</option>
          <option value="Other">Other Regions</option>
        </select>
        <select class="filter-select" v-model="filters.recordCount" @change="applyFilters">
          <option value="">All Record Counts</option>
          <option value="major">Major (>10,000)</option>
          <option value="medium">Medium (1,000-10,000)</option>
          <option value="small">Small (<1,000)</option>
        </select>
        <select class="filter-select" v-model="filters.institutionType" @change="applyFilters">
          <option value="">All Institution Types</option>
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

      <!-- Enhanced Table View with Expandable Cards -->
      <div v-else class="table-container">
        <table class="institutions-table">
          <thead>
          <tr>
            <th></th>
            <th><span class="dc-field">institutionCode</span></th>
            <th>Institution Name</th>
            <th>Country</th>
            <th>Records</th>
            <th>Species</th>
            <th>Countries</th>
            <th>Georeferenced</th>
            <th>Date Quality</th>
          </tr>
          </thead>
          <tbody>
          <template v-for="institution in paginatedInstitutions" :key="institution.institutionCode">
            <!-- Main Row -->
            <tr
                class="table-row"
                :class="{ expanded: expandedInstitution === institution.institutionCode }"
                @click="toggleRow(institution.institutionCode)"
            >
              <td>
                <span
                    class="expand-icon"
                    :class="{ expanded: expandedInstitution === institution.institutionCode }"
                >
                  ▼
                </span>
              </td>
              <td>
                <span class="table-institution-code">{{ institution.institutionCode }}</span>
              </td>
              <td>
                <span class="table-institution-name">{{ institution.institutionName }}</span>
              </td>
              <td>{{ institution.country }}</td>
              <td>
                <div class="records-bar-container">
                  <div
                      class="records-bar"
                      :style="{ width: getRecordsPercentage(institution.recordCount) + '%' }"
                  ></div>
                  <div class="records-text">
                    {{ formatNumber(institution.recordCount, 'short') }}
                  </div>
                </div>
              </td>
              <td>{{ formatNumber(institution.speciesCount) }}</td>
              <td>{{ formatNumber(institution.countriesCount) }}</td>
              <td>
                <span
                    class="quality-badge"
                    :class="getQualityClass(institution.geoReferencingQuality)"
                >
                  {{ institution.geoReferencingQuality }}%
                </span>
              </td>
              <td>
                <span
                    class="quality-badge"
                    :class="getQualityClass(institution.dateQuality)"
                >
                  {{ institution.dateQuality }}%
                </span>
              </td>
            </tr>

            <!-- Expanded Card Row -->
            <tr
                v-if="expandedInstitution === institution.institutionCode"
                class="expanded-card"
            >
              <td colspan="9">
                <div class="card-content">
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
                          v-for="code in institution.collectionCodes.slice(0, 6)"
                          :key="code"
                          class="collection-code"
                      >
                        {{ code }}
                      </span>
                      <span
                          v-if="institution.collectionCodes.length > 6"
                          class="collection-code more"
                      >
                        +{{ institution.collectionCodes.length - 6 }} more
                      </span>
                    </div>
                  </div>

                  <div class="card-actions">
                    <button class="card-action-btn primary" @click="navigateToInstitution(institution.institutionCode)">
                      View Details
                    </button>
                    <button class="card-action-btn secondary" @click="downloadData(institution.institutionCode)">
                      Download Data
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInstitutions } from '@/composables/useInstitutions.js'
import { debounce } from 'lodash-es'
import WorldMap from '@/components/charts/WorldMap.vue'

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

// 转换API数据为地图组件需要的格式
const transformedMapData = computed(() => {
  return transformInstitutionsForMap(institutions.value)
})

// 简单的数据转换函数
function transformInstitutionsForMap(apiData) {
  if (!Array.isArray(apiData)) return []

  return apiData.map(institution => ({
    // 地图组件需要的字段
    institutionCode: institution.institutionCode,
    institutionName: institution.institutionName,
    country: institution.country,
    recordCount: institution.recordCount,
    speciesCount: institution.speciesCount,
    familiesCount: institution.familiesCount,
    geoReferencingQuality: Math.round(institution.geoReferencingQuality || 0),
    dateQuality: Math.round(institution.dateQuality || 0),
    institutionType: institution.institutionType,

    // 坐标信息 - 根据机构代码或国家获取
    ...getCoordinatesForInstitution(institution)
  })).filter(item => item.lat && item.lng) // 过滤掉没有坐标的
}

// 获取机构坐标的简单函数
function getCoordinatesForInstitution(institution) {
  // 如果API已经提供了坐标
  if (institution.lat && institution.lng) {
    return {
      lat: parseFloat(institution.lat),
      lng: parseFloat(institution.lng)
    }
  }

  // 根据常见机构代码获取坐标
  const knownInstitutions = {
    'CUMV': { lat: 42.4430, lng: -76.4730 }, // Cornell
    'USNM': { lat: 38.8889, lng: -77.0258 }, // Smithsonian
    'FMNH': { lat: 41.8781, lng: -87.6298 }, // Field Museum
    'CAS': { lat: 37.7699, lng: -122.4667 }, // California Academy
    'LACM': { lat: 34.0162, lng: -118.2890 }, // LA County Museum
    'MCZ': { lat: 42.3783, lng: -71.1150 }, // Harvard
    'UMMZ': { lat: 42.2808, lng: -83.7430 }, // Michigan
    'ROM': { lat: 43.6677, lng: -79.3948 }, // Royal Ontario
    'BMNH': { lat: 51.4966, lng: -0.1764 }, // British Museum
    'MNHN': { lat: 48.8566, lng: 2.3522 }, // Paris Natural History
    // 可以继续添加更多...
  }

  if (knownInstitutions[institution.institutionCode]) {
    return knownInstitutions[institution.institutionCode]
  }

  // 根据国家代码获取默认坐标
  const countryCoords = {
    'US': { lat: 39.8283, lng: -98.5795 },
    'CA': { lat: 56.1304, lng: -106.3468 },
    'GB': { lat: 55.3781, lng: -3.4360 },
    'UK': { lat: 55.3781, lng: -3.4360 },
    'AU': { lat: -25.2744, lng: 133.7751 },
    'DE': { lat: 51.1657, lng: 10.4515 },
    'FR': { lat: 46.2276, lng: 2.2137 },
    'JP': { lat: 36.2048, lng: 138.2529 },
    'BR': { lat: -14.2350, lng: -51.9253 },
    'CN': { lat: 35.8617, lng: 104.1954 },
    // 继续添加更多国家...
  }

  return countryCoords[institution.country] || { lat: null, lng: null }
}
// 本地状态
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
const expandedInstitution = ref(null)
const maxRecords = ref(0)

// 计算属性
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

  // Update max records for visualization
  if (filtered.length > 0) {
    maxRecords.value = Math.max(...filtered.map(i => i.recordCount || 0))
  }

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

const navigateToInstitution = (institutionCode) => {
  router.push({
    name: 'InstitutionDetail',
    params: { institutionCode }
  })
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

const toggleRow = (institutionCode) => {
  if (expandedInstitution.value === institutionCode) {
    expandedInstitution.value = null
  } else {
    expandedInstitution.value = institutionCode
  }
}

const getRecordsPercentage = (records) => {
  if (!maxRecords.value) return 0
  return (records / maxRecords.value) * 100
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

const downloadData = (institutionCode) => {
  console.log('Downloading data for:', institutionCode)
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 30px;
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
  margin-bottom: 25px;
}

.global-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
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
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-button.export { background: #e8f5e9; color: #2e7d32; }
.action-button.network { background: #fff3e0; color: #f57c00; }
.action-button.quality { background: #e8f4fd; color: #0288d1; }

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-icon { margin-right: 6px; }

/* Quick stats */
.quick-stats {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 25px;
  margin-bottom: 20px;
}

.stats-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-category {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
}

.stat-category-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.stat-category-value {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-category-desc {
  font-size: 12px;
  color: #666;
}

/* 控制面板 */
.controls-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 15px;
  align-items: center;
}

.search-input, .filter-select {
  padding: 10px 15px;
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

/* Institutions container */
.institutions-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 25px;
}

.institutions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
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

/* 增强表格样式 */
.table-container {
  overflow-x: auto;
}

.institutions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.institutions-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.institutions-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.table-row {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-row.expanded {
  background-color: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.table-institution-code {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
}

.table-institution-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
}

/* 记录可视化 */
.records-bar-container {
  position: relative;
  width: 120px;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.records-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.records-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: #333;
  z-index: 2;
}

/* 质量指示器 */
.quality-badge {
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.quality-excellent { background: #d4edda; color: #155724; }
.quality-good { background: #fff3cd; color: #856404; }
.quality-fair { background: #f8d7da; color: #721c24; }

/* 展开图标 */
.expand-icon {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: #666;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 展开卡片 */
.expanded-card {
  background: #f8f9fa;
  border-top: 3px solid #3498db;
}

.card-content {
  padding: 30px;
  background: white;
  margin: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.institution-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.institution-logo {
  width: 60px;
  height: 60px;
  background: #3498db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-weight: bold;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.institution-info {
  flex: 1;
}

.institution-name {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.institution-codes {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.institution-code-tag {
  background: #e8f4fd;
  color: #0288d1;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.institution-location {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.institution-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.institution-stat {
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.institution-stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.institution-stat-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.institution-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.institution-quality {
  display: flex;
  gap: 8px;
}

.collection-codes {
  margin-bottom: 20px;
}

.collection-codes-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.collection-code-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.collection-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #666;
}

.collection-code.more {
  background: #e8f4fd;
  color: #0288d1;
  font-style: italic;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.card-action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.card-action-btn.primary {
  background: #3498db;
  color: white;
}

.card-action-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;
}

.card-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  gap: 10px;
  flex-wrap: wrap;
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

.pagination-info {
  font-size: 14px;
  color: #666;
  margin-left: 15px;
}

/* 状态组件 */
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .controls-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .global-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .institution-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .records-bar-container {
    width: 100px;
  }
}

@media (max-width: 768px) {
  .all-institutions-page {
    padding: 15px;
  }

  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .institution-stats-row {
    grid-template-columns: 1fr;
  }

  .page-actions {
    justify-content: center;
  }

  .institutions-table {
    font-size: 12px;
  }

  .institutions-table th,
  .institutions-table td {
    padding: 8px;
  }

  .table-institution-code {
    font-size: 14px;
  }

  .institution-name {
    font-size: 20px;
  }

  .card-content {
    padding: 20px;
    margin: 10px;
  }

  .records-bar-container {
    width: 80px;
  }

  .institution-card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .institution-logo {
    margin-right: 0;
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .institutions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-info {
    margin-left: 0;
    order: -1;
  }

  .card-actions {
    flex-direction: column;
  }

  .collection-code-list {
    justify-content: center;
  }
}
</style>