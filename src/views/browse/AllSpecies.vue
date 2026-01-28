<template>
  <div class="all-species-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Browse All Fish Species</h1>
      <p class="page-subtitle">Explore 28,567 fish species using taxonomic hierarchy and advanced search based on Darwin Core fields</p>

      <div class="global-stats" v-if="taxonomyStats">
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalSpecies) }}</div>
          <div class="global-stat-label">Total Species</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalGenera) }}</div>
          <div class="global-stat-label">Total Genera</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalFamilies) }}</div>
          <div class="global-stat-label">Total Families</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalRecords, 'short') }}</div>
          <div class="global-stat-label">Total Records</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalInstitutions) }}</div>
          <div class="global-stat-label">Contributing Institutions</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalCountries) }}</div>
          <div class="global-stat-label">Countries</div>
        </div>
      </div>

      <!-- <div class="page-actions">
        <button class="action-button export" @click="exportSpeciesList">
          <span class="action-icon">📊</span> Export Species List
        </button>
        <button class="action-button analyze" @click="diversityAnalysis">
          <span class="action-icon">🔬</span> Diversity Analysis
        </button>
        <button class="action-button checklist" @click="generateChecklist">
          <span class="action-icon">📋</span> Generate Checklist
        </button>
      </div> -->
    </div>

    <!-- Top Species Highlight -->
    <div class="top-species" v-if="topSpecies.length">
      <div class="stats-title">Most Recorded Species</div>
      <div class="top-species-grid">
        <div
            v-for="(species, index) in topSpecies"
            :key="species.scientificName"
            class="top-species-item"
            @click="navigateToSpecies(species.scientificName)"
        >
          <div class="top-species-rank">{{ index + 1 }}</div>
          <div class="top-species-name">{{ species.scientificName }}</div>
          <div class="top-species-stats">
            {{ formatNumber(species.recordCount) }} records
          </div>
        </div>
      </div>
    </div>

    <!-- Family Breakdown -->
    <div class="family-breakdown">
      <div class="breakdown-title">Species by Family</div>
      <div class="family-stats">
        <div
            v-for="family in familyBreakdown"
            :key="family.family"
            class="family-stat-item"
            @click="filterByFamily(family.family)"
        >
          <div class="family-stat-header">
            <div class="family-stat-name">{{ family.family }}</div>
            <div class="family-stat-count">{{ formatNumber(family.speciesCount) }}</div>
          </div>
          <div class="family-stat-details">
            {{ formatNumber(family.generaCount) }} genera • {{ formatNumber(family.recordCount) }} records
          </div>
        </div>
      </div>
    </div>

    <!-- Taxonomic Browser -->
    <div class="taxonomic-browser">
      <div class="browser-title">Browse by Taxonomic Hierarchy</div>
      <div class="taxonomy-levels">
        <div class="taxonomy-level">
          <div class="level-title">Order</div>
          <select class="level-select" v-model="taxonomyFilters.order" @change="updateTaxonomyFilter">
            <option value="">All Orders ({{ availableOrders.length }})</option>
            <option v-for="order in availableOrders" :key="order.name" :value="order.name">
              {{ order.name }} ({{ formatNumber(order.speciesCount) }} species)
            </option>
          </select>
          <div class="level-count">{{ availableOrders.length }} orders available</div>
        </div>
        <div class="taxonomy-level">
          <div class="level-title">Family</div>
          <select class="level-select" v-model="taxonomyFilters.family" @change="updateTaxonomyFilter">
            <option value="">All Families ({{ availableFamilies.length }})</option>
            <option v-for="family in availableFamilies" :key="family.name" :value="family.name">
              {{ family.name }} ({{ formatNumber(family.speciesCount) }} species)
            </option>
          </select>
          <div class="level-count">{{ availableFamilies.length }} families available</div>
        </div>
        <div class="taxonomy-level">
          <div class="level-title">Genus</div>
          <select class="level-select" v-model="taxonomyFilters.genus" @change="updateTaxonomyFilter">
            <option value="">All Genera ({{ availableGenera.length }})</option>
            <option v-for="genus in availableGenera" :key="genus.name" :value="genus.name">
              {{ genus.name }} ({{ formatNumber(genus.speciesCount) }} species)
            </option>
          </select>
          <div class="level-count">{{ availableGenera.length }} genera available</div>
        </div>
        <div class="taxonomy-level">
          <div class="level-title">Filter Results</div>
          <button class="search-button" style="width: 100%;" @click="applyTaxonomyFilters">
            Apply Filters
          </button>
          <div class="level-count">Click to filter species list</div>
        </div>
      </div>
    </div>

    <!-- Advanced Search -->
    <div class="advanced-search">
      <div class="browser-title">Advanced Species Search</div>
      <div class="search-grid">
        <div class="search-field">
          <div class="search-label">
            Scientific Name
          </div>
          <input
              type="text"
              class="search-input"
              placeholder="Search species by scientific or common name..."
              v-model="searchFilters.name"
              @input="debouncedSearch"
          />
        </div>
        <div class="search-field">
          <div class="search-label">Record Count</div>
          <select class="filter-select" v-model="searchFilters.recordCount" @change="applyFilters">
            <option value="">Any Count</option>
            <option value="high">High (>1,000)</option>
            <option value="medium">Medium (100-1,000)</option>
            <option value="low">Low (<100)</option>
          </select>
        </div>
        <div class="search-field">
          <div class="search-label">Data Quality</div>
          <select class="filter-select" v-model="searchFilters.dataQuality" @change="applyFilters">
            <option value="">Any Quality</option>
            <option value="excellent">Excellent (>95%)</option>
            <option value="good">Good (80-95%)</option>
            <option value="poor">Poor (<80%)</option>
          </select>
        </div>
        <div class="search-field">
          <div class="search-label">Geographic Region</div>
          <select class="filter-select" v-model="searchFilters.region" @change="applyFilters">
            <option value="">All Regions</option>
            <option value="north-america">North America</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="south-america">South America</option>
          </select>
        </div>
        <div class="search-field">
          <div class="search-label">Sort By</div>
          <select class="filter-select" v-model="searchFilters.sortBy" @change="applyFilters">
            <option value="records_desc">Records (Desc)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="recent_desc">Recently Added</option>
            <option value="quality_desc">Data Quality</option>
          </select>
        </div>
        <div>
          <button class="search-button" @click="performSearch">Search</button>
        </div>
      </div>
    </div>

    <!-- Species Results -->
    <div class="species-results">
      <div class="results-header">
        <div class="results-title">Species Search Results</div>
        <div class="results-info">Showing {{ displayedSpecies.length }} of {{ totalSpeciesCount }} species</div>
      </div>

      <div class="results-controls">
        <div class="view-toggle">
          <button
              class="view-btn"
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
          >
            Table View
          </button>
          <button
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
          >
            Compact List
          </button>
        </div>
        <div class="sort-controls">
          <span style="font-size: 14px; color: #666;">Per page:</span>
          <select class="filter-select" style="padding: 5px 8px;" v-model="pagination.perPage" @change="changePerPage">
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading species...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadSpecies" class="retry-button">Retry</button>
      </div>

      <!-- Table View -->
      <table v-else-if="viewMode === 'table'" class="species-table">
        <thead>
        <tr>
          <th>Scientific Name</th>
          <th>Authority</th>
          <!-- <th>Vernacular Name</th> -->
          <th>Family</th>
          <th>Records</th>
          <th>Countries</th>
          <th>Institutions</th>
          <th>Data Quality</th>
          <th>Last Record</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="species in displayedSpecies"
            :key="species.scientificName"
            @click="navigateToSpecies(species.scientificName)"
            class="clickable-row"
        >
          <td><span class="species-name">{{ species.scientificName }}</span></td>
          <td><span class="species-authority">{{ species.authority }}</span></td>
          <!-- <td><span class="common-name">{{ species.vernacularName || '—' }}</span></td> -->
          <td>
            <router-link
                :to="{ name: 'FamilyDetail', params: { familyName: species.family } }"
                class="family-link"
                @click.stop
            >
              {{ species.family }}
            </router-link>
          </td>
          <td><span class="record-count">{{ formatNumber(species.recordCount) }}</span></td>
          <td>{{ formatNumber(species.countriesCount) }}</td>
          <td>{{ formatNumber(species.institutionsCount) }}</td>
          <td>
            <div class="quality-indicator">
              <div
                  class="quality-dot"
                  :class="getQualityClass(species.geoReferencingQuality)"
                  :title="`Georeferencing: ${species.geoReferencingQuality}%`"
              ></div>
              <div
                  class="quality-dot"
                  :class="getQualityClass(species.dateQuality)"
                  :title="`Date Quality: ${species.dateQuality}%`"
              ></div>
            </div>
          </td>
          <td>{{ formatDate(species.lastRecord) }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Compact List View -->
      <div v-else class="species-list active">
        <div
            v-for="species in displayedSpecies"
            :key="species.scientificName"
            class="species-item"
            @click="navigateToSpecies(species.scientificName)"
        >
          <div class="species-item-header">
            <div class="species-item-name">{{ species.scientificName }}</div>
            <div class="species-item-count">{{ formatNumber(species.recordCount) }}</div>
          </div>
          <div class="species-item-meta">
            {{ species.authority }} • {{ species.family }}<br>
            {{ formatNumber(species.countriesCount) }} countries • {{ formatNumber(species.institutionsCount) }} institutions • Last: {{ formatDate(species.lastRecord) }}
          </div>
        </div>
      </div>

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
          Showing {{ (pagination.page - 1) * pagination.perPage + 1 }}-{{ Math.min(pagination.page * pagination.perPage, totalSpeciesCount) }}
          of {{ totalSpeciesCount }} species
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaxonomy } from '@/composables/useTaxonomy.js'
import { debounce } from 'lodash-es'

const router = useRouter()

// 使用 composable
const {
  loading,
  error,
  species,
  taxonomyStats,
  fetchSpecies,
  fetchTaxonomyStats
} = useTaxonomy()

// 本地状态
const viewMode = ref('table')
const taxonomyFilters = ref({
  order: '',
  family: '',
  genus: ''
})
const searchFilters = ref({
  name: '',
  recordCount: '',
  dataQuality: '',
  region: '',
  sortBy: 'records_desc'
})
const pagination = ref({
  page: 1,
  perPage: 50,
  total: 0
})

// 可用的分类选项
const availableOrders = ref([])
const availableFamilies = ref([])
const availableGenera = ref([])
const familyBreakdown = ref([])

// 计算属性
const topSpecies = computed(() => {
  return species.value
      .slice()
      .sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))
      .slice(0, 5)
})

const displayedSpecies = computed(() => {
  let filtered = species.value

  // 应用搜索过滤
  if (searchFilters.value.name) {
    const search = searchFilters.value.name.toLowerCase()
    filtered = filtered.filter(s =>
        s.scientificName.toLowerCase().includes(search) ||
        (s.vernacularName && s.vernacularName.toLowerCase().includes(search))
    )
  }

  // 应用其他过滤器
  if (searchFilters.value.recordCount) {
    filtered = filtered.filter(s => {
      const count = s.recordCount || 0
      switch (searchFilters.value.recordCount) {
        case 'high': return count > 1000
        case 'medium': return count >= 100 && count <= 1000
        case 'low': return count < 100
        default: return true
      }
    })
  }

  // 应用分类过滤器
  if (taxonomyFilters.value.family) {
    filtered = filtered.filter(s => s.family === taxonomyFilters.value.family)
  }
  if (taxonomyFilters.value.genus) {
    filtered = filtered.filter(s => s.genus === taxonomyFilters.value.genus)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (searchFilters.value.sortBy) {
      case 'name_asc':
        return a.scientificName.localeCompare(b.scientificName)
      case 'records_desc':
        return (b.recordCount || 0) - (a.recordCount || 0)
      case 'recent_desc':
        return new Date(b.lastRecord || 0) - new Date(a.lastRecord || 0)
      case 'quality_desc':
        return (b.geoReferencingQuality || 0) - (a.geoReferencingQuality || 0)
      default:
        return 0
    }
  })

  // 分页
  const start = (pagination.value.page - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage

  pagination.value.total = filtered.length
  return filtered.slice(start, end)
})

const totalSpeciesCount = computed(() => pagination.value.total)

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

// 方法
const loadSpecies = async () => {
  try {
    await fetchSpecies()
    extractTaxonomyOptions()
    extractFamilyBreakdown()
  } catch (err) {
    console.error('Failed to load species:', err)
  }
}

const loadStats = async () => {
  try {
    await fetchTaxonomyStats()
  } catch (err) {
    console.error('Failed to load taxonomy stats:', err)
  }
}

const extractTaxonomyOptions = () => {
  // 提取分类选项
  const orders = {}
  const families = {}
  const genera = {}

  species.value.forEach(s => {
    if (s.order) {
      if (!orders[s.order]) orders[s.order] = { name: s.order, speciesCount: 0 }
      orders[s.order].speciesCount++
    }
    if (s.family) {
      if (!families[s.family]) families[s.family] = { name: s.family, speciesCount: 0 }
      families[s.family].speciesCount++
    }
    if (s.genus) {
      if (!genera[s.genus]) genera[s.genus] = { name: s.genus, speciesCount: 0 }
      genera[s.genus].speciesCount++
    }
  })

  availableOrders.value = Object.values(orders).sort((a, b) => a.name.localeCompare(b.name))
  availableFamilies.value = Object.values(families).sort((a, b) => a.name.localeCompare(b.name))
  availableGenera.value = Object.values(genera).sort((a, b) => a.name.localeCompare(b.name))
}

const extractFamilyBreakdown = () => {
  const families = {}
  const genera = {}

  species.value.forEach(s => {
    if (s.family) {
      if (!families[s.family]) {
        families[s.family] = {
          family: s.family,
          speciesCount: 0,
          recordCount: 0,
          generaCount: 0
        }
      }
      families[s.family].speciesCount++
      families[s.family].recordCount += s.recordCount || 0

      if (s.genus && !genera[`${s.family}_${s.genus}`]) {
        genera[`${s.family}_${s.genus}`] = true
        families[s.family].generaCount++
      }
    }
  })

  familyBreakdown.value = Object.values(families)
      .sort((a, b) => b.speciesCount - a.speciesCount)
      .slice(0, 6)
}

const navigateToSpecies = (scientificName) => {
  router.push({
    name: 'SpeciesDetail',
    params: { scientificName: encodeURIComponent(scientificName) }
  })
}

const filterByFamily = (familyName) => {
  taxonomyFilters.value.family = familyName
  taxonomyFilters.value.genus = ''
  applyTaxonomyFilters()
}

const updateTaxonomyFilter = () => {
  // 当上级分类变更时，清空下级分类
  if (taxonomyFilters.value.order) {
    // 过滤可用的科
    const filteredFamilies = availableFamilies.value.filter(f => {
      return species.value.some(s => s.order === taxonomyFilters.value.order && s.family === f.name)
    })
    availableFamilies.value = filteredFamilies
  }

  if (taxonomyFilters.value.family) {
    // 过滤可用的属
    const filteredGenera = availableGenera.value.filter(g => {
      return species.value.some(s => s.family === taxonomyFilters.value.family && s.genus === g.name)
    })
    availableGenera.value = filteredGenera
  }
}

const applyTaxonomyFilters = () => {
  pagination.value.page = 1
}

const applyFilters = () => {
  pagination.value.page = 1
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const performSearch = () => {
  applyFilters()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.page = page
  }
}

const changePerPage = () => {
  pagination.value.page = 1
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

const getQualityClass = (percentage) => {
  if (percentage >= 95) return 'quality-excellent'
  if (percentage >= 80) return 'quality-good'
  return 'quality-poor'
}

// 操作按钮方法
const exportSpeciesList = () => {
  console.log('Exporting species list...')
}

const diversityAnalysis = () => {
  console.log('Starting diversity analysis...')
}

const generateChecklist = () => {
  console.log('Generating checklist...')
}

// 生命周期
onMounted(() => {
  loadSpecies()
  loadStats()
})
</script>
<style scoped>
/* 页面基础样式 */
.all-species-page {
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
}
.action-button {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.action-button.export { background: #e8f5e9; color: #2e7d32; }
.action-button.analyze { background: #fff3e0; color: #f57c00; }
.action-button.checklist { background: #e8f4fd; color: #0288d1; }

.action-icon { margin-right: 5px; }

/* Top species highlight */
.top-species {
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

.top-species-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.top-species-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.top-species-item:hover {
  transform: translateY(-2px);
}

.top-species-rank {
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

.top-species-name {
  font-weight: bold;
  font-style: italic;
  margin-bottom: 5px;
  color: #2c3e50;
  font-size: 14px;
}

.top-species-stats {
  font-size: 12px;
  color: #666;
}

/* Family breakdown */
.family-breakdown {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.breakdown-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.family-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.family-stat-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.family-stat-item:hover {
  background-color: #e9ecef;
}

.family-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.family-stat-name {
  font-weight: bold;
  color: #2c3e50;
}

.family-stat-count {
  background: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.family-stat-details {
  font-size: 12px;
  color: #666;
}

/* Taxonomic browser */
.taxonomic-browser {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.browser-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.taxonomy-levels {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.taxonomy-level {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.level-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.level-count {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* Advanced search */
.advanced-search {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.search-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
  gap: 15px;
  align-items: end;
}

.search-field {
  display: flex;
  flex-direction: column;
}

.search-label {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.search-button {
  padding: 10px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.search-button:hover {
  background: #2980b9;
}

/* Species results */
.species-results {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 20px;
  margin-bottom: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.results-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.results-info {
  color: #666;
  font-size: 14px;
}

.results-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.view-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
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

.sort-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Species table */
.species-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.species-table th, .species-table td {
  border-bottom: 1px solid #eee;
  padding: 12px;
  text-align: left;
}

.species-table th {
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

.species-name {
  font-weight: bold;
  font-style: italic;
  color: #2c3e50;
}

.species-authority {
  color: #666;
  font-size: 13px;
  font-style: normal;
}

.common-name {
  color: #666;
  font-size: 13px;
}

.family-link {
  color: #3498db;
  text-decoration: none;
}

.family-link:hover {
  text-decoration: underline;
}

.record-count {
  font-weight: bold;
  color: #3498db;
}

.quality-indicator {
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

/* Compact list view */
.species-list {
  display: none;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.species-list.active {
  display: grid;
}

.species-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.species-item:hover {
  background-color: #e9ecef;
}

.species-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.species-item-name {
  font-weight: bold;
  font-style: italic;
  color: #2c3e50;
}

.species-item-count {
  background: #3498db;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.species-item-meta {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* Darwin Core field styling */
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
  .search-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .taxonomy-levels {
    grid-template-columns: repeat(2, 1fr);
  }

  .global-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .taxonomy-levels {
    grid-template-columns: 1fr;
  }

  .top-species-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .species-table {
    font-size: 12px;
  }

  .species-table th,
  .species-table td {
    padding: 8px;
  }
}
</style>