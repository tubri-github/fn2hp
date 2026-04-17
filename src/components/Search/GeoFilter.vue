<template>
  <div class="geo-filter-inline">
    <!-- Trigger Button -->
    <button class="geo-trigger-btn" :class="{ active: currentShape }" @click="openModal">
      <span class="geo-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </span>
      <span class="geo-label">Geographic Filter</span>
      <span v-if="currentShape" class="shape-badge">{{ getShapeLabel(currentShape.type) }}</span>
    </button>

    <!-- Clear button when filter is active -->
    <button v-if="currentShape" class="geo-clear-btn" @click.stop="clearShape" title="Clear">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="geo-modal-overlay" @click.self="closeModal">
      <div class="geo-modal">
        <div class="geo-modal-header">
          <h3>Geographic Filter</h3>
          <button class="modal-close-btn" @click="closeModal">×</button>
        </div>

        <div class="geo-modal-body">
          <div class="map-wrapper">
            <div ref="mapContainer" class="filter-map"></div>
            <div v-if="loading" class="map-loading">
              <div class="loading-spinner"></div>
            </div>
          </div>

          <div class="filter-controls">
            <div class="draw-instructions">
              <span v-if="!currentShape">
                Use the drawing tools (top-right) to select an area on the map
              </span>
              <span v-else>
                {{ getShapeDescription() }}
              </span>
            </div>
          </div>
        </div>

        <div class="geo-modal-footer">
          <button class="btn-secondary" @click="clearShape" :disabled="!currentShape">
            Clear
          </button>
          <button class="btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button class="btn-primary" @click="applyAndClose" :disabled="!currentShape">
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Props
const props = defineProps({
  initialFilter: {
    type: Object,
    default: null
  },
  mapCenter: {
    type: Array,
    default: () => [20, 0]
  },
  mapZoom: {
    type: Number,
    default: 2
  },
  defaultCollapsed: {
    type: Boolean,
    default: true
  }
})

// Modal state
const showModal = ref(false)
const mapInitialized = ref(false)

const openModal = () => {
  showModal.value = true

  // Always reinitialize map when modal opens to avoid stale state
  nextTick(() => {
    setTimeout(() => {
      // Destroy existing map if any
      if (map.value) {
        try {
          map.value.off()
          map.value.remove()
        } catch (e) {
          console.warn('Error removing old map:', e)
        }
        map.value = null
        drawnItems.value = null
        drawControl.value = null
        mapInitialized.value = false
      }

      // Check if container exists
      if (!mapContainer.value) {
        console.error('GeoFilter: Map container not found!')
        return
      }

      // Initialize fresh map
      console.log('GeoFilter: Initializing map, container:', mapContainer.value)
      initMap()
    }, 250)
  })
}

const closeModal = () => {
  showModal.value = false
}

const applyAndClose = () => {
  applyFilter()
  closeModal()
}

// Emits
const emit = defineEmits(['filter-change', 'filter-apply', 'filter-clear'])

// Refs
const mapContainer = ref(null)
const map = ref(null)
const drawnItems = ref(null)
const drawControl = ref(null)
const currentShape = ref(null)
const loading = ref(true)

// Map tile configuration
const mapStyles = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }
}

// Methods
const initMap = async () => {
  try {
    if (!mapContainer.value) {
      console.error('Map container not found')
      return
    }

    // Log container info for debugging
    const rect = mapContainer.value.getBoundingClientRect()
    console.log('GeoFilter: Container size:', rect.width, 'x', rect.height)

    // If container has no size, wait and retry
    if (rect.width === 0 || rect.height === 0) {
      console.warn('GeoFilter: Container has no size, retrying...')
      setTimeout(() => initMap(), 100)
      return
    }

    // Create map
    map.value = L.map(mapContainer.value, {
      center: props.mapCenter,
      zoom: props.mapZoom,
      zoomControl: true,
      preferCanvas: false,
      tap: false
    })

    // Add tile layer
    const style = mapStyles.light
    L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: style.subdomains,
      maxZoom: style.maxZoom
    }).addTo(map.value)

    // Create drawn items layer
    drawnItems.value = new L.FeatureGroup()
    map.value.addLayer(drawnItems.value)

    // Configure draw control
    drawControl.value = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e74c3c',
            message: 'Polygon edges cannot intersect'
          },
          shapeOptions: {
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#27ae60',
            fillColor: '#27ae60',
            fillOpacity: 0.2,
            weight: 2
          },
          showArea: false
        },
        circle: {
          shapeOptions: {
            color: '#9b59b6',
            fillColor: '#9b59b6',
            fillOpacity: 0.2,
            weight: 2
          }
        }
      },
      edit: false  // Disable edit toolbar, use our own Clear button instead
    })

    map.value.addControl(drawControl.value)

    // Disable map drag/tap during rectangle/circle drawing so they don't conflict
    map.value.on('draw:drawstart', () => {
      map.value.dragging.disable()
    })
    map.value.on('draw:drawstop', () => {
      map.value.dragging.enable()
    })

    // Event handlers
    map.value.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.value.on(L.Draw.Event.EDITED, handleDrawEdited)
    map.value.on(L.Draw.Event.DELETED, handleDrawDeleted)

    // Load initial filter or current shape if exists
    if (currentShape.value) {
      loadInitialFilter(currentShape.value)
    } else if (props.initialFilter) {
      loadInitialFilter(props.initialFilter)
    }

    loading.value = false
    mapInitialized.value = true
    console.log('GeoFilter map initialized')

    // Force size invalidation after everything is loaded
    setTimeout(() => {
      map.value?.invalidateSize()
    }, 100)

  } catch (error) {
    console.error('GeoFilter map initialization error:', error)
    loading.value = false
  }
}

const handleDrawCreated = (e) => {
  // Clear existing shapes - only allow one shape at a time
  drawnItems.value.clearLayers()

  const layer = e.layer
  const layerType = e.layerType

  drawnItems.value.addLayer(layer)

  // Extract coordinates based on shape type
  let shapeData = null

  if (layerType === 'polygon' || layerType === 'rectangle') {
    const latLngs = layer.getLatLngs()[0]
    const coordinates = latLngs.map(ll => [ll.lng, ll.lat])
    // Close the polygon (first point = last point)
    if (coordinates.length > 0) {
      coordinates.push([...coordinates[0]])
    }

    shapeData = {
      type: layerType === 'rectangle' ? 'rectangle' : 'polygon',
      coordinates: coordinates,
      radius: null
    }
  } else if (layerType === 'circle') {
    const center = layer.getLatLng()
    const radius = layer.getRadius() // in meters

    shapeData = {
      type: 'circle',
      coordinates: [[center.lng, center.lat]], // center point
      radius: radius
    }
  }

  currentShape.value = shapeData
  emit('filter-change', shapeData)

  console.log('Shape created:', shapeData)
}

const handleDrawEdited = (e) => {
  const layers = e.layers
  layers.eachLayer((layer) => {
    let shapeData = null

    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0]
      const coordinates = latLngs.map(ll => [ll.lng, ll.lat])
      if (coordinates.length > 0) {
        coordinates.push([...coordinates[0]])
      }

      // Check if it's a rectangle (4 corners)
      const isRectangle = latLngs.length === 4 && isRectangularShape(latLngs)

      shapeData = {
        type: isRectangle ? 'rectangle' : 'polygon',
        coordinates: coordinates,
        radius: null
      }
    } else if (layer instanceof L.Circle) {
      const center = layer.getLatLng()
      const radius = layer.getRadius()

      shapeData = {
        type: 'circle',
        coordinates: [[center.lng, center.lat]],
        radius: radius
      }
    }

    if (shapeData) {
      currentShape.value = shapeData
      emit('filter-change', shapeData)
    }
  })
}

const handleDrawDeleted = () => {
  if (drawnItems.value.getLayers().length === 0) {
    currentShape.value = null
    emit('filter-change', null)
  }
}

const isRectangularShape = (latLngs) => {
  if (latLngs.length !== 4) return false

  // Simple check: if angles are approximately 90 degrees
  // This is a simplified check for rectangle detection
  const lats = latLngs.map(ll => ll.lat)
  const lngs = latLngs.map(ll => ll.lng)

  const uniqueLats = [...new Set(lats.map(l => l.toFixed(5)))]
  const uniqueLngs = [...new Set(lngs.map(l => l.toFixed(5)))]

  return uniqueLats.length === 2 && uniqueLngs.length === 2
}

const loadInitialFilter = (filter) => {
  if (!filter || !filter.coordinates) return

  try {
    let layer = null

    if (filter.type === 'circle' && filter.radius) {
      const center = filter.coordinates[0]
      layer = L.circle([center[1], center[0]], {
        radius: filter.radius,
        color: '#9b59b6',
        fillColor: '#9b59b6',
        fillOpacity: 0.2,
        weight: 2
      })
    } else if (filter.type === 'rectangle' || filter.type === 'polygon') {
      const latLngs = filter.coordinates.slice(0, -1).map(coord => [coord[1], coord[0]])

      if (filter.type === 'rectangle') {
        layer = L.rectangle(latLngs, {
          color: '#27ae60',
          fillColor: '#27ae60',
          fillOpacity: 0.2,
          weight: 2
        })
      } else {
        layer = L.polygon(latLngs, {
          color: '#3498db',
          fillColor: '#3498db',
          fillOpacity: 0.2,
          weight: 2
        })
      }
    }

    if (layer) {
      drawnItems.value.addLayer(layer)
      currentShape.value = filter

      // Fit map to bounds
      map.value.fitBounds(layer.getBounds(), { padding: [50, 50] })
    }
  } catch (error) {
    console.error('Error loading initial filter:', error)
  }
}

const clearShape = () => {
  if (drawnItems.value) {
    drawnItems.value.clearLayers()
  }
  currentShape.value = null
  emit('filter-change', null)
  emit('filter-clear')
}

const applyFilter = () => {
  if (currentShape.value) {
    emit('filter-apply', currentShape.value)
  }
}

const getShapeLabel = (type) => {
  const labels = {
    polygon: 'Polygon',
    rectangle: 'Rectangle',
    circle: 'Circle'
  }
  return labels[type] || type
}

const getShapeDescription = () => {
  if (!currentShape.value) return ''

  const { type, coordinates, radius } = currentShape.value

  if (type === 'circle') {
    const center = coordinates[0]
    const radiusKm = (radius / 1000).toFixed(2)
    return `Circle: center (${center[1].toFixed(4)}, ${center[0].toFixed(4)}), radius ${radiusKm} km`
  } else {
    const vertexCount = coordinates.length - 1 // Exclude closing vertex
    return `${getShapeLabel(type)}: ${vertexCount} vertices`
  }
}

// Lifecycle
onMounted(() => {
  // Map will be initialized when modal first opens (lazy loading)
})

onUnmounted(() => {
  if (map.value) {
    map.value.off(L.Draw.Event.CREATED, handleDrawCreated)
    map.value.off(L.Draw.Event.EDITED, handleDrawEdited)
    map.value.off(L.Draw.Event.DELETED, handleDrawDeleted)
    map.value.remove()
    map.value = null
  }
})

// Watch for initial filter changes
watch(() => props.initialFilter, (newFilter) => {
  if (newFilter && map.value && drawnItems.value) {
    drawnItems.value.clearLayers()
    loadInitialFilter(newFilter)
  }
}, { deep: true })

// Expose methods for parent component
defineExpose({
  clearShape,
  applyFilter,
  openModal,
  closeModal,
  getCurrentShape: () => currentShape.value
})
</script>

<style scoped>
/* Inline trigger button - matches AdvancedSearch toggle */
.geo-filter-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.geo-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.geo-trigger-btn:hover {
  color: #3498db;
  background: #f5f9fc;
}

.geo-trigger-btn.active {
  color: #3498db;
}

.geo-icon {
  display: flex;
  align-items: center;
  color: #999;
}

.geo-trigger-btn:hover .geo-icon,
.geo-trigger-btn.active .geo-icon {
  color: #3498db;
}

.geo-label {
  font-weight: 500;
}

.shape-badge {
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  background: #3498db;
  color: white;
}

.geo-clear-btn {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.geo-clear-btn:hover {
  background: #fee;
  color: #e74c3c;
}

/* Modal Overlay */
.geo-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal */
.geo-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.geo-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.geo-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #e74c3c;
  color: white;
}

.geo-modal-body {
  flex: 1;
  overflow: visible;
}

.map-wrapper {
  position: relative;
  height: 400px;
}

.filter-map {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.filter-controls {
  padding: 12px 20px;
  background: #f8f9fa;
}

.draw-instructions {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.geo-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #999;
  color: #333;
}

.btn-secondary:disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .geo-modal {
    width: 95%;
    max-height: 85vh;
  }

  .map-wrapper {
    height: 300px;
  }

  .geo-modal-footer {
    flex-wrap: wrap;
  }
}
</style>

<style>
/* Global styles for Leaflet Draw (not scoped) */
.geo-modal .leaflet-draw-toolbar {
  display: block !important;
}

.geo-modal .leaflet-draw {
  z-index: 1000;
}

.geo-modal .leaflet-draw-toolbar a {
  background-image: url('https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/images/spritesheet.png') !important;
  background-repeat: no-repeat;
  background-size: 300px 30px;
  width: 30px;
  height: 30px;
}

.geo-modal .leaflet-draw-toolbar a.leaflet-draw-draw-polygon {
  background-position: -31px -1px;
}

.geo-modal .leaflet-draw-toolbar a.leaflet-draw-draw-rectangle {
  background-position: -61px -1px;
}

.geo-modal .leaflet-draw-toolbar a.leaflet-draw-draw-circle {
  background-position: -91px -1px;
}

.geo-modal .leaflet-draw-toolbar a.leaflet-draw-edit-edit {
  background-position: -151px -1px;
}

.geo-modal .leaflet-draw-toolbar a.leaflet-draw-edit-remove {
  background-position: -181px -1px;
}

/* Ensure Leaflet Draw guide layers work properly in modal */
.geo-modal .filter-map {
  touch-action: none;
}

.geo-modal .leaflet-draw-guide-dash {
  z-index: 500;
}
</style>