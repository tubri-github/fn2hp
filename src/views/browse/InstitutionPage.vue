<template>
  <div class="institution-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading institution information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button @click="loadInstitutionData" class="retry-button">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else-if="currentInstitution">
      <!-- Institution Header -->
      <div class="institution-header">
        <div class="institution-main-info">
          <div class="institution-logo">
            {{ currentInstitution.institutionCode }}
          </div>
          <div class="institution-details">
            <h1 class="institution-name">{{ currentInstitution.institutionName }}</h1>
            <div class="institution-codes">
  <span class="code-tag">
                  <span class="dc-field">institutionCode:</span> {{ currentInstitution.institutionCode }}
                </span>
  <span v-if="currentInstitution.ownerInstitutionCode" class="code-tag">
                  <span class="dc-field">ownerInstitutionCode:</span> {{ currentInstitution.ownerInstitutionCode }}
                </span>
  </div>

  <div class="institution-location">
  <span class="icon">📍</span>
  {{ formatLocation(currentInstitution) }}
  </div>

  <div v-if="currentInstitution.institutionType" class="institution-type">
  <span class="dc-field">institutionType:</span> {{ currentInstitution.institutionType }}
  </div>
  </div>
  </div>

  <!-- <div class="institution-actions">
  <button class="action-button primary" @click="exportInstitutionData">
    <span class="icon">📊</span> Export Data
  </button>
  <button class="action-button secondary" @click="viewRecords">
    <span class="icon">🔍</span> View Records
  </button>
  <button class="action-button secondary" @click="contactInstitution">
    <span class="icon">📧</span> Contact
  </button>
  </div> -->
  </div>

  <!-- Statistics Overview -->
  <div class="stats-overview">
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.recordCount == null }">
      {{ currentInstitution.recordCount != null ? formatNumber(currentInstitution.recordCount) : '' }}
    </div>
    <div class="stat-label">Total Records</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.speciesCount == null }">
      {{ currentInstitution.speciesCount != null ? formatNumber(currentInstitution.speciesCount) : '' }}
    </div>
    <div class="stat-label">Species</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.familiesCount == null }">
      {{ currentInstitution.familiesCount != null ? formatNumber(currentInstitution.familiesCount) : '' }}
    </div>
    <div class="stat-label">Families</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.countriesCount == null }">
      {{ currentInstitution.countriesCount != null ? formatNumber(currentInstitution.countriesCount) : '' }}
    </div>
    <div class="stat-label">Countries</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.geoReferencingQuality == null }">
      {{ currentInstitution.geoReferencingQuality != null ? currentInstitution.geoReferencingQuality + '%' : '' }}
    </div>
    <div class="stat-label">Georeferenced</div>
  </div>
  <div class="stat-card">
    <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.dateQuality == null }">
      {{ currentInstitution.dateQuality != null ? currentInstitution.dateQuality + '%' : '' }}
    </div>
    <div class="stat-label">Date Quality</div>
  </div>
  </div>

  <!-- Content Tabs -->
  <div class="content-tabs">
  <div class="tab-nav">
    <button
        v-for="tab in availableTabs"
        :key="tab.key"
        class="tab-button"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>

  <!-- Overview Tab -->
  <div v-if="activeTab === 'overview'" class="tab-content">
    <div class="overview-grid">
      <!-- Institution Information -->
      <div class="info-section">
        <h3>Institution Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="dc-field">institutionCode:</span>
            <span>{{ currentInstitution.institutionCode }}</span>
          </div>
          <div v-if="currentInstitution.ownerInstitutionCode" class="info-item">
            <span class="dc-field">ownerInstitutionCode:</span>
            <span>{{ currentInstitution.ownerInstitutionCode }}</span>
          </div>
          <div v-if="currentInstitution.institutionType" class="info-item">
            <span class="dc-field">institutionType:</span>
            <span>{{ currentInstitution.institutionType }}</span>
          </div>
          <div v-if="currentInstitution.country" class="info-item">
            <span class="dc-field">country:</span>
            <span>{{ currentInstitution.country }}</span>
          </div>
          <div v-if="currentInstitution.stateProvince" class="info-item">
            <span class="dc-field">stateProvince:</span>
            <span>{{ currentInstitution.stateProvince }}</span>
          </div>
          <div v-if="currentInstitution.locality" class="info-item">
            <span class="dc-field">locality:</span>
            <span>{{ currentInstitution.locality }}</span>
          </div>
        </div>
      </div>

      <!-- Collection Information -->
      <div class="info-section">
        <h3>Collection Information</h3>
        <div class="collection-codes-section">
          <div class="collection-codes-label">
            <span class="dc-field">collectionCode</span> values:
          </div>
          <div class="collection-codes-list">
                    <span
                        v-for="code in currentInstitution.collectionCodes"
                        :key="code"
                        class="collection-code"
                    >
                      {{ code }}
                    </span>
          </div>
        </div>

        <div class="info-grid" style="margin-top: 20px;">
          <div class="info-item">
            <span class="label">First Record:</span>
            <span>{{ formatDate(currentInstitution.firstRecord) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Latest Record:</span>
            <span>{{ formatDate(currentInstitution.latestRecord) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Data Quality Score:</span>
            <span class="quality-score" :class="getQualityClass(currentInstitution.overallQuality)">
                      {{ currentInstitution.overallQuality || 0 }}%
                    </span>
          </div>
          <div class="info-item">
            <span class="label">Last Updated:</span>
            <span>{{ formatDate(currentInstitution.lastUpdated) }}</span>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div v-if="currentInstitution.contactInfo" class="info-section">
        <h3>Contact Information</h3>
        <div class="contact-info">
          <div v-if="currentInstitution.contactInfo.website" class="contact-item">
            <span class="icon">🌐</span>
            <a :href="currentInstitution.contactInfo.website" target="_blank" rel="noopener">
              {{ currentInstitution.contactInfo.website }}
            </a>
          </div>
          <div v-if="currentInstitution.contactInfo.email" class="contact-item">
            <span class="icon">📧</span>
            <a :href="`mailto:${currentInstitution.contactInfo.email}`">
              {{ currentInstitution.contactInfo.email }}
            </a>
          </div>
          <div v-if="currentInstitution.contactInfo.phone" class="contact-item">
            <span class="icon">📞</span>
            <span>{{ currentInstitution.contactInfo.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Data Quality Metrics -->
      <div class="info-section">
        <h3>Data Quality Metrics</h3>
        <div class="quality-metrics">
          <div class="quality-metric">
            <div class="metric-label">Geographic Coordinates</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: `${currentInstitution.geoReferencingQuality}%` }"></div>
            </div>
            <div class="metric-value">{{ currentInstitution.geoReferencingQuality }}%</div>
          </div>
          <div class="quality-metric">
            <div class="metric-label">Date Information</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: `${currentInstitution.dateQuality}%` }"></div>
            </div>
            <div class="metric-value">{{ currentInstitution.dateQuality }}%</div>
          </div>
          <div class="quality-metric">
            <div class="metric-label">Taxonomic Identification</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: `${currentInstitution.taxonomicQuality}%` }"></div>
            </div>
            <div class="metric-value">{{ currentInstitution.taxonomicQuality }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Species Tab -->
  <div v-if="activeTab === 'species'" class="tab-content">
    <div class="species-section">
      <div class="species-header">
        <h3>Species from this Institution</h3>
        <div class="species-controls">
          <input
              type="text"
              placeholder="Search species..."
              v-model="speciesSearch"
              class="search-input"
          />
          <select v-model="speciesSort" class="sort-select">
            <option value="records_desc">Most Records</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="family_asc">Family (A-Z)</option>
            <option value="recent_desc">Recently Added</option>
          </select>
        </div>
      </div>

      <div v-if="loadingSpecies" class="loading-species">
        Loading species data...
      </div>

      <div v-else class="species-grid">
        <div
            v-for="species in filteredSpecies"
            :key="species.scientificName"
            class="species-card"
            @click="navigateToSpecies(species.scientificName)"
        >
          <div class="species-header">
            <h4 class="species-name">{{ species.scientificName }}</h4>
            <!-- <span v-if="species.vernacularName" class="species-common">{{ species.vernacularName }}</span> -->
          </div>
          <div class="species-meta">
            <span class="species-family">{{ species.family }}</span>
            <span class="species-authority">{{ species.authority }}</span>
          </div>
          <div class="species-stats">
            <div class="species-stat">
              <span class="stat-value">{{ formatNumber(species.recordCount) }}</span>
              <span class="stat-label">records</span>
            </div>
            <div class="species-stat">
              <span class="stat-value">{{ formatNumber(species.countriesCount) }}</span>
              <span class="stat-label">countries</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Species Pagination -->
      <div v-if="speciesPagination.total > speciesPagination.perPage" class="pagination">
        <button
            class="pagination-btn"
            :disabled="speciesPagination.page === 1"
            @click="changeSpeciesPage(speciesPagination.page - 1)"
        >
          « Previous
        </button>

        <span class="pagination-info">
                  Page {{ speciesPagination.page }} of {{ Math.ceil(speciesPagination.total / speciesPagination.perPage) }}
                </span>

        <button
            class="pagination-btn"
            :disabled="speciesPagination.page >= Math.ceil(speciesPagination.total / speciesPagination.perPage)"
            @click="changeSpeciesPage(speciesPagination.page + 1)"
        >
          Next »
        </button>
      </div>
    </div>
  </div>

  <!-- Records Tab -->
  <div v-if="activeTab === 'records'" class="tab-content">
    <RecordsTable
        :institution-code="institutionCode"
        :show-search="true"
        :show-export="true"
    />
  </div>

<!-- Geography Tab -->
<div v-if="activeTab === 'geography'" class="tab-content">
  <div class="geography-section">
    <h3>Geographic Coverage</h3>

    <InstitutionRecordsMap
        :institution-code="institutionCode"
        :records="institutionRecords"
        :loading="loadingRecords"
        @record-clicked="handleRecordClick"
    />

    <!-- Countries Summary -->
    <div v-if="geographyData.countries" class="countries-summary">
      <h4>Countries with Records</h4>
      <div class="countries-grid">
        <div
            v-for="country in geographyData.countries"
            :key="country.code"
            class="country-item"
        >
          <div class="country-header">
            <div class="country-name">{{ country.name }}</div>
            <div class="country-count">{{ formatNumber(country.recordCount) }}</div>
          </div>
          <div class="country-stats">
            <span>{{ formatNumber(country.speciesCount) }} species</span>
            <span>{{ formatNumber(country.familiesCount) }} families</span>
          </div>
          <div class="country-quality">
            Quality: {{ country.dataQuality }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!--&lt;!&ndash; Collaboration Tab &ndash;&gt;-->
<!--<div v-if="activeTab === 'collaboration'" class="tab-content">-->
<!--  <div class="collaboration-section">-->
<!--    <h3>Institutional Collaborations</h3>-->

<!--    <div class="collaboration-placeholder">-->
<!--      <p>Collaboration network visualization coming soon...</p>-->
<!--    </div>-->

<!--    <div v-if="collaborationData.partners" class="partners-list">-->
<!--      <h4>Collaboration Partners</h4>-->
<!--      <div class="partners-grid">-->
<!--        <div-->
<!--            v-for="partner in collaborationData.partners"-->
<!--            :key="partner.institutionCode"-->
<!--            class="partner-item"-->
<!--            @click="navigateToInstitution(partner.institutionCode)"-->
<!--        >-->
<!--          <div class="partner-logo">{{ partner.institutionCode }}</div>-->
<!--          <div class="partner-info">-->
<!--            <div class="partner-name">{{ partner.institutionName }}</div>-->
<!--            <div class="partner-stats">-->
<!--              {{ formatNumber(partner.sharedSpecies) }} shared species-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</div>-->
</div>
</div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInstitutions } from '@/composables/useInstitutions.js'
import RecordsTable from '@/components/Browse/RecordsTable.vue'

import InstitutionRecordsMap from '@/components/Browse/InstitutionRecordsMap.vue'

// 添加记录相关的响应式数据
const institutionRecords = ref([])
const loadingRecords = ref(false)

// Props
const props = defineProps({
  institutionCode: {
    type: String,
    required: true
  }
})

const router = useRouter()

// Composables
const {
  loading,
  error,
  currentInstitution,
  fetchInstitutionDetail,
  fetchInstitutionRecords
} = useInstitutions()

// Local state
const activeTab = ref('overview')
const loadingSpecies = ref(false)
const species = ref([])
const speciesSearch = ref('')
const speciesSort = ref('records_desc')
const speciesPagination = ref({
  page: 1,
  perPage: 20,
  total: 0
})
const geographyData = ref({})
const collaborationData = ref({})

// Computed properties
const availableTabs = computed(() => [
  { key: 'overview', label: 'Overview' },
  { key: 'species', label: 'Species' },
  { key: 'records', label: 'Records' },
  { key: 'geography', label: 'Geography' },
  // { key: 'collaboration', label: 'Collaboration' }
])

const filteredSpecies = computed(() => {
  let filtered = species.value

  // Apply search filter
  if (speciesSearch.value) {
    const search = speciesSearch.value.toLowerCase()
    filtered = filtered.filter(sp =>
        sp.scientificName.toLowerCase().includes(search) ||
        (sp.vernacularName && sp.vernacularName.toLowerCase().includes(search)) ||
        sp.family.toLowerCase().includes(search)
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (speciesSort.value) {
      case 'name_asc':
        return a.scientificName.localeCompare(b.scientificName)
      case 'family_asc':
        return a.family.localeCompare(b.family)
      case 'records_desc':
        return (b.recordCount || 0) - (a.recordCount || 0)
      case 'recent_desc':
        return new Date(b.lastRecord || 0) - new Date(a.lastRecord || 0)
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const loadInstitutionRecords = async () => {
  loadingRecords.value = true
  try {
    const response = await fetchInstitutionRecords(props.institutionCode, {
      per_page: 1000, // 获取更多记录用于地图显示
      // 只获取有地理坐标的记录
      georeferenced_only: true
    })

    // 过滤出有有效坐标的记录
    institutionRecords.value = response.filter(record =>
        record.decimalLatitude &&
        record.decimalLongitude &&
        !isNaN(parseFloat(record.decimalLatitude)) &&
        !isNaN(parseFloat(record.decimalLongitude))
    )

    console.log('Loaded georeferenced records:', institutionRecords.value.length)
  } catch (err) {
    console.error('Failed to load institution records:', err)
    institutionRecords.value = []
  } finally {
    loadingRecords.value = false
  }
}

const loadInstitutionData = async () => {
  try {
    await fetchInstitutionDetail(props.institutionCode)

    if (currentInstitution.value) {
      await Promise.all([
        loadSpeciesData(),
        loadGeographyData(),
        loadCollaborationData(),
        loadInstitutionRecords()
      ])
    }
  } catch (err) {
    console.error('Failed to load institution data:', err)
  }
}

const loadSpeciesData = async () => {
  loadingSpecies.value = true
  try {
    // Mock species data
    species.value = generateMockSpecies()
    speciesPagination.value.total = species.value.length
  } catch (err) {
    console.error('Failed to load species data:', err)
  } finally {
    loadingSpecies.value = false
  }
}

const loadGeographyData = async () => {
  try {
    // Mock geography data
    geographyData.value = {
      countries: [
        {
          code: 'US',
          name: 'United States',
          recordCount: 8450,
          speciesCount: 124,
          familiesCount: 45,
          dataQuality: 94
        },
        {
          code: 'CA',
          name: 'Canada',
          recordCount: 3210,
          speciesCount: 87,
          familiesCount: 32,
          dataQuality: 91
        },
        {
          code: 'MX',
          name: 'Mexico',
          recordCount: 1890,
          speciesCount: 56,
          familiesCount: 28,
          dataQuality: 89
        }
      ]
    }
  } catch (err) {
    console.error('Failed to load geography data:', err)
  }
}

const loadCollaborationData = async () => {
  try {
    // Mock collaboration data
    collaborationData.value = {
      partners: [
        {
          institutionCode: 'AMNH',
          institutionName: 'American Museum of Natural History',
          sharedSpecies: 234
        },
        {
          institutionCode: 'CAS',
          institutionName: 'California Academy of Sciences',
          sharedSpecies: 189
        },
        {
          institutionCode: 'FLMNH',
          institutionName: 'Florida Museum of Natural History',
          sharedSpecies: 156
        }
      ]
    }
  } catch (err) {
    console.error('Failed to load collaboration data:', err)
  }
}

const generateMockSpecies = () => {
  const families = ['Cyprinidae', 'Percidae', 'Salmonidae', 'Centrarchidae', 'Ictaluridae']
  const count = Math.floor(Math.random() * 30) + 10

  return Array.from({ length: count }, (_, i) => ({
    scientificName: `Species example ${i + 1}`,
    vernacularName: i % 3 === 0 ? `Common Name ${i + 1}` : null,
    family: families[Math.floor(Math.random() * families.length)],
    authority: 'Linnaeus, 1758',
    recordCount: Math.floor(Math.random() * 1000) + 50,
    countriesCount: Math.floor(Math.random() * 15) + 1,
    lastRecord: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

const navigateToSpecies = (scientificName) => {
  router.push({
    name: 'SpeciesDetail',
    params: { scientificName: encodeURIComponent(scientificName) }
  })
}

const navigateToInstitution = (institutionCode) => {
  router.push({
    name: 'InstitutionDetail',
    params: { institutionCode }
  })
}

const changeSpeciesPage = (page) => {
  speciesPagination.value.page = page
  // In real implementation, this would reload data
}

// Utility functions
const formatNumber = (num) => {
  if (!num) return '0'
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
  if (percentage >= 90) return 'excellent'
  if (percentage >= 80) return 'good'
  return 'fair'
}

// Action methods
const exportInstitutionData = () => {
  console.log(`Exporting data for institution ${props.institutionCode}`)
}

const viewRecords = () => {
  activeTab.value = 'records'
}

const contactInstitution = () => {
  console.log(`Opening contact form for ${props.institutionCode}`)
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted, initial state:', {
    loading: loading.value,
    error: error.value,
    institution: currentInstitution.value
  })
  loadInstitutionData()
})

// Watch for route changes
watch(() => props.institutionCode, () => {
  loadInstitutionData()
}, { immediate: false })

watch([loading, error, currentInstitution], ([newLoading, newError, newInstitution]) => {
  console.log('State changed:', {
    loading: newLoading,
    error: newError,
    institution: newInstitution,
    hasInstitution: !!newInstitution
  })
}, { immediate: true })
</script>

<style scoped>
.institution-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

/* Institution Header */
.institution-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.institution-main-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
}

.institution-logo {
  width: 80px;
  height: 80px;
  background: #3498db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.institution-details {
  flex: 1;
}

.institution-name {
  margin: 0 0 15px 0;
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1.2;
}

.institution-codes {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.code-tag {
  background: #e8f4fd;
  color: #0288d1;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.institution-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #666;
  font-size: 16px;
}

.institution-type {
  color: #666;
  font-size: 14px;
}

.institution-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 30px;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-button.primary {
  background: #3498db;
  color: white;
}

.action-button.secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-button .icon {
  margin-right: 6px;
}

/* Statistics Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Content Tabs */
.content-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-button.active {
  background: white;
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.tab-button:hover:not(.active) {
  background: #e9ecef;
}

.tab-content {
  padding: 30px;
}

/* Overview Tab */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.info-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item a {
  color: #3498db;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
  font-weight: normal;
}

.label {
  font-weight: 500;
  color: #666;
}

.quality-score {
  font-weight: bold;
}

.quality-score.excellent { color: #27ae60; }
.quality-score.good { color: #f39c12; }
.quality-score.fair { color: #e74c3c; }

/* Collection Codes */
.collection-codes-section {
  margin-bottom: 20px;
}

.collection-codes-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.collection-codes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.collection-code {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

/* Contact Information */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-item a {
  color: #3498db;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Quality Metrics */
.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quality-metric {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 15px;
  align-items: center;
}

.metric-label {
  font-size: 14px;
  color: #666;
}

.metric-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s;
}

.metric-value {
  font-weight: bold;
  color: #3498db;
  font-size: 14px;
}

/* Species Tab */
.species-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2c3e50;
}

.species-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.species-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input, .sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  width: 200px;
}

.loading-species {
  text-align: center;
  padding: 40px;
  color: #666;
}

.species-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.species-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
}

.species-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.species-header {
  margin-bottom: 10px;
}

.species-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  font-style: italic;
}

.species-common {
  font-size: 14px;
  color: #666;
  font-style: normal;
}

.species-meta {
  margin-bottom: 15px;
  font-size: 13px;
  color: #666;
}

.species-family {
  font-weight: 500;
  margin-right: 8px;
}

.species-authority {
  font-style: italic;
}

.species-stats {
  display: flex;
  gap: 20px;
}

.species-stat {
  text-align: center;
}

.species-stat .stat-value {
  display: block;
  font-weight: bold;
  color: #3498db;
  font-size: 16px;
}

.species-stat .stat-label {
  font-size: 12px;
  color: #666;
}

/* Geography Tab */
.geography-section h3 {
  margin: 0 0 25px 0;
  font-size: 18px;
  color: #2c3e50;
}

.map-placeholder, .collaboration-placeholder {
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px;
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.countries-summary h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.country-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.country-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.country-name {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
}

.country-count {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.country-stats {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.country-stats span {
  margin-right: 12px;
}

.country-quality {
  font-size: 12px;
  color: #666;
}

/* Collaboration Tab */
.collaboration-section h3 {
  margin: 0 0 25px 0;
  font-size: 18px;
  color: #2c3e50;
}

.partners-list h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.partner-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
}

.partner-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.partner-logo {
  width: 50px;
  height: 50px;
  background: #3498db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 12px;
  flex-shrink: 0;
}

.partner-info {
  flex: 1;
}

.partner-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.partner-stats {
  font-size: 14px;
  color: #666;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
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

/* Responsive Design */
@media (max-width: 1024px) {
  .institution-header {
    flex-direction: column;
    gap: 20px;
  }

  .institution-main-info {
    flex-direction: column;
    gap: 15px;
  }

  .institution-actions {
    flex-direction: row;
    margin-left: 0;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .species-header, .countries-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .species-controls {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .institution-page {
    padding: 15px;
  }

  .institution-name {
    font-size: 24px;
  }

  .tab-nav {
    flex-wrap: wrap;
  }

  .tab-content {
    padding: 20px;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .species-grid, .countries-grid, .partners-grid {
    grid-template-columns: 1fr;
  }

  .species-controls {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .quality-metric {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .metric-bar {
    order: 2;
  }

  .metric-value {
    order: 3;
  }
}

/* Skeleton loading */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
  color: transparent !important;
  min-width: 60px;
  min-height: 1.2em;
}
</style>