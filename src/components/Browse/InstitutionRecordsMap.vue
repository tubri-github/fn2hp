<template>
  <div class="institution-records-map">

    <div class="map-controls">
      <div class="controls-row">
        <div class="map-style-selector">
          <label>Map Style:</label>
          <select v-model="selectedMapStyle" @change="changeMapStyle" class="style-select">
            <option value="cartodb-dark">CartoDB Dark</option>
            <option value="cartodb-positron">CartoDB Light</option>
            <option value="pure-black">Pure Black</option>
          </select>
        </div>

        <div class="data-filters">
          <button
              v-for="filter in filterOptions"
              :key="filter.key"
              :class="['filter-btn', { active: currentFilter === filter.key }]"
              @click="setFilter(filter.key)"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="clustering-toggle">
          <label>
            <input type="checkbox" v-model="enableClustering" @change="updateMarkers">
            Enable Clustering
          </label>
        </div>
      </div>
    </div>

    <div class="map-container">
      <div
          ref="mapElement"
          id="records-map"
          class="leaflet-map"
          :class="{ 'pure-black': selectedMapStyle === 'pure-black' }"
      ></div>

      <div v-if="loading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>Loading records...</p>
      </div>

      <div v-if="mapError" class="map-error">
        <p>⚠️ Map loading error: {{ mapError }}</p>
        <button @click="retryMapInit" class="retry-btn">Retry</button>
      </div>
    </div>

    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-dot recent"></div>
        <span>Recent Records (2020+)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot decade"></div>
        <span>Decade Records (2010-2019)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot historical"></div>
        <span>Historical Records (before 2010)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot unknown"></div>
        <span>Unknown Date</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'

// 确保Leaflet图标路径正确
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Props
const props = defineProps({
  institutionCode: {
    type: String,
    required: true
  },
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['record-clicked'])

// Refs
const mapElement = ref(null)

// Reactive state
const map = ref(null)
const markersLayer = ref(null)
const clusterGroup = ref(null)
const currentFilter = ref('all')
const selectedMapStyle = ref('cartodb-dark')
const currentTileLayer = ref(null)
const mapError = ref('')
const enableClustering = ref(true)

// 稳定的地图瓦片配置
const mapStyles = {
  'cartodb-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  'cartodb-positron': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  'pure-black': {
    url: null,
    attribution: 'Records visualization',
    isPureBlack: true
  }
}

// Filter options
const filterOptions = [
  { key: 'all', label: 'All Records' },
  { key: 'recent', label: 'Recent (2020+)' },
  { key: 'decade', label: 'Last Decade' },
  { key: 'historical', label: 'Historical' },
  { key: 'georeferenced', label: 'Georeferenced Only' }
]

// Computed properties
const filteredRecords = computed(() => {
  const validRecords = props.records.filter(record =>
      record.decimalLatitude &&
      record.decimalLongitude &&
      !isNaN(parseFloat(record.decimalLatitude)) &&
      !isNaN(parseFloat(record.decimalLongitude))
  )

  if (currentFilter.value === 'all') return validRecords
  if (currentFilter.value === 'georeferenced') return validRecords

  return validRecords.filter(record => {
    const year = record.year || (record.eventDate ? new Date(record.eventDate).getFullYear() : null)

    switch (currentFilter.value) {
      case 'recent': return year && year >= 2020
      case 'decade': return year && year >= 2010 && year < 2020
      case 'historical': return year && year < 2010
      default: return true
    }
  })
})

const totalRecords = computed(() => props.records.length)

const georeferencedRecords = computed(() => {
  return props.records.filter(record =>
      record.decimalLatitude && record.decimalLongitude
  ).length
})

const georeferencingPercentage = computed(() => {
  if (totalRecords.value === 0) return 0
  return Math.round((georeferencedRecords.value / totalRecords.value) * 100)
})

const uniqueCountries = computed(() => {
  return new Set(props.records.map(r => r.country).filter(Boolean)).size
})

// Methods
const initMap = async () => {
  try {
    if (!mapElement.value) {
      throw new Error('Map element not found')
    }

    console.log('Initializing records map...')

    // Create map
    map.value = L.map(mapElement.value, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true
    })

    // Add tile layer
    await addTileLayer()

    // Create markers layer
    if (enableClustering.value) {
      // 如果需要聚类，需要导入MarkerCluster插件
      // 这里使用简化版本
      markersLayer.value = L.layerGroup().addTo(map.value)
    } else {
      markersLayer.value = L.layerGroup().addTo(map.value)
    }

    // Add markers
    await nextTick()
    updateMarkers()

    // Fit bounds
    if (filteredRecords.value.length > 0) {
      fitMapToBounds()
    }

    mapError.value = ''
    console.log('Records map initialization completed')

  } catch (error) {
    console.error('Records map initialization error:', error)
    mapError.value = error.message
  }
}

const addTileLayer = async () => {
  try {
    if (!map.value) return

    // Remove existing tile layer
    if (currentTileLayer.value) {
      map.value.removeLayer(currentTileLayer.value)
      currentTileLayer.value = null
    }

    const style = mapStyles[selectedMapStyle.value]

    if (style.isPureBlack) {
      return
    }

    // Create tile layer
    currentTileLayer.value = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains,
      maxZoom: style.maxZoom,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    })

    currentTileLayer.value.addTo(map.value)

  } catch (error) {
    console.error('Tile layer error:', error)
    mapError.value = 'Failed to load map tiles: ' + error.message
  }
}

const updateMarkers = () => {
  try {
    if (!markersLayer.value) {
      console.warn('Markers layer not available')
      return
    }

    console.log('Updating record markers, count:', filteredRecords.value.length)

    // Clear existing markers
    markersLayer.value.clearLayers()

    filteredRecords.value.forEach((record, index) => {
      const lat = parseFloat(record.decimalLatitude)
      const lng = parseFloat(record.decimalLongitude)

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return
      }

      // Create custom icon based on record age
      const recordAge = getRecordAge(record)
      const icon = L.divIcon({
        className: `record-dot ${recordAge}`,
        iconSize: [6, 6],
        iconAnchor: [3, 3],
        html: `<div class="dot-inner"></div>`
      })

      // Create marker
      const marker = L.marker([lat, lng], { icon })

      // Create popup content
      const popupContent = createRecordPopupContent(record)
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Add click event
      marker.on('click', () => {
        emit('record-clicked', record)
      })

      markersLayer.value.addLayer(marker)
    })

    console.log('Record markers update completed')

  } catch (error) {
    console.error('Record markers update error:', error)
    mapError.value = 'Failed to update markers: ' + error.message
  }
}

const createRecordPopupContent = (record) => {
  const year = record.year || (record.eventDate ? new Date(record.eventDate).getFullYear() : 'Unknown')

  return `
    <div class="popup-content">
      <div class="popup-title">${record.scientificName || 'Unknown Species'}</div>
      <div class="popup-info">
        <strong>Catalog #:</strong> ${record.catalogNumber || 'N/A'}<br>
        <strong>Family:</strong> ${record.family || 'N/A'}<br>
        <strong>Collected by:</strong> ${record.recordedBy || 'N/A'}<br>
        <strong>Date:</strong> ${record.eventDate || 'N/A'} (${year})<br>
        <strong>Location:</strong> ${record.locality || 'N/A'}<br>
        <strong>Country:</strong> ${record.country || 'N/A'}<br>
        <strong>Coordinates:</strong> ${record.decimalLatitude}, ${record.decimalLongitude}
      </div>
    </div>
  `
}

const getRecordAge = (record) => {
  const year = record.year || (record.eventDate ? new Date(record.eventDate).getFullYear() : null)

  if (!year) return 'unknown'
  if (year >= 2020) return 'recent'
  if (year >= 2010) return 'decade'
  return 'historical'
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const setFilter = (filterKey) => {
  currentFilter.value = filterKey
  updateMarkers()
  if (filteredRecords.value.length > 0) {
    fitMapToBounds()
  }
}

const changeMapStyle = () => {
  addTileLayer()
}

const fitMapToBounds = () => {
  try {
    if (!map.value || !markersLayer.value) return

    const group = new L.featureGroup(markersLayer.value.getLayers())
    if (group.getLayers().length > 0) {
      map.value.fitBounds(group.getBounds(), { padding: [20, 20], maxZoom: 10 })
    }
  } catch (error) {
    console.error('Fit bounds error:', error)
  }
}

const retryMapInit = () => {
  mapError.value = ''
  if (map.value) {
    map.value.remove()
    map.value = null
  }
  setTimeout(initMap, 500)
}

// Lifecycle
onMounted(() => {
  console.log('Records map component mounted')
  setTimeout(initMap, 100)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Watchers
watch(() => props.records, () => {
  console.log('Records data changed, count:', props.records.length)
  if (map.value) {
    updateMarkers()
    if (filteredRecords.value.length > 0) {
      fitMapToBounds()
    }
  }
}, { deep: true })

watch(currentFilter, () => {
  updateMarkers()
})
</script>

<style scoped>
/* 导入Leaflet CSS */
@import 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';

.institution-records-map {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.map-header {
  text-align: center;
  margin-bottom: 25px;
}

.map-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.map-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.map-stats {
  display: flex;
  justify-content: center;
  gap: 25px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.map-controls {
  margin-bottom: 20px;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.map-style-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-style-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.style-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.data-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.clustering-toggle {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #555;
}

.clustering-toggle input {
  margin-right: 6px;
}

.map-container {
  position: relative;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.leaflet-map {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.leaflet-map.pure-black {
  background: #000000 !important;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: white;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(52, 152, 219, 0.3);
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid white;
}

.legend-dot.recent {
  background: #e74c3c;
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.6);
}

.legend-dot.decade {
  background: #f39c12;
  box-shadow: 0 0 4px rgba(243, 156, 18, 0.6);
}

.legend-dot.historical {
  background: #2ecc71;
  box-shadow: 0 0 4px rgba(46, 204, 113, 0.6);
}

.legend-dot.unknown {
  background: #95a5a6;
  box-shadow: 0 0 4px rgba(149, 165, 166, 0.6);
}

/* 自定义record marker样式 */
:deep(.record-dot) {
  border-radius: 50%;
  border: 1px solid white;
  transition: all 0.3s ease;
  width: 6px;
  height: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.record-dot.recent) {
  background: #e74c3c;
  box-shadow: 0 0 6px rgba(231, 76, 60, 0.6);
}

:deep(.record-dot.decade) {
  background: #f39c12;
  box-shadow: 0 0 6px rgba(243, 156, 18, 0.6);
}

:deep(.record-dot.historical) {
  background: #2ecc71;
  box-shadow: 0 0 6px rgba(46, 204, 113, 0.6);
}

:deep(.record-dot.unknown) {
  background: #95a5a6;
  box-shadow: 0 0 6px rgba(149, 165, 166, 0.6);
}

:deep(.record-dot:hover) {
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
}

.dot-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
}

/* 纯黑模式下的点样式 */
.pure-black :deep(.record-dot) {
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
}

/* 自定义弹窗样式 */
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(30, 30, 30, 0.95);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px;
  font-size: 13px;
  line-height: 1.4;
}

:deep(.popup-title) {
  font-weight: 600;
  color: white;
  font-size: 14px;
  margin-bottom: 6px;
  font-style: italic;
}

:deep(.popup-info) {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

:deep(.popup-info strong) {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .institution-records-map {
    padding: 20px;
  }

  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }

  .data-filters {
    justify-content: center;
  }

  .map-container {
    height: 400px;
  }

  .map-stats {
    gap: 15px;
  }
}
</style>