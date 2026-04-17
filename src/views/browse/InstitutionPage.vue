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
    <div v-else-if="currentInstitution" class="container">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> &gt;
        <router-link to="/browse">Browse</router-link> &gt;
        <router-link to="/browse/providers">Data Providers</router-link> &gt;
        <strong>{{ currentInstitution.institutionCode }}</strong>
      </div>

      <!-- Institution Header -->
      <div class="institution-header" :class="{ 'has-hero': blurb && blurb.heroImage }">
        <!-- Hero image background (faded right side) -->
        <div v-if="blurb && blurb.heroImage" class="header-hero-bg">
          <img :src="blurb.heroImage" :alt="currentInstitution.institutionCode" />
        </div>
        <div class="header-content">
          <div class="institution-title">
            <div class="institution-logo">{{ currentInstitution.institutionCode }}</div>
            <div class="institution-title-text">
              <h1 class="institution-name">{{ currentInstitution.officialName || currentInstitution.institutionName }}</h1>
              <div v-if="currentInstitution.alternateName" class="institution-alternate">
                {{ currentInstitution.alternateName }}
              </div>
            </div>
          </div>

          <div class="darwin-core-fields">
          <div class="dc-field-group">
            <div class="dc-label">institutionCode</div>
            <div class="dc-value">{{ currentInstitution.institutionCode }}</div>
          </div>
          <div v-if="currentInstitution.ownerInstitutionCode" class="dc-field-group">
            <div class="dc-label">ownerInstitutionCode</div>
            <div class="dc-value">{{ currentInstitution.ownerInstitutionCode }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">Location</div>
            <div class="dc-value">{{ formatLocation(currentInstitution) }}</div>
          </div>
          <div v-if="currentInstitution.source" class="dc-field-group">
            <div class="dc-label">Data Source</div>
            <div class="dc-value">{{ currentInstitution.source }}</div>
          </div>
        </div>
      </div>
      </div>

      <!-- Tab Navigation -->
      <nav class="nav-menu">
        <ul>
          <li v-if="blurb && blurb.paragraphs"><a :class="{ active: activeTab === 'about' }" @click.prevent="activeTab = 'about'">About</a></li>
          <li><a :class="{ active: activeTab === 'overview' }" @click.prevent="activeTab = 'overview'">Overview</a></li>
          <li><a :class="{ active: activeTab === 'species' }" @click.prevent="activeTab = 'species'">Species</a></li>
          <li><a :class="{ active: activeTab === 'distribution' }" @click.prevent="activeTab = 'distribution'">Geographic Distribution</a></li>
        </ul>
      </nav>

      <!-- About Section (Blurb Text) -->
      <section v-if="activeTab === 'about' && blurb && blurb.paragraphs" class="section">
        <h2 class="section-title">About This Institution</h2>
        <div class="institution-blurb">
          <p v-for="(para, idx) in blurbParagraphs" :key="idx" class="blurb-paragraph">
            {{ para }}
          </p>
        </div>
        <!-- Inline images from original documents -->
        <div v-if="blurb.images && blurb.images.length" class="blurb-images">
          <div v-for="(img, idx) in blurb.images" :key="idx" class="blurb-image-item">
            <img :src="img" :alt="`${currentInstitution.institutionCode} collection image ${idx + 1}`" class="blurb-image" />
            <span v-if="blurbImageCaptions[idx]" class="blurb-image-caption">{{ blurbImageCaptions[idx] }}</span>
          </div>
        </div>
      </section>

      <!-- Overview Section -->
      <section v-if="activeTab === 'overview'" class="section">
        <h2 class="section-title">Institution Overview</h2>

        <!-- Statistics Cards - matching TaxonPage style -->
        <div class="overview-stats-grid">
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.recordCount == null }">
                {{ currentInstitution.recordCount != null ? formatNumber(currentInstitution.recordCount) : '' }}
              </div>
              <div class="stat-label">Total Records</div>
              <div class="stat-context">Preserved specimens</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.speciesCount == null }">
                {{ currentInstitution.speciesCount != null ? formatNumber(currentInstitution.speciesCount) : '' }}
              </div>
              <div class="stat-label">Species</div>
              <div class="stat-context">Taxonomic diversity</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.familiesCount == null }">
                {{ currentInstitution.familiesCount != null ? formatNumber(currentInstitution.familiesCount) : '' }}
              </div>
              <div class="stat-label">Families</div>
              <div class="stat-context">Family coverage</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.countriesCount == null }">
                {{ currentInstitution.countriesCount != null ? formatNumber(currentInstitution.countriesCount) : '' }}
              </div>
              <div class="stat-label">Countries</div>
              <div class="stat-context">Geographic coverage</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.geoReferencingQuality == null }">
                {{ currentInstitution.geoReferencingQuality != null ? currentInstitution.geoReferencingQuality + '%' : '' }}
              </div>
              <div class="stat-label">Georeferenced</div>
              <div class="stat-context">With coordinates</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number" :class="{ 'skeleton-text': currentInstitution.dateQuality == null }">
                {{ currentInstitution.dateQuality != null ? currentInstitution.dateQuality + '%' : '' }}
              </div>
              <div class="stat-label">Date Quality</div>
              <div class="stat-context">With collection date</div>
            </div>
          </div>
        </div>

        <!-- Main Overview Content -->
        <div class="overview-main-content">
          <!-- Left: Institution Details -->
          <div class="overview-left">
            <!-- Contact & Links -->
            <div class="info-card">
              <h3>Contact Information</h3>
              <div class="contact-list">
                <div v-if="currentInstitution.website" class="contact-row">
                  <span class="contact-label">Website</span>
                  <a :href="currentInstitution.website" target="_blank" rel="noopener">{{ currentInstitution.website }}</a>
                </div>
                <div v-if="currentInstitution.email" class="contact-row">
                  <span class="contact-label">Email</span>
                  <a :href="`mailto:${currentInstitution.email}`">{{ currentInstitution.email }}</a>
                </div>
                <div v-if="currentInstitution.phone" class="contact-row">
                  <span class="contact-label">Phone</span>
                  <span>{{ currentInstitution.phone }}</span>
                </div>
                <div v-if="currentInstitution.address" class="contact-row">
                  <span class="contact-label">Address</span>
                  <span>{{ currentInstitution.address }}</span>
                </div>
              </div>

              <!-- Social Media -->
              <div v-if="currentInstitution.twitter || currentInstitution.facebook || currentInstitution.instagram" class="social-media">
                <div class="social-label">Social Media</div>
                <div class="social-links">
                  <a v-if="currentInstitution.twitter" :href="`https://twitter.com/${currentInstitution.twitter.replace('@', '')}`" target="_blank" class="social-link twitter" title="Twitter">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a v-if="currentInstitution.facebook" :href="`https://facebook.com/${currentInstitution.facebook.replace('@', '')}`" target="_blank" class="social-link facebook" title="Facebook">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a v-if="currentInstitution.instagram" :href="`https://instagram.com/${currentInstitution.instagram.replace('@', '')}`" target="_blank" class="social-link instagram" title="Instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                </div>
              </div>

              <!-- External Data Sources -->
              <div v-if="externalDataUrls.length > 0" class="external-data">
                <div class="external-label">Data Sources</div>
                <div class="external-links-list">
                  <a v-for="(url, index) in externalDataUrls" :key="index" :href="url.href" target="_blank" rel="noopener" class="external-link-item">
                    {{ url.label }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Collection Information -->
            <div class="info-card" v-if="currentInstitution.preparationType || currentInstitution.environment || currentInstitution.specimensAmount">
              <h3>Collection Information</h3>
              <div class="info-list">
                <div v-if="currentInstitution.specimensAmount" class="info-row">
                  <span class="info-label">Total Specimens:</span>
                  <span class="info-value">{{ formatNumber(currentInstitution.specimensAmount) }}</span>
                </div>
                <div v-if="currentInstitution.establishTime" class="info-row">
                  <span class="info-label">Established:</span>
                  <span class="info-value">{{ currentInstitution.establishTime }}</span>
                </div>
                <div v-if="currentInstitution.preparationType" class="info-row">
                  <span class="info-label">Preparation Types:</span>
                  <span class="info-value">{{ formatArrayField(currentInstitution.preparationType) }}</span>
                </div>
                <div v-if="currentInstitution.environment" class="info-row">
                  <span class="info-label">Environments:</span>
                  <span class="info-value">{{ formatArrayField(currentInstitution.environment) }}</span>
                </div>
                <div v-if="currentInstitution.geneticResources" class="info-row">
                  <span class="info-label">Genetic Resources:</span>
                  <span class="info-value">{{ formatArrayField(currentInstitution.geneticResources) }}</span>
                </div>
                <div v-if="currentInstitution.primaryTypeLots !== null && currentInstitution.primaryTypeLots !== undefined" class="info-row">
                  <span class="info-label">Primary Type Lots:</span>
                  <span class="info-value">{{ currentInstitution.primaryTypeLots ? 'Yes' : 'No' }}</span>
                </div>
                <div v-if="currentInstitution.secondaryTypeLots !== null && currentInstitution.secondaryTypeLots !== undefined" class="info-row">
                  <span class="info-label">Secondary Type Lots:</span>
                  <span class="info-value">{{ currentInstitution.secondaryTypeLots ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Staff Contacts -->
          <div class="overview-right">
            <div v-if="currentInstitution.contacts && currentInstitution.contacts.length > 0" class="info-card">
              <h3>Staff Contacts</h3>
              <div class="contacts-list">
                <div v-for="(contact, index) in currentInstitution.contacts" :key="index" class="contact-card">
                  <div class="contact-name">{{ contact.firstName }} {{ contact.lastName }}</div>
                  <div v-if="contact.title || contact.contactType" class="contact-title">
                    {{ contact.title || contact.contactType }}
                  </div>
                  <div v-if="contact.email" class="contact-email">
                    <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
                  </div>
                  <div v-if="contact.phone" class="contact-phone">{{ contact.phone }}</div>
                </div>
              </div>
            </div>

            <!-- Data Quality -->
            <div class="info-card">
              <h3>Data Quality Metrics</h3>
              <div class="quality-metrics">
                <div class="quality-metric">
                  <div class="metric-label">Geographic Coordinates</div>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: `${currentInstitution.geoReferencingQuality || 0}%` }"></div>
                  </div>
                  <div class="metric-value">{{ currentInstitution.geoReferencingQuality || 0 }}%</div>
                </div>
                <div class="quality-metric">
                  <div class="metric-label">Date Information</div>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: `${currentInstitution.dateQuality || 0}%` }"></div>
                  </div>
                  <div class="metric-value">{{ currentInstitution.dateQuality || 0 }}%</div>
                </div>
                <div class="quality-metric">
                  <div class="metric-label">Taxonomic Identification</div>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: `${currentInstitution.taxonomicQuality || 0}%` }"></div>
                  </div>
                  <div class="metric-value">{{ currentInstitution.taxonomicQuality || 0 }}%</div>
                </div>
              </div>
            </div>

            <!-- Location Mini Map -->
            <div v-if="institutionCoords" class="info-card location-mini-card">
              <h3>Location</h3>
              <div ref="locationMapEl" class="location-mini-map"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Species Section -->
      <section v-if="activeTab === 'species'" class="section">
        <h2 class="section-title">Species from this Institution</h2>

        <div class="section-controls">
          <input type="text" placeholder="Filter species by name..." v-model="speciesSearch" class="filter-input" style="flex: 1;">
          <select v-model="speciesSort" class="filter-select">
            <option value="records_desc">Sort by Record Count</option>
            <option value="name_asc">Sort by Name (A-Z)</option>
            <option value="family_asc">Sort by Family</option>
          </select>
        </div>

        <div v-if="loadingSpecies" class="loading-children">Loading species data...</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Scientific Name</th>
                <th>Family</th>
                <th>Records</th>
                <th>Countries</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, index) in species" :key="sp.scientificName" class="table-row" @click="navigateToSpecies(sp.scientificName)">
                <td>{{ (speciesPagination.page - 1) * speciesPagination.perPage + index + 1 }}</td>
                <td><span class="species-name">{{ sp.scientificName }}</span></td>
                <td>{{ sp.family }}</td>
                <td>
                  <div class="records-bar-container">
                    <div class="records-bar" :style="{ width: getSpeciesRecordsPercentage(sp.recordCount) + '%' }"></div>
                    <div class="records-text">{{ formatNumber(sp.recordCount) }}</div>
                  </div>
                </td>
                <td>{{ sp.countriesCount || 0 }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="species.length === 0" class="no-data">
            No species data available
          </div>
        </div>

        <!-- Species Pagination -->
        <div v-if="speciesPagination.total > speciesPagination.perPage" class="pagination">
          <div class="pagination-info">
            Showing {{ (speciesPagination.page - 1) * speciesPagination.perPage + 1 }}-{{ Math.min(speciesPagination.page * speciesPagination.perPage, speciesPagination.total) }}
            of {{ formatNumber(speciesPagination.total) }} species
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" :disabled="speciesPagination.page === 1" @click="changeSpeciesPage(speciesPagination.page - 1)">
              Previous
            </button>
            <span class="pagination-current">Page {{ speciesPagination.page }} of {{ speciesPagination.pages }}</span>
            <button class="pagination-btn" :disabled="speciesPagination.page >= speciesPagination.pages" @click="changeSpeciesPage(speciesPagination.page + 1)">
              Next
            </button>
          </div>
        </div>
      </section>

      <!-- Geographic Distribution Section -->
      <section v-if="activeTab === 'distribution'" class="section">
        <h2 class="section-title">Geographic Distribution</h2>

        <div class="full-width-map-container">
          <div v-if="loadingMapData" class="skeleton-block" style="height: 400px"></div>
          <CompactHeatMap
              v-else
              :data="mapPoints"
              :height="400"
              mode="heatmap"
              @bounds-changed="onMapBoundsChanged"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import { useInstitutions } from '@/composables/useInstitutions.js'
import { institutionsApi } from '@/api/institutions.js'
import CompactHeatMap from '@/components/charts/CompactHeatMap.vue'
import L from 'leaflet'
import { getInstitutionBlurb } from '@/data/institutionBlurbs.js'

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
  fetchInstitutionDetailV2
} = useInstitutions()

// Local state
const activeTab = ref('overview')
const loadingSpecies = ref(false)
const loadingMapData = ref(false)
const species = ref([])
const speciesSearch = ref('')
const speciesSort = ref('records_desc')
const mapPoints = ref([])
const mapAbortController = ref(null)
const locationMapEl = ref(null)
let locationMap = null

// Species pagination
const speciesPagination = reactive({
  page: 1,
  perPage: 25,
  total: 0,
  pages: 0
})

// Institution blurb data
const blurb = computed(() => getInstitutionBlurb(props.institutionCode))

// Filter out image attribution lines from blurb paragraphs
const blurbParagraphs = computed(() => {
  if (!blurb.value || !blurb.value.paragraphs) return []
  return blurb.value.paragraphs.filter(p => !p.startsWith('Image:'))
})

// Extract image captions from "Image:" lines
const blurbImageCaptions = computed(() => {
  if (!blurb.value || !blurb.value.paragraphs) return []
  return blurb.value.paragraphs
    .filter(p => p.startsWith('Image:'))
    .map(p => p.replace(/^Image:\s*/, ''))
})

// Institution coordinates for location map
const institutionCoords = computed(() => {
  if (!currentInstitution.value) return null
  const lat = parseFloat(currentInstitution.value.latitude)
  const lng = parseFloat(currentInstitution.value.longitude)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
})

// Computed
const maxSpeciesRecords = computed(() => {
  return Math.max(...species.value.map(s => s.recordCount || 0), 1)
})

// Parse external data URLs from concatenated string
const externalDataUrls = computed(() => {
  if (!currentInstitution.value) return []

  const urls = []
  const dataUrl = currentInstitution.value.dataUrl
  const gbifLink = currentInstitution.value.gbifLink

  // Parse dataUrl - may contain multiple URLs separated by ; or ,
  if (dataUrl && typeof dataUrl === 'string') {
    const urlParts = dataUrl.split(/[;,]/).map(u => u.trim()).filter(u => u.startsWith('http'))
    urlParts.forEach(url => {
      urls.push({
        href: url,
        label: getUrlLabel(url)
      })
    })
  }

  // Add gbifLink if not already included
  if (gbifLink && typeof gbifLink === 'string' && gbifLink.startsWith('http')) {
    const alreadyHasGbif = urls.some(u => u.href.includes('gbif.org'))
    if (!alreadyHasGbif) {
      urls.push({
        href: gbifLink,
        label: 'GBIF'
      })
    }
  }

  return urls
})

// Get label from URL
const getUrlLabel = (url) => {
  if (url.includes('gbif.org')) return 'GBIF'
  if (url.includes('idigbio.org')) return 'iDigBio'
  if (url.includes('vertnet.org')) return 'VertNet'
  if (url.includes('fishnet2.net')) return 'FishNet 2'
  if (url.includes('arctos.database')) return 'Arctos'
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname
  } catch {
    return 'Link'
  }
}

// Methods
const loadInstitutionData = async () => {
  // Reset state before loading new data
  currentInstitution.value = null
  species.value = []
  mapPoints.value = []
  speciesPagination.page = 1
  speciesPagination.total = 0
  speciesPagination.pages = 0

  try {
    await fetchInstitutionDetailV2(props.institutionCode)

    if (currentInstitution.value) {
      // Set default tab - show About if blurb exists
      const blurbData = getInstitutionBlurb(props.institutionCode)
      activeTab.value = blurbData && blurbData.paragraphs ? 'about' : 'overview'

      // Load species and map data in parallel
      loadSpeciesData()
      loadMapPoints({ zoom: 2 })

      // Init location map if overview is the default tab
      if (activeTab.value === 'overview' && institutionCoords.value) {
        nextTick(() => initLocationMap())
      }
    }
  } catch (err) {
    console.error('Failed to load institution data:', err)
  }
}

const loadSpeciesData = async () => {
  loadingSpecies.value = true
  try {
    const response = await institutionsApi.getInstitutionSpecies(props.institutionCode, {
      page: speciesPagination.page,
      per_page: speciesPagination.perPage,
      search: speciesSearch.value || undefined,
      sort_by: speciesSort.value
    })
    species.value = response.data || []
    speciesPagination.total = response.total || 0
    speciesPagination.pages = response.pages || Math.ceil(speciesPagination.total / speciesPagination.perPage)
  } catch (err) {
    console.error('Failed to load species data:', err)
    species.value = []
  } finally {
    loadingSpecies.value = false
  }
}

// Load map points using the map-points API (same as TaxonPage)
const loadMapPoints = async (params = {}) => {
  // Cancel any pending request
  if (mapAbortController.value) {
    mapAbortController.value.abort()
  }
  mapAbortController.value = new AbortController()

  loadingMapData.value = true
  try {
    const response = await institutionsApi.getInstitutionMapPoints(
      props.institutionCode,
      params,
      { signal: mapAbortController.value.signal }
    )

    // Response format: { points: [[lat, lng, weight], ...], total: N }
    mapPoints.value = response.points || []
    console.log('Map points loaded:', mapPoints.value.length)
  } catch (err) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      console.log('Map points request cancelled')
      return
    }
    console.error('Failed to load map points:', err)
    mapPoints.value = []
  } finally {
    loadingMapData.value = false
  }
}

// Map bounds changed handler (debounced)
const onMapBoundsChanged = debounce(({ bounds, zoom }) => {
  loadMapPoints({
    south: bounds.south.toFixed(4),
    north: bounds.north.toFixed(4),
    west: bounds.west.toFixed(4),
    east: bounds.east.toFixed(4),
    zoom: zoom || 2
  })
}, 500)

const changeSpeciesPage = (page) => {
  if (page >= 1 && page <= speciesPagination.pages) {
    speciesPagination.page = page
    loadSpeciesData()
  }
}

const navigateToSpecies = (scientificName) => {
  router.push({
    name: 'SpeciesDetail',
    params: { scientificName: encodeURIComponent(scientificName) }
  })
}

const getSpeciesRecordsPercentage = (recordCount) => {
  return maxSpeciesRecords.value > 0 ? (recordCount / maxSpeciesRecords.value) * 100 : 0
}

// Utility functions
const formatNumber = (num) => {
  if (num === null || num === undefined) return '-'
  if (num === 0) return '0'
  return num.toLocaleString()
}

const formatLocation = (institution) => {
  const parts = []
  if (institution.city) parts.push(institution.city)
  if (institution.state) parts.push(institution.state)
  if (institution.country) parts.push(institution.country)
  return parts.join(', ') || 'Location not specified'
}

const formatArrayField = (value) => {
  if (!value) return ''
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const arr = JSON.parse(value.replace(/'/g, '"'))
      return arr.join(', ')
    } catch {
      return value.replace(/[\[\]']/g, '')
    }
  }
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return value
}

// Location map
const initLocationMap = () => {
  if (locationMap) {
    locationMap.remove()
    locationMap = null
  }
  if (!locationMapEl.value || !institutionCoords.value) return

  const { lat, lng } = institutionCoords.value
  locationMap = L.map(locationMapEl.value, {
    center: [lat, lng],
    zoom: 5,
    scrollWheelZoom: false,
    attributionControl: false
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(locationMap)
  L.circleMarker([lat, lng], {
    radius: 8,
    fillColor: '#3498db',
    color: '#fff',
    weight: 2,
    fillOpacity: 0.9
  }).addTo(locationMap)
}

watch(activeTab, (tab) => {
  if (tab === 'overview' && institutionCoords.value) {
    nextTick(() => initLocationMap())
  }
})

// Lifecycle
onMounted(() => {
  loadInstitutionData()
})

onUnmounted(() => {
  if (locationMap) {
    locationMap.remove()
    locationMap = null
  }
})

// Watch for route changes
watch(() => props.institutionCode, () => {
  speciesPagination.page = 1
  loadInstitutionData()
}, { immediate: false })

// Watch for sort changes
watch(speciesSort, () => {
  speciesPagination.page = 1
  loadSpeciesData()
})

// Watch for search changes (debounced)
let searchTimeout = null
watch(speciesSearch, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    speciesPagination.page = 1
    loadSpeciesData()
  }, 300)
})
</script>

<style scoped>
.institution-page {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 40px auto;
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

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Institution Header */
.institution-header {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.institution-header:not(.has-hero) {
  padding: 25px;
}

.institution-header:not(.has-hero) .header-content {
  position: relative;
}

/* Hero image background */
.header-hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 55%;
  height: 100%;
  z-index: 0;
}

.header-hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 25px;
}

.has-hero .header-content {
  min-height: 160px;
}

.institution-title {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
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
  font-size: 18px;
  flex-shrink: 0;
}

.institution-title-text {
  flex: 1;
}

.institution-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.institution-alternate {
  font-size: 16px;
  color: #666;
  font-style: italic;
}

.darwin-core-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.dc-field-group {
  min-width: 150px;
}

.dc-label {
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dc-value {
  font-size: 15px;
  line-height: 1.4;
  color: #2c3e50;
}

/* Navigation menu */
.nav-menu {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 20px;
  padding: 0;
  position: sticky;
  top: 20px;
  z-index: 100;
}

.nav-menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e0e0e0;
}

.nav-menu li {
  flex: 1;
}

.nav-menu a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
}

.nav-menu a:hover {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

.nav-menu a.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: 600;
}

/* Section styles */
.section {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 25px;
  margin-bottom: 20px;
  scroll-margin-top: 100px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

/* Overview Stats Grid - matching TaxonPage */
.overview-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.overview-stat-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.stat-context {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

/* Institution Blurb */
.institution-blurb {
  margin-bottom: 30px;
  padding: 20px 24px;
  background: #f8fafe;
  border-radius: 8px;
}

.blurb-paragraph {
  font-size: 14.5px;
  line-height: 1.8;
  color: #444;
  margin: 0 0 14px 0;
}

.blurb-paragraph:last-child {
  margin-bottom: 0;
}

/* Blurb inline images */
.blurb-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.blurb-image-item {
  text-align: center;
}

.blurb-image {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.blurb-image-caption {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #888;
  font-style: italic;
}

/* Location Mini Map */
.location-mini-card {
  padding-bottom: 12px;
}

.location-mini-map {
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
}

/* Overview Main Content */
.overview-main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.overview-left, .overview-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Info Card */
.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.info-card h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #2c3e50;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

/* Contact List */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
}

.contact-label {
  font-weight: 600;
  color: #666;
  min-width: 70px;
}

.contact-row a {
  color: #3498db;
  text-decoration: none;
  word-break: break-all;
}

.contact-row a:hover {
  text-decoration: underline;
}

/* Social Media */
.social-media {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.social-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.social-link.twitter {
  background: #1da1f2;
  color: white;
}

.social-link.facebook {
  background: #1877f2;
  color: white;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  color: white;
}

.social-link:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* External Data Links */
.external-data {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.external-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.external-links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.external-link-item {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
}

.external-link-item:hover {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

/* Contacts List */
.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
}

.contact-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.contact-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.contact-email a {
  color: #3498db;
  font-size: 13px;
  text-decoration: none;
}

.contact-email a:hover {
  text-decoration: underline;
}

.contact-phone {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
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
  gap: 12px;
  align-items: center;
}

.metric-label {
  font-size: 13px;
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
  min-width: 45px;
  text-align: right;
}

/* Section Controls */
.section-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.loading-children {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Table Container */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.species-name {
  font-style: italic;
  font-weight: 500;
  color: #2c3e50;
}

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
  font-size: 11px;
  font-weight: 600;
  color: #333;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin-top: 15px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
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

.pagination-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-current {
  font-size: 14px;
  color: #666;
}

/* Full width map container */
.full-width-map-container {
  width: 100%;
  margin: 20px 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
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

.skeleton-block {
  background: linear-gradient(90deg, #eee 25%, #e4e4e4 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
  width: 100%;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .overview-main-content {
    grid-template-columns: 1fr;
  }

  .darwin-core-fields {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .header-hero-bg {
    width: 100%;
    height: 120px;
    position: relative;
  }

  .header-hero-bg img {
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
  }

  .has-hero .header-content {
    min-height: auto;
  }

  .institution-title {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .institution-name {
    font-size: 24px;
  }

  .nav-menu ul {
    flex-wrap: wrap;
  }

  .nav-menu a {
    padding: 12px 10px;
    font-size: 13px;
  }

  .section {
    padding: 20px;
  }

  .section-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .overview-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quality-metric {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .records-bar-container {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .overview-stats-grid {
    grid-template-columns: 1fr;
  }

  .darwin-core-fields {
    grid-template-columns: 1fr;
  }
}
</style>
