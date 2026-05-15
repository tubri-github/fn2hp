<template>
  <div class="country-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading country information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button @click="load" class="retry-button">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else-if="country" class="container">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> &gt;
        <router-link to="/browse/countries">Browse</router-link> &gt;
        <router-link to="/browse/countries">Countries</router-link> &gt;
        <strong>{{ country.countryCode }}</strong>
      </div>

      <!-- Country Header -->
      <div class="country-header">
        <div class="header-content">
          <div class="country-title">
            <div class="country-flag">{{ country.countryCode }}</div>
            <div class="country-title-text">
              <h1 class="country-name">{{ displayName }}</h1>
              <div v-if="country.firstYear || country.latestYear" class="country-meta">
                Records from
                <strong>{{ country.firstYear || '—' }}</strong>
                to
                <strong>{{ country.latestYear || '—' }}</strong>
              </div>
            </div>
          </div>

          <div class="darwin-core-fields">
            <div class="dc-field-group">
              <div class="dc-label">countryCode</div>
              <div class="dc-value">{{ country.countryCode }}</div>
            </div>
            <div v-if="country.countryName" class="dc-field-group">
              <div class="dc-label">country</div>
              <div class="dc-value">{{ country.countryName }}</div>
            </div>
            <div class="dc-field-group">
              <div class="dc-label">institutions</div>
              <div class="dc-value">{{ formatNumber(country.institutionsCount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <nav class="nav-menu">
        <ul>
          <li><a :class="{ active: activeTab === 'overview' }" @click.prevent="activeTab = 'overview'">Overview</a></li>
          <li><a :class="{ active: activeTab === 'distribution' }" @click.prevent="activeTab = 'distribution'">Geographic Distribution</a></li>
          <li v-if="country.states?.length >= 2"><a :class="{ active: activeTab === 'states' }" @click.prevent="activeTab = 'states'">States &amp; Provinces</a></li>
        </ul>
      </nav>

      <!-- Overview Section -->
      <section v-if="activeTab === 'overview'" class="section">
        <h2 class="section-title">{{ displayName }} Overview</h2>

        <!-- Stat Cards -->
        <div class="overview-stats-grid">
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(country.recordCount) }}</div>
              <div class="stat-label">Total Records</div>
              <div class="stat-context">Specimens documented from this country</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(country.speciesCount) }}</div>
              <div class="stat-label">Species</div>
              <div class="stat-context">Distinct fish species recorded</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(country.familiesCount) }}</div>
              <div class="stat-label">Families</div>
              <div class="stat-context">Across {{ formatNumber(country.generaCount) }} genera</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(country.institutionsCount) }}</div>
              <div class="stat-label">Institutions</div>
              <div class="stat-context">Contributing collections</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ country.georeferencingQuality }}%</div>
              <div class="stat-label">Georeferenced</div>
              <div class="stat-context">Records with coordinates</div>
            </div>
          </div>
          <div class="overview-stat-card" v-if="country.statesCount > 0">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(country.statesCount) }}</div>
              <div class="stat-label">States / Provinces</div>
              <div class="stat-context">Subnational divisions present</div>
            </div>
          </div>
        </div>

        <!-- Top Families -->
        <div v-if="country.topFamilies?.length" class="overview-block">
          <h3 class="block-title">Top Families</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Family</th>
                  <th>Records</th>
                  <th>Species</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(f, i) in country.topFamilies" :key="f.family" class="table-row">
                  <td class="rank">{{ i + 1 }}</td>
                  <td>
                    <router-link
                      :to="{ name: 'FamilyDetail', params: { familyName: f.family } }"
                      class="link"
                    >{{ f.family }}</router-link>
                  </td>
                  <td>{{ formatNumber(f.recordCount) }}</td>
                  <td>{{ formatNumber(f.speciesCount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Institutions -->
        <div v-if="country.topInstitutions?.length" class="overview-block">
          <h3 class="block-title">Top Contributing Institutions</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Institution</th>
                  <th>Records</th>
                  <th>Species</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(inst, i) in country.topInstitutions" :key="inst.institutionCode" class="table-row">
                  <td class="rank">{{ i + 1 }}</td>
                  <td>
                    <router-link
                      :to="{ name: 'ProviderDetail', params: { institutionCode: inst.institutionCode } }"
                      class="link"
                    >
                      <span class="code-badge">{{ inst.institutionCode }}</span>
                    </router-link>
                  </td>
                  <td>{{ formatNumber(inst.recordCount) }}</td>
                  <td>{{ formatNumber(inst.speciesCount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Geographic Distribution Section -->
      <section v-if="activeTab === 'distribution'" class="section">
        <h2 class="section-title">Geographic Distribution</h2>
        <p class="section-note">
          Heatmap of records with valid coordinates. Zoom in for a finer grid.
          A few specks may appear outside this country — those are upstream
          data-quality issues (records labeled with this country code but
          coordinates that fall elsewhere).
        </p>

        <div class="full-width-map-container">
          <div v-if="loadingMap && !mapPoints.length" class="skeleton-block" style="height: 480px"></div>
          <CompactHeatMap
            v-else
            :data="mapPoints"
            :height="480"
            mode="heatmap"
            @bounds-changed="onMapBoundsChanged"
          />
        </div>
      </section>

      <!-- States Section -->
      <section v-if="activeTab === 'states' && country.states?.length >= 2" class="section">
        <h2 class="section-title">States &amp; Provinces</h2>
        <p class="section-note">
          State / province strings are not normalized — variants like
          "CA", "California" and "Calif." may appear as separate rows.
        </p>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>State / Province</th>
                <th>Records</th>
                <th>Species</th>
                <th>Institutions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in country.states" :key="s.stateProvince" class="table-row">
                <td>{{ s.stateProvince }}</td>
                <td>{{ formatNumber(s.recordCount) }}</td>
                <td>{{ formatNumber(s.speciesCount) }}</td>
                <td>{{ formatNumber(s.institutionsCount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import CompactHeatMap from '@/components/charts/CompactHeatMap.vue'
import { countriesApi } from '@/api/countries.js'

const props = defineProps({
  countryCode: { type: String, required: true },
})

const country = ref(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref('overview')

const mapPoints = ref([])
const loadingMap = ref(false)
let mapAbort = null

const displayName = computed(() => {
  if (!country.value) return ''
  const n = country.value.countryName
  if (n && n.trim().length > 2) return n
  return country.value.countryCode
})

const load = async () => {
  loading.value = true
  error.value = ''
  country.value = null
  try {
    country.value = await countriesApi.getCountryDetail(props.countryCode)
    // Kick off the map fetch in parallel with the overview tab render so
    // switching to the Distribution tab feels instant.
    loadMapPoints()
  } catch (e) {
    error.value = e?.response?.data?.detail || e?.message || 'Failed to load country'
  } finally {
    loading.value = false
  }
}

const loadMapPoints = async (params = {}) => {
  if (mapAbort) mapAbort.abort()
  mapAbort = new AbortController()
  loadingMap.value = true
  try {
    const r = await countriesApi.getCountryMapPoints(
      props.countryCode,
      params,
      { signal: mapAbort.signal }
    )
    mapPoints.value = r.points || []
  } catch (e) {
    if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return
    console.error('Failed to load country map points:', e)
    mapPoints.value = []
  } finally {
    loadingMap.value = false
  }
}

const onMapBoundsChanged = debounce(({ bounds, zoom }) => {
  loadMapPoints({
    south: bounds.south.toFixed(4),
    north: bounds.north.toFixed(4),
    west: bounds.west.toFixed(4),
    east: bounds.east.toFixed(4),
    zoom: zoom || 2,
  })
}, 500)

const formatNumber = (n) => (n ?? 0).toLocaleString('en-US')

onMounted(load)
watch(() => props.countryCode, () => {
  activeTab.value = 'overview'
  mapPoints.value = []
  load()
})
</script>

<style scoped>
/* Match InstitutionPage: full-width grey page background, inner container 1400px. */
.country-page {
  font-family: 'Inter', sans-serif;
  color: #2c3e50;
  background: #f5f5f5;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Loading / error */
.loading-state,
.error-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top-color: #2c7cb9;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state .retry-button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #2c7cb9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Breadcrumb */
.breadcrumb {
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.breadcrumb a {
  color: #2c7cb9;
  text-decoration: none;
}

.breadcrumb a:hover { text-decoration: underline; }

.breadcrumb strong {
  color: #444;
  font-weight: 600;
}

/* Country header */
.country-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e7f1fb 100%);
  border: 1px solid #e3eaf3;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.country-title {
  display: flex;
  align-items: center;
  gap: 18px;
}

.country-flag {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #2c7cb9;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c7cb9;
  letter-spacing: 1px;
}

.country-title-text { flex: 1; }

.country-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.7rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.country-meta {
  font-size: 0.85rem;
  color: #666;
}

.country-meta strong { color: #2c7cb9; }

.darwin-core-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px dashed #cad6e4;
}

.dc-field-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dc-label {
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 11px;
  color: #6b7c93;
  text-transform: lowercase;
  letter-spacing: 0.3px;
}

.dc-value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

/* Tab navigation */
.nav-menu {
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 24px;
}

.nav-menu ul {
  display: flex;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li a {
  display: block;
  padding: 12px 18px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}

.nav-menu li a:hover { color: #2c7cb9; }

.nav-menu li a.active {
  color: #2c7cb9;
  border-bottom-color: #2c7cb9;
}

/* Section */
.section { margin-bottom: 32px; }

.section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.section-note {
  font-size: 12px;
  color: #888;
  font-style: italic;
  margin: 0 0 16px 0;
}

/* Overview cards */
.overview-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.overview-stat-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 18px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.overview-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-content { text-align: left; }

.stat-number {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c7cb9;
  line-height: 1.1;
}

.stat-label {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.stat-context {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #999;
}

/* Tables */
.overview-block { margin-bottom: 24px; }

.block-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.table-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead { background: #f8f9fa; }

.data-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.data-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f1f3f5;
}

.data-table .rank {
  color: #aaa;
  width: 30px;
}

.table-row { transition: background 0.12s; }
.table-row:hover { background: #fafbfc; }

.link { color: #2c7cb9; text-decoration: none; }
.link:hover { text-decoration: underline; }

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

/* Map */
.full-width-map-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.skeleton-block {
  background: linear-gradient(90deg, #f3f5f8, #e9ecef, #f3f5f8);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>