<template>
  <div class="world-map-section">

    <div class="map-controls">
      <div class="controls-row">
        <div class="map-style-selector">
          <label>Map Style:</label>
          <select v-model="selectedMapStyle" @change="changeMapStyle" class="style-select">
            <option value="cartodb-positron">CartoDB Light</option>
            <option value="cartodb-dark">CartoDB Dark</option>
            <option value="pure-black">Pure Black</option>
          </select>
        </div>

      </div>
    </div>

<!--    &lt;!&ndash; 调试信息 &ndash;&gt;-->
<!--    <div class="debug-info" v-if="showDebug">-->
<!--      <p>Total institutions: {{ props.institutions.length }}</p>-->
<!--      <p>Total mapData: {{ props.mapData.length }}</p>-->
<!--      <p>Filtered providers: {{ filteredProviders.length }}</p>-->
<!--      <p>Map initialized: {{ !!map }}</p>-->
<!--      <p>Markers layer: {{ !!markersLayer }}</p>-->
<!--    </div>-->

    <div class="map-container">
      <div
          ref="mapElement"
          id="providers-map"
          class="leaflet-map"
          :class="{ 'pure-black': selectedMapStyle === 'pure-black' }"
      ></div>

      <div v-if="loading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>Loading providers...</p>
      </div>

      <!-- 调试信息 -->
      <div v-if="showDebug && !loading && !mapError" class="map-debug">
        <p>Institutions: {{ props.institutions.length }} | MapData: {{ props.mapData.length }}</p>
        <p>Filtered: {{ filteredProviders.length }} | Map: {{ !!map }}</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="mapError" class="map-error">
        <p>Map loading error: {{ mapError }}</p>
        <button @click="retryMapInit" class="retry-btn">Retry</button>
      </div>
    </div>

    <div class="map-legend">
      <div class="legend-title">Records by Provider</div>
      <div class="legend-density">
        <div class="legend-item">
          <div class="legend-dot size-xl" style="background: #d32f2f;"></div>
          <span>50,000+</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot size-lg" style="background: #f57c00;"></div>
          <span>10,000+</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot size-md" style="background: #2196f3;"></div>
          <span>1,000+</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot size-sm" style="background: #4caf50;"></div>
          <span>&lt;1,000</span>
        </div>
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
  institutions: {
    type: Array,
    default: () => []
  },
  // 新增：已转换的地图数据
  mapData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['provider-clicked'])

// Refs
const mapElement = ref(null)

// Reactive state
const map = ref(null)
const markersLayer = ref(null)
const currentFilter = ref('all')
const selectedMapStyle = ref('cartodb-positron')
const currentTileLayer = ref(null)
const mapError = ref('')
const showDebug = ref(false)


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
    attribution: 'Data providers visualization',
    isPureBlack: true
  }
}


// Computed properties
const filteredProviders = computed(() => {
  // Prefer mapData, fallback to institutions
  return props.mapData.length > 0 ? props.mapData : props.institutions
})

const uniqueCountries = computed(() => {
  return new Set(filteredProviders.value.map(p => p.country).filter(Boolean)).size
})

const totalRecords = computed(() => {
  return filteredProviders.value.reduce((sum, p) => sum + (p.recordCount || p.records || 0), 0)
})

// Methods
const initMap = async () => {
  try {
    if (!mapElement.value) {
      throw new Error('Map element not found')
    }

    console.log('Initializing map...') // 调试日志

    // Create map
    map.value = L.map(mapElement.value, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true
    })

    console.log('Map created:', map.value) // 调试日志

    // Add tile layer
    await addTileLayer()

    // Create markers layer
    markersLayer.value = L.layerGroup().addTo(map.value)
    console.log('Markers layer created:', markersLayer.value) // 调试日志

    // Add markers
    await nextTick()
    updateMarkers()

    // Fit bounds
    if (filteredProviders.value.length > 0) {
      fitMapToBounds()
    }

    mapError.value = ''
    console.log('Map initialization completed') // 调试日志

  } catch (error) {
    console.error('Map initialization error:', error)
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
      // 纯黑背景模式
      return
    }

    console.log('Adding tile layer:', style.url) // 调试日志

    // Create tile layer
    currentTileLayer.value = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains,
      maxZoom: style.maxZoom,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 错误瓦片显示透明
    })

    // 监听瓦片加载事件
    currentTileLayer.value.on('tileerror', (e) => {
      console.warn('Tile loading error:', e)
    })

    currentTileLayer.value.on('tileload', (e) => {
      console.log('Tile loaded successfully') // 调试日志
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

    console.log('Updating provider markers, count:', filteredProviders.value.length)

    // Clear existing markers
    markersLayer.value.clearLayers()

    filteredProviders.value.forEach((provider, index) => {
      const lat = provider.lat || provider.latitude
      const lng = provider.lng || provider.longitude
      const recordCount = provider.recordCount || provider.records || 0

      // Validate coordinates
      if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return
      }

      // Get marker size and color based on record count
      const markerSize = getMarkerSize(recordCount)
      const markerColor = getMarkerColor(recordCount)

      // Create clean circular marker
      const icon = L.divIcon({
        className: 'provider-marker',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
        html: `<div class="provider-dot" style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background-color: ${markerColor};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`
      })

      // Create marker
      const marker = L.marker([parseFloat(lat), parseFloat(lng)], { icon })

      // Add tooltip
      const tooltipContent = `
        <strong>${provider.institutionCode || 'Unknown'}</strong><br>
        ${provider.institutionName || ''}<br>
        ${provider.country || ''}<br>
        ${formatNumber(recordCount)} records
      `
      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        className: 'provider-tooltip'
      })

      // Add click handler
      marker.on('click', () => {
        emit('provider-clicked', provider.institutionCode)
      })

      markersLayer.value.addLayer(marker)
    })

    console.log('Provider markers update completed')

  } catch (error) {
    console.error('Provider markers update error:', error)
    mapError.value = 'Failed to update markers: ' + error.message
  }
}

// Get marker size based on record count
const getMarkerSize = (recordCount) => {
  if (recordCount >= 50000) return 18
  if (recordCount >= 10000) return 14
  if (recordCount >= 1000) return 11
  return 8
}

// Get marker color based on record count
const getMarkerColor = (recordCount) => {
  if (recordCount >= 50000) return '#d32f2f'  // Red - very large
  if (recordCount >= 10000) return '#f57c00'  // Orange - large
  if (recordCount >= 1000) return '#2196f3'   // Blue - medium
  return '#4caf50'                             // Green - small
}

const createPopupContent = (provider) => {
  return `
    <div class="popup-content">
      <div class="popup-title">${provider.institutionName || provider.name || provider.institutionCode}</div>
      <div class="popup-info">
        <strong>Code:</strong> ${provider.institutionCode || 'N/A'}<br>
        <strong>Country:</strong> ${provider.country || 'N/A'}<br>
        <strong>Records:</strong> ${formatNumber(provider.recordCount || provider.records || 0)}<br>
        <strong>Category:</strong> ${getProviderCategory(provider.recordCount || provider.records || 0)}
      </div>
    </div>
  `
}


const formatNumber = (num, format = 'full') => {
  if (!num) return '0'

  if (format === 'short') {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  }

  return num.toLocaleString()
}

const getProviderCategory = (recordCount) => {
  if (recordCount >= 10000) return 'Major Provider'
  if (recordCount >= 5000) return 'Large Provider'
  if (recordCount >= 1000) return 'Medium Provider'
  if (recordCount >= 100) return 'Small Provider'
  return 'Minimal Provider'
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
  console.log('Component mounted, institutions:', props.institutions.length) // 调试日志
  console.log('Component mounted, mapData:', props.mapData.length) // 调试日志
  setTimeout(initMap, 300) // 增加延迟确保DOM和样式完全加载
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Watchers
watch(() => [props.institutions, props.mapData], () => {
  console.log('Data changed - institutions:', props.institutions.length, 'mapData:', props.mapData.length)
  if (map.value) {
    updateMarkers()
    if (filteredProviders.value.length > 0) {
      fitMapToBounds()
    }
  }
}, { deep: true })

</script>

<style scoped>
/* 导入Leaflet CSS - 使用更稳定的方式 */
@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

.world-map-section {
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


.debug-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
}

.map-container {
  position: relative;
  height: 400px;
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

.map-debug {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  max-width: 300px;
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
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}

.legend-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 12px;
  color: #333;
}

.legend-density {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.legend-dot.size-xl {
  width: 14px;
  height: 14px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.legend-dot.size-lg {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.legend-dot.size-md {
  width: 10px;
  height: 10px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.legend-dot.size-sm {
  width: 8px;
  height: 8px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Provider marker styles */
:deep(.provider-marker) {
  background: none !important;
  border: none !important;
}

:deep(.provider-marker:hover .provider-dot) {
  transform: scale(1.2);
}

.provider-dot {
  transition: transform 0.2s ease;
  cursor: pointer;
}

/* Provider tooltip styles */
:deep(.provider-tooltip) {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #333 !important;
  border: 1px solid #ddd !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 8px 12px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
}

:deep(.provider-tooltip strong) {
  color: #2c3e50;
  font-size: 13px;
}

.dot-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
}

/* 纯黑模式下的白色光点 */
.pure-black :deep(.light-dot) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8) !important;
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
  .world-map-section {
    padding: 20px;
  }

  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }

  .map-container {
    height: 300px;
  }
}
</style>