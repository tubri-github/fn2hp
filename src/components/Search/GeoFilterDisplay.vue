<template>
  <div v-if="filter" class="geo-filter-display">
    <div class="display-header">
      <span class="display-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </span>
      <span class="display-title">Geographic Filter</span>
      <button class="clear-btn" @click="$emit('clear')" title="Clear">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="display-content">
      <!-- Mini Map -->
      <div class="mini-map-wrapper">
        <div ref="miniMapContainer" class="mini-map"></div>
      </div>

      <!-- Filter Info -->
      <div class="filter-info">
        <span class="filter-type">{{ getTypeLabel(filter.type) }}</span>
        <span class="filter-separator">·</span>
        <span class="filter-detail">{{ getFilterDetail() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  filter: {
    type: Object,
    default: null
  }
})

defineEmits(['clear'])

const miniMapContainer = ref(null)
let miniMap = null
let shapeLayer = null

const getTypeLabel = (type) => {
  const labels = {
    polygon: 'Polygon',
    rectangle: 'Rectangle',
    circle: 'Circle'
  }
  return labels[type] || type
}

const getFilterDetail = () => {
  if (!props.filter) return ''

  const { type, coordinates, radius } = props.filter

  if (type === 'circle' && radius) {
    const radiusKm = (radius / 1000).toFixed(1)
    return `Radius: ${radiusKm} km`
  } else if (coordinates) {
    const vertexCount = coordinates.length - 1
    return `${vertexCount} vertices`
  }
  return ''
}

const initMiniMap = () => {
  if (!miniMapContainer.value || miniMap) return

  miniMap = L.map(miniMapContainer.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false
  }).setView([20, 0], 1)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(miniMap)

  shapeLayer = L.featureGroup().addTo(miniMap)

  updateShape()
}

const updateShape = () => {
  if (!miniMap || !shapeLayer || !props.filter) return

  shapeLayer.clearLayers()

  const { type, coordinates, radius } = props.filter

  let layer = null

  if (type === 'circle' && coordinates && coordinates.length > 0) {
    const center = coordinates[0]
    layer = L.circle([center[1], center[0]], {
      radius: radius || 1000,
      color: '#9b59b6',
      fillColor: '#9b59b6',
      fillOpacity: 0.3,
      weight: 2
    })
  } else if ((type === 'polygon' || type === 'rectangle') && coordinates) {
    const latLngs = coordinates.slice(0, -1).map(coord => [coord[1], coord[0]])
    layer = L.polygon(latLngs, {
      color: type === 'rectangle' ? '#27ae60' : '#3498db',
      fillColor: type === 'rectangle' ? '#27ae60' : '#3498db',
      fillOpacity: 0.3,
      weight: 2
    })
  }

  if (layer) {
    shapeLayer.addLayer(layer)

    // Fit bounds with padding
    nextTick(() => {
      try {
        miniMap.fitBounds(layer.getBounds(), {
          padding: [10, 10],
          maxZoom: 10
        })
      } catch (e) {
        console.warn('Could not fit bounds:', e)
      }
    })
  }
}

watch(() => props.filter, (newFilter) => {
  if (newFilter && miniMap) {
    updateShape()
  } else if (!newFilter && shapeLayer) {
    shapeLayer.clearLayers()
  }
}, { deep: true })

onMounted(() => {
  if (props.filter) {
    nextTick(() => {
      setTimeout(initMiniMap, 100)
    })
  }
})

watch(() => props.filter, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // Filter was just set, initialize map
    nextTick(() => {
      setTimeout(initMiniMap, 100)
    })
  }
})

onUnmounted(() => {
  if (miniMap) {
    miniMap.remove()
    miniMap = null
  }
})
</script>

<style scoped>
.geo-filter-display {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.display-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.display-icon {
  display: flex;
  align-items: center;
  color: #888;
}

.display-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.clear-btn {
  width: 22px;
  height: 22px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  background: #fee;
  border-color: #e74c3c;
  color: #e74c3c;
}

.display-content {
  padding: 10px;
}

.mini-map-wrapper {
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.mini-map {
  height: 100px;
  width: 100%;
  background: #f0f0f0;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.filter-type {
  font-weight: 500;
  color: #555;
}

.filter-separator {
  color: #ccc;
}

.filter-detail {
  color: #888;
}
</style>
