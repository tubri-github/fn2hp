<template>
  <div class="all-families-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Browse All Fish Families</h1>
      <p class="page-subtitle">Explore taxonomic diversity across all fish families in the FishNet 2 database</p>

      <div class="global-stats" v-if="taxonomyStats">
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalFamilies) }}</div>
          <div class="global-stat-label">Total Families</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalGenera) }}</div>
          <div class="global-stat-label">Total Genera</div>
        </div>
        <div class="global-stat">
          <div class="global-stat-number">{{ formatNumber(taxonomyStats.totalSpecies) }}</div>
          <div class="global-stat-label">Total Species</div>
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

      <!-- <div class="page-actions">
        <button class="action-button export" @click="exportFamilySummary">
          <span class="action-icon">📊</span> Export Family Summary
        </button>
        <button class="action-button compare" @click="openFamilyComparison">
          <span class="action-icon">⚖️</span> Compare Families
        </button>
        <button class="action-button analyze" @click="startDiversityAnalysis">
          <span class="action-icon">🔍</span> Diversity Analysis
        </button>
      </div> -->
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stats-title">Database Overview</div>
      <div class="stats-grid">
        <div class="stat-category">
          <div class="stat-category-title">High Diversity</div>
          <div class="stat-category-value">{{ taxonomyStats?.highDiversityFamilies || 0 }}</div>
          <div class="stat-category-desc">>50 genera per family</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Well Sampled</div>
          <div class="stat-category-value">{{ taxonomyStats?.wellSampledFamilies || 0 }}</div>
          <div class="stat-category-desc">>1,000 records per family</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Global Coverage</div>
          <div class="stat-category-value">{{ taxonomyStats?.globalCoverageFamilies || 0 }}</div>
          <div class="stat-category-desc">Families in >20 countries</div>
        </div>
        <div class="stat-category">
          <div class="stat-category-title">Data Quality</div>
          <div class="stat-category-value">{{ taxonomyStats?.avgGeoreferencing || 0 }}%</div>
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
            placeholder="Search families by name, order, or common name..."
            v-model="filters.search"
            @input="debouncedSearch"
        />
        <select class="filter-select" v-model="filters.order" @change="applyFilters">
          <option value="">All Orders</option>
          <option v-for="order in availableOrders" :key="order" :value="order">
            {{ order }}
          </option>
        </select>
        <select class="filter-select" v-model="filters.recordCount" @change="applyFilters">
          <option value="">All Record Counts</option>
          <option value="high">High (>10,000)</option>
          <option value="medium">Medium (1,000-10,000)</option>
          <option value="low">Low (<1,000)</option>
        </select>
        <select class="filter-select" v-model="filters.diversity" @change="applyFilters">
          <option value="">All Diversity</option>
          <option value="high">High (>50 genera)</option>
          <option value="medium">Medium (10-50 genera)</option>
          <option value="low">Low (<10 genera)</option>
        </select>
        <select class="filter-select" v-model="filters.sortBy" @change="applyFilters">
          <option value="records_desc">Sort by Records</option>
          <option value="genera_desc">Sort by Genera</option>
          <option value="species_desc">Sort by Species</option>
          <option value="name_asc">Sort by Name</option>
        </select>
      </div>
    </div>

    <!-- Families Container -->
    <div class="families-container">
      <div class="families-header">
        <div class="families-title">All Fish Families</div>
        <div class="results-info">
          Showing {{ families.length }} of {{ pagination.total }} families
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading families...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadFamilies" class="retry-button">Retry</button>
      </div>

      <!-- Enhanced Table View -->
      <div v-else class="table-container">
        <table class="families-table">
          <thead>
          <tr>
            <th></th>
            <th>Family</th>
            <th>Order</th>
            <th>Genera</th>
            <th>Species</th>
<!--            <th>Records</th>-->
            <th>Records</th>
            <th>Countries</th>
            <th>Georeferenced</th>
            <th>Date Quality</th>
          </tr>
          </thead>
          <tbody>
          <template v-for="family in sortedFamilies" :key="family.family">
            <!-- Main Row -->
            <tr
                class="table-row"
                :class="{ expanded: expandedFamily === family.family }"
                @click="toggleRow(family.family)"
            >
              <td>
                  <span
                      class="expand-icon"
                      :class="{ expanded: expandedFamily === family.family }"
                  >
                    ▼
                  </span>
              </td>
              <td>
                <span class="table-family-name clickable" @click.stop="navigateToFamily(family.family)">{{ family.family }}</span>
              </td>
              <td>
                <span class="order-badge">{{ family.order }}</span>
              </td>
              <td>{{ formatNumber(family.generaCount) }}</td>
              <td>{{ formatNumber(family.speciesCount) }}</td>
<!--              <td>{{ formatNumber(family.recordCount) }}</td>-->
              <td>
                <div class="records-bar-container">
                  <div
                      class="records-bar"
                      :style="{ width: getRecordsPercentage(family.recordCount) + '%' }"
                  ></div>
                  <div class="records-text">
                    {{ formatNumber(family.recordCount, 'short') }}
                  </div>
                </div>
              </td>
              <td>{{ formatNumber(family.countriesCount) }}</td>
              <td>
                  <span
                      class="quality-badge"
                      :class="getQualityClass(family.geoReferencingQuality)"
                  >
                    {{ family.geoReferencingQuality }}%
                  </span>
              </td>
              <td>
                  <span
                      class="quality-badge"
                      :class="getQualityClass(family.dateQuality)"
                  >
                    {{ family.dateQuality }}%
                  </span>
              </td>
            </tr>

            <!-- Expanded Card Row -->
            <tr
                v-if="expandedFamily === family.family"
                class="expanded-card"
            >
              <td colspan="10">
                <div class="card-content">
                  <div class="card-header">
                    <h3 class="card-title">{{ family.family }}</h3>
                    <span class="order-badge">{{ family.order }}</span>
                  </div>

                  <div class="card-stats-row">
                    <div class="card-stat">
                      <div class="card-stat-number">{{ formatNumber(family.generaCount) }}</div>
                      <div class="card-stat-label">Genera</div>
                    </div>
                    <div class="card-stat">
                      <div class="card-stat-number">{{ formatNumber(family.speciesCount) }}</div>
                      <div class="card-stat-label">Species</div>
                    </div>
                    <div class="card-stat">
                      <div class="card-stat-number">{{ formatNumber(family.recordCount, 'short') }}</div>
                      <div class="card-stat-label">Records</div>
                    </div>
                    <div class="card-stat">
                      <div class="card-stat-number">{{ formatNumber(family.countriesCount) }}</div>
                      <div class="card-stat-label">Countries</div>
                    </div>
                  </div>

                  <div class="card-meta">
                    <span>{{ formatNumber(family.institutionsCount) }} institutions</span>
                    <div class="card-quality">
                        <span
                            class="quality-badge"
                            :class="getQualityClass(family.geoReferencingQuality)"
                        >
                          Geo: {{ family.geoReferencingQuality }}%
                        </span>
                      <span
                          class="quality-badge"
                          :class="getQualityClass(family.dateQuality)"
                      >
                          Date: {{ family.dateQuality }}%
                        </span>
                    </div>
                  </div>

                  <div class="card-progress">
                    <div class="progress-label">Collection Completeness</div>
                    <div class="progress-bar">
                      <div
                          class="progress-fill"
                          :style="{ width: (family.collectionCompleteness || 85) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
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

          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === '...'" class="pagination-ellipsis">...</span>
            <button
                v-else
                class="pagination-btn"
                :class="{ active: page === pagination.page }"
                @click="changePage(page)"
            >
              {{ page }}
            </button>
          </template>

          <button
              class="pagination-btn"
              :disabled="pagination.page === totalPages"
              @click="changePage(pagination.page + 1)"
          >
            Next »
          </button>

          <div class="pagination-info">
            Showing {{ (pagination.page - 1) * pagination.perPage + 1 }}-{{ Math.min(pagination.page * pagination.perPage, pagination.total) }}
            of {{ pagination.total }} families
          </div>
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
  families,
  taxonomyStats,
  pagination,
  filters,
  fetchFamilies,
  fetchTaxonomyStats,
  updateFilters,
  updatePagination
} = useTaxonomy()

// 本地状态
const availableOrders = ref([])
const expandedFamily = ref(null)
const maxRecords = ref(0)

// 计算属性
const sortedFamilies = computed(() => {
  const sorted = families.value
      .slice()
      .sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))

  // Update max records for visualization
  if (sorted.length > 0) {
    maxRecords.value = Math.max(...sorted.map(f => f.recordCount || 0))
  }

  return sorted
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
const loadFamilies = async () => {
  try {
    await fetchFamilies()

    // 提取可用的目(Orders)
    const orders = [...new Set(families.value.map(f => f.order).filter(Boolean))]
    availableOrders.value = orders.sort()
  } catch (err) {
    console.error('Failed to load families:', err)
  }
}

const loadStats = async () => {
  try {
    await fetchTaxonomyStats()
  } catch (err) {
    console.error('Failed to load taxonomy stats:', err)
  }
}

const navigateToFamily = (familyName) => {
  router.push({
    name: 'FamilyDetail',
    params: { familyName }
  })
}

const applyFilters = () => {
  updatePagination({ page: 1 })
  loadFamilies()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    updatePagination({ page })
    loadFamilies()
  }
}

const toggleRow = (familyName) => {
  if (expandedFamily.value === familyName) {
    expandedFamily.value = null
  } else {
    expandedFamily.value = familyName
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

const getQualityClass = (percentage) => {
  if (percentage >= 90) return 'quality-excellent'
  if (percentage >= 80) return 'quality-good'
  return 'quality-fair'
}

// 操作按钮方法
const exportFamilySummary = () => {
  // 实现导出功能
  console.log('Exporting family summary...')
}

const openFamilyComparison = () => {
  // 实现家族比较功能
  console.log('Opening family comparison...')
}

const startDiversityAnalysis = () => {
  // 实现多样性分析功能
  console.log('Starting diversity analysis...')
}

// 生命周期
onMounted(() => {
  loadFamilies()
  loadStats()
})

// 监听筛选变化
watch(() => filters.search, debouncedSearch)
</script>

<style scoped>
/* 页面基础样式 */
.all-families-page {
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

/* 快速统计 */
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

/* 家族容器 */
.families-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 25px;
}

.families-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.families-title {
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

.families-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.families-table th {
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

.families-table td {
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

.table-family-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
}

.table-family-name.clickable {
  cursor: pointer;
  color: #2980b9;
}

.table-family-name.clickable:hover {
  color: #1a5276;
  text-decoration: underline;
}

.order-badge {
  background: #e8f4fd;
  color: #0288d1;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
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
  width: 100px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.card-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.card-stat {
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.card-stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.card-stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.card-quality {
  display: flex;
  gap: 10px;
}

.card-progress {
  margin-top: 15px;
}

.progress-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s ease;
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

.pagination-ellipsis {
  padding: 8px 12px;
  color: #666;
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

  .card-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .all-families-page {
    padding: 15px;
  }

  .global-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-stats-row {
    grid-template-columns: 1fr;
  }

  .page-actions {
    justify-content: center;
  }

  .families-table {
    font-size: 12px;
  }

  .families-table th,
  .families-table td {
    padding: 8px;
  }

  .table-family-name {
    font-size: 14px;
  }

  .card-title {
    font-size: 24px;
  }

  .card-content {
    padding: 20px;
    margin: 10px;
  }

  .records-bar-container {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .families-header {
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
}
</style>