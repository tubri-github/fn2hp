<template>
  <div class="all-genera-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Browse All Fish Genera</h1>
      <p class="page-subtitle">Explore taxonomic diversity across all fish genera in the Fishnet2 database</p>

      <div class="global-stats" v-if="taxonomyStats">
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalGenera) }}</div>
          <div class="global-stat-label">Total Genera</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalSpecies) }}</div>
          <div class="global-stat-label">Total Species</div>
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
          <div class="global-stat-label">Institutions</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalCountries) }}</div>
          <div class="global-stat-label">Countries</div>
        </div>
      </div>

      <div class="page-actions">
        <button class="action-button export" @click="exportGeneraSummary">
          <span class="action-icon">📊</span> Export Genera Summary
        </button>
        <button class="action-button compare" @click="openGeneraComparison">
          <span class="action-icon">⚖️</span> Compare Genera
        </button>
        <button class="action-button analyze" @click="startDiversityAnalysis">
          <span class="action-icon">🔍</span> Diversity Analysis
        </button>
      </div>
    </div>

    <!-- Top Genera Highlight -->
    <div class="top-genera" v-if="topGenera.length">
      <div class="stats-title">Most Recorded Genera</div>
      <div class="top-genera-grid">
        <div
            v-for="(genus, index) in topGenera"
            :key="genus.genus"
            class="top-genus-item"
            @click="navigateToGenus(genus.genus)"
        >
          <div class="top-genus-rank">{{ index + 1 }}</div>
          <div class="top-genus-name">{{ genus.genus }}</div>
          <div class="top-genus-stats">
            {{ formatNumber(genus.recordCount) }} records<br>
            {{ formatNumber(genus.speciesCount) }} species
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stats-title">Database Overview</div>
      <div class="stats-grid">
        <div class="stat-category">
          <div class="stat-category-title">Species Rich</div>
          <div class="stat-category-value">{{ taxonomyStats.speciesRichGenera || 0 }}</div>
          <div class="stat-category-desc">>20 species per genus</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Well Sampled</div>
          <div class="stat-category-value">{{ taxonomyStats.wellSampledGenera || 0 }}</div>
          <div class="stat-category-desc">>500 records per genus</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Global Coverage</div>
          <div class="stat-category-value">{{ taxonomyStats.globalCoverageGenera || 0 }}</div>
          <div class="stat-category-desc">Genera in >15 countries</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Data Quality</div>
          <div class="stat-category-value">{{ taxonomyStats.avgGeoreferencing || 0 }}%</div>
          <div class="stat-category-desc">Average georeferencing</div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="controls-section">
      <div class="controls-grid">
        <input
            type="text"
            class="search-input"
            placeholder="Search genera by name, family, or common name..."
            v-model="filters.search"
            @input="debouncedSearch"
        />
        <select class="filter-select" v-model="filters.family" @change="applyFilters">
          <option value="">All Families</option>
          <option v-for="family in availableFamilies" :key="family" :value="family">
            {{ family }}
          </option>
        </select>
        <select class="filter-select" v-model="filters.recordCount" @change="applyFilters">
          <option value="">All Record Counts</option>
          <option value="high">High (>1,000)</option>
          <option value="medium">Medium (100-1,000)</option>
          <option value="low">Low (<100)</option>
        </select>
        <select class="filter-select" v-model="filters.speciesCount" @change="applyFilters">
          <option value="">All Species Counts</option>
          <option value="high">High (>20 species)</option>
          <option value="medium">Medium (5-20 species)</option>
          <option value="low">Low (<5 species)</option>
        </select>
        <select class="filter-select" v-model="filters.sortBy" @change="applyFilters">
          <option value="records_desc">Sort by Records</option>
          <option value="species_desc">Sort by Species</option>
          <option value="name_asc">Sort by Name</option>
          <option value="family_asc">Sort by Family</option>
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

    <!-- Genera Container -->
    <div class="genera-container">
      <div class="genera-header">
        <div class="genera-title">All Fish Genera</div>
        <div class="results-info">
          Showing {{ genera.length }} of {{ pagination.total }} genera
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading genera...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadGenera" class="retry-button">Retry</button>
      </div>

      <!-- Card View -->
      <div v-else-if="viewMode === 'cards'" class="genera-grid">
        <div
            v-for="genus in genera"
            :key="genus.genus"
            class="genus-card"
            @click="navigateToGenus(genus.genus)"
        >
          <div class="genus-card-header">
            <h3 class="genus-name">{{ genus.genus }}</h3>
            <router-link
                :to="{ name: 'FamilyDetail', params: { familyName: genus.family } }"
                class="genus-family"
                @click.stop
            >
              {{ genus.family }}
            </router-link>
          </div>
          <div class="genus-stats-row">
            <div class="genus-stat">
              <div class="genus-stat-number">{{ formatNumber(genus.speciesCount) }}</div>
              <div class="genus-stat-label">Species</div>
            </div>
            <div class="genus-stat">
              <div class="genus-stat-number">{{ formatNumber(genus.recordCount, 'short') }}</div>
              <div class="genus-stat-label">Records</div>
            </div>
            <div class="genus-stat">
              <div class="genus-stat-number">{{ formatNumber(genus.countriesCount) }}</div>
              <div class="genus-stat-label">Countries</div>
            </div>
            <div class="genus-stat">
              <div class="genus-stat-number">{{ formatNumber(genus.institutionsCount) }}</div>
              <div class="genus-stat-label">Institutions</div>
            </div>
          </div>
          <div class="genus-meta">
            <span>{{ genus.order || '—' }}</span>
            <div class="genus-quality">
              <span
                  class="quality-badge"
                  :class="getQualityClass(genus.geoReferencingQuality)"
              >
                Geo: {{ genus.geoReferencingQuality }}%
              </span>
              <span
                  class="quality-badge"
                  :class="getQualityClass(genus.dateQuality)"
              >
                Date: {{ genus.dateQuality }}%
              </span>
            </div>
          </div>
          <div class="genus-progress">
            <div class="progress-label">Collection Completeness</div>
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: `${genus.collectionCompleteness}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <table v-else class="genera-table">
        <thead>
        <tr>
          <th><span class="dc-field">genus</span></th>
          <th><span class="dc-field">family</span></th>
          <th><span class="dc-field">order</span></th>
          <th>Species</th>
          <th>Records</th>
          <th>Countries</th>
          <th>Institutions</th>
          <th>Georeferenced</th>
          <th>Date Quality</th>
          <th>Last Updated</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="genus in genera"
            :key="genus.genus"
            @click="navigateToGenus(genus.genus)"
            class="clickable-row"
        >
          <td><span class="table-genus-name">{{ genus.genus }}</span></td>
          <td>
            <router-link
                :to="{ name: 'FamilyDetail', params: { familyName: genus.family } }"
                class="family-link"
                @click.stop
            >
              {{ genus.family }}
            </router-link>
          </td>
          <td>{{ genus.order || '—' }}</td>
          <td>{{ formatNumber(genus.speciesCount) }}</td>
          <td>{{ formatNumber(genus.recordCount) }}</td>
          <td>{{ formatNumber(genus.countriesCount) }}</td>
          <td>{{ formatNumber(genus.institutionsCount) }}</td>
          <td>{{ genus.geoReferencingQuality }}%</td>
          <td>{{ genus.dateQuality }}%</td>
          <td>{{ formatDate(genus.lastUpdated) }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.total > pagination.perPage">
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
          Showing {{ (pagination.page - 1) * pagination.perPage + 1 }}-{{ Math.min(pagination.page * pagination.perPage, pagination.total) }}
          of {{ pagination.total }} genera
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
  genera,
  taxonomyStats,
  pagination,
  filters,
  fetchGenera,
  fetchTaxonomyStats,
  updateFilters,
  updatePagination
} = useTaxonomy()

// 本地状态
const viewMode = ref('cards')
const availableFamilies = ref([])

// 计算属性
const topGenera = computed(() => {
  return genera.value
      .slice()
      .sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))
      .slice(0, 5)
})

const totalPages = computed(() => {
  return Math.ceil(pagination.total / pagination.perPage)
})

const visiblePages = computed(() => {
  const current = pagination.page
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
const loadGenera = async () => {
  try {
    await fetchGenera()

    // 提取可用的科(Families)
    const families = [...new Set(genera.value.map(g => g.family).filter(Boolean))]
    availableFamilies.value = families.sort()
  } catch (err) {
    console.error('Failed to load genera:', err)
  }
}

const loadStats = async () => {
  try {
    await fetchTaxonomyStats()
  } catch (err) {
    console.error('Failed to load taxonomy stats:', err)
  }
}

const navigateToGenus = (genusName) => {
  router.push({
    name: 'GenusDetail',
    params: { genusName }
  })
}

const applyFilters = () => {
  updatePagination({ page: 1 })
  loadGenera()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    updatePagination({ page })
    loadGenera()
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

const getQualityClass = (percentage) => {
  if (percentage >= 90) return 'quality-excellent'
  if (percentage >= 80) return 'quality-good'
  return 'quality-fair'
}

// 操作按钮方法
const exportGeneraSummary = () => {
  console.log('Exporting genera summary...')
}

const openGeneraComparison = () => {
  console.log('Opening genera comparison...')
}

const startDiversityAnalysis = () => {
  console.log('Starting diversity analysis...')
}

// 生命周期
onMounted(() => {
  loadGenera()
  loadStats()
})

// 监听筛选变化
watch(() => filters.search, debouncedSearch)
</script>

<style scoped>
/* 使用与AllFamilies.vue相同的样式，只需要修改相关的类名 */
.all-genera-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

/* 页面基础样式复用AllFamilies的样式 */
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

.action-button.export {
  background: #e8f5e9;
  color: #2e7d32;
}

.action-button.compare {
  background: #fff3e0;
  color: #f57c00;
}

.action-button.analyze {
  background: #e8f4fd;
  color: #0288d1;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-icon {
  margin-right: 6px;
}

/* Top genera 样式 */
.top-genera, .quick-stats {
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

.top-genera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.top-genus-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.top-genus-item:hover {
  transform: translateY(-2px);
}

.top-genus-rank {
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

.top-genus-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
  font-style: italic;
}

.top-genus-stats {
  font-size: 12px;
  color: #666;
}

/* 其他样式与AllFamilies相同，只需替换相关类名 */
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

.controls-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.genera-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 25px;
}

.genera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.genera-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.results-info {
  color: #666;
  font-size: 14px;
}

.genera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.genus-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.genus-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.genus-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.genus-name {
  font-size: 22px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  font-style: italic;
}

.genus-family {
  background: #e8f4fd;
  color: #0288d1;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
}

.genus-family:hover {
  background: #bbdefb;
}

.genus-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.genus-stat {
  text-align: center;
  background: white;
  border-radius: 6px;
  padding: 12px 8px;
}

.genus-stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 3px;
}

.genus-stat-label {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.genus-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.genus-quality {
  display: flex;
  gap: 8px;
}

.quality-badge {
  padding: 3px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.quality-excellent {
  background: #d4edda;
  color: #155724;
}

.quality-good {
  background: #fff3cd;
  color: #856404;
}

.quality-fair {
  background: #f8d7da;
  color: #721c24;
}

.genus-progress {
  margin-top: 12px;
}

.progress-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s;
}

.genera-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.genera-table th,
.genera-table td {
  border-bottom: 1px solid #eee;
  padding: 12px;
  text-align: left;
}

.genera-table th {
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

.table-genus-name {
  font-weight: bold;
  color: #2c3e50;
  font-style: italic;
}

.family-link {
  color: #3498db;
  text-decoration: none;
}

.family-link:hover {
  text-decoration: underline;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
  gap: 10px;
  flex-wrap: wrap;
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

  .genera-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .all-genera-page {
    padding: 15px;
  }

  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .genera-grid {
    grid-template-columns: 1fr;
  }

  .top-genera-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-actions {
    justify-content: center;
  }
}
</style>