<template>
  <div class="geo-filter-inline">
    <!-- Trigger Button -->
    <button class="geo-trigger-btn" :class="{ active: currentShape || appliedDrainageCount }" @click="openModal">
      <span class="geo-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </span>
      <span class="geo-label">Location Filter</span>
      <span v-if="currentShape" class="shape-badge">{{ getShapeLabel(currentShape.type) }}</span>
      <span v-if="appliedDrainageCount" class="shape-badge drainage-badge">
        {{ appliedDrainageCount }} drainage{{ appliedDrainageCount > 1 ? 's' : '' }}
      </span>
    </button>

    <!-- Clear button when a filter is active -->
    <button v-if="currentShape || appliedDrainageCount" class="geo-clear-btn" @click.stop="clearAll" title="Clear">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="geo-modal-overlay" @click.self="closeModal">
      <div class="geo-modal">
        <div class="geo-modal-header">
          <h3>Location Filter</h3>
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
            <div class="lf-instructions">
              Draw an area with the tools (top-right) <strong>and/or</strong> click river
              drainages on the map — you can use both.
            </div>

            <div class="drainage-row">
              <label class="drainage-level-label">Drainage level:</label>
              <select v-model="hucLevel" class="drainage-level-select">
                <option value="huc4">HUC4 · Subregion</option>
                <option value="huc8" disabled>HUC8 · Basin (coming soon)</option>
                <option value="huc12" disabled>HUC12 · Subwatershed (coming soon)</option>
              </select>
            </div>

            <div v-if="selectedDrainages.length" class="drainage-chips">
              <span v-for="name in selectedDrainages" :key="name" class="drainage-chip">
                {{ name }}
                <button class="chip-x" @click="removeSelectedDrainage(name)">×</button>
              </span>
            </div>

            <div v-if="currentShape" class="lf-shape">Drawn area: {{ getShapeDescription() }}</div>

            <!-- Combine selector: only meaningful when BOTH a shape and drainages are set -->
            <div v-if="currentShape && selectedDrainages.length" class="combine-row">
              <span class="combine-label">Area &amp; drainage:</span>
              <label class="combine-opt">
                <input type="radio" value="and" v-model="combineMode" />
                Intersection <span class="combine-sub">(in both)</span>
              </label>
              <label class="combine-opt">
                <input type="radio" value="or" v-model="combineMode" />
                Union <span class="combine-sub">(in either)</span>
              </label>
            </div>

            <p class="drainage-note">
              ℹ️ River drainages currently cover the <strong>United States only</strong>
              (USGS HUC). Records outside the US have no drainage yet — global
              coverage (HydroBASINS) is planned.
            </p>
          </div>
        </div>

        <div class="geo-modal-footer">
          <button class="btn-secondary" @click="clearAll" :disabled="!canApply">
            Clear
          </button>
          <button class="btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button class="btn-primary" @click="applyAndClose" :disabled="!canApply">
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  },
  // Restores the drainage selection when the modal is reopened (the current
  // first-level drainage filter, list of huc4_name).
  initialDrainages: {
    type: Array,
    default: () => []
  },
  // Restores the combine mode ('and' = ∩, 'or' = ∪).
  initialCombine: {
    type: String,
    default: 'and'
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

// Emits — one unified apply carrying the whole Location Filter.
const emit = defineEmits(['apply', 'clear'])

// Refs
const mapContainer = ref(null)
const map = ref(null)
const drawnItems = ref(null)
const drawControl = ref(null)
const currentShape = ref(null)
const loading = ref(true)

// ---- River-drainage (HUC) selection --------------------------------------
// Drawing and drainage-picking coexist on ONE map (no mode toggle). combineMode
// decides how the drawn shape and the selected drainages relate.
const hucLevel = ref('huc4')               // extensible: 'huc4' now, 'huc8'/... later
const selectedDrainages = ref([])          // list of selected huc4_name strings
const combineMode = ref('and')             // 'and' = ∩ (shape AND drainage), 'or' = ∪
let drainageLayer = null                   // clickable boundary layer
let huc4Cache = null

const DRAINAGE_STYLE = { color: '#2166AC', weight: 1, fillColor: '#2166AC', fillOpacity: 0.05 }
const DRAINAGE_STYLE_SELECTED = { color: '#D95F0E', weight: 2.5, fillColor: '#D95F0E', fillOpacity: 0.25 }

const loadHuc4 = async () => {
  if (huc4Cache) return huc4Cache
  const res = await fetch(`${import.meta.env.BASE_URL}geo/huc4_us.geojson`)
  huc4Cache = await res.json()
  return huc4Cache
}

const styleForFeature = (f) =>
  selectedDrainages.value.includes(f.properties.huc4_name) ? DRAINAGE_STYLE_SELECTED : DRAINAGE_STYLE

// Add the clickable HUC4 boundary layer. Hover shows the drainage name; click
// toggles selection (multi-select) and restyles.
const renderDrainageLayer = async () => {
  if (!map.value) return
  if (drainageLayer) { map.value.removeLayer(drainageLayer); drainageLayer = null }
  const gj = await loadHuc4()
  drainageLayer = L.geoJSON(gj, {
    style: styleForFeature,
    onEachFeature: (feature, layer) => {
      const name = feature.properties.huc4_name
      layer.bindTooltip(name, { sticky: true, direction: 'top' })
      layer.on('mouseover', () => { if (!selectedDrainages.value.includes(name)) layer.setStyle({ weight: 2, fillOpacity: 0.15 }) })
      layer.on('mouseout', () => { drainageLayer.resetStyle(layer) })
      layer.on('click', () => {
        const i = selectedDrainages.value.indexOf(name)
        if (i > -1) selectedDrainages.value.splice(i, 1)
        else selectedDrainages.value.push(name)
        layer.setStyle(selectedDrainages.value.includes(name) ? DRAINAGE_STYLE_SELECTED : DRAINAGE_STYLE)
      })
    },
  }).addTo(map.value)
}

const removeSelectedDrainage = (name) => {
  const i = selectedDrainages.value.indexOf(name)
  if (i > -1) selectedDrainages.value.splice(i, 1)
  // restyle the matching layer if visible
  if (drainageLayer) {
    drainageLayer.eachLayer(l => {
      if (l.feature?.properties?.huc4_name === name) drainageLayer.resetStyle(l)
    })
  }
}

// While a draw tool is active, ignore drainage-layer clicks so placing a vertex
// doesn't also toggle a drainage underneath.
const setDrainageInteractive = (on) => {
  if (!drainageLayer) return
  drainageLayer.eachLayer(l => {
    if (l._path) l._path.style.pointerEvents = on ? '' : 'none'
  })
}

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

    // Disable map drag/tap AND drainage-layer clicks during drawing so they
    // don't conflict with placing vertices.
    map.value.on('draw:drawstart', () => {
      map.value.dragging.disable()
      setDrainageInteractive(false)
    })
    map.value.on('draw:drawstop', () => {
      map.value.dragging.enable()
      setDrainageInteractive(true)
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

    // Restore prior drainage selection + combine mode, then always show the
    // clickable drainage layer alongside the draw tools (unified — no modes).
    selectedDrainages.value = [...(props.initialDrainages || [])]
    combineMode.value = props.initialCombine || 'and'
    await renderDrainageLayer()
    if (drainageLayer && selectedDrainages.value.length && !currentShape.value) {
      try { map.value.fitBounds(drainageLayer.getBounds(), { padding: [20, 20], maxZoom: 8 }) } catch (e) { /* empty */ }
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
    }
  })
}

const handleDrawDeleted = () => {
  if (drawnItems.value.getLayers().length === 0) {
    currentShape.value = null
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

// Wipe both the drawn shape and the drainage selection, and clear upstream.
const clearAll = () => {
  if (drawnItems.value) drawnItems.value.clearLayers()
  currentShape.value = null
  selectedDrainages.value = []
  if (drainageLayer) drainageLayer.eachLayer(l => drainageLayer.resetStyle(l))
  emit('clear')
}

// Apply the whole Location Filter at once: shape + drainages + how they combine.
const applyFilter = () => {
  emit('apply', {
    shape: currentShape.value || null,
    drainages: [...selectedDrainages.value],
    combine: combineMode.value,
  })
}

// Apply/Clear enabled when there's anything set.
const canApply = computed(() => !!currentShape.value || selectedDrainages.value.length > 0)

// Count of the currently-applied drainage filter (from the parent), for the
// trigger badge + external clear button.
const appliedDrainageCount = computed(() => (props.initialDrainages || []).length)

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
  clearAll,
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

/* Mode toggle (segmented control) */
.mode-toggle {
  display: flex;
  gap: 4px;
  padding: 10px 20px 0;
}
.mode-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dde3ea;
  background: #f7f9fb;
  color: #667;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.mode-btn:first-child { border-radius: 6px 0 0 6px; }
.mode-btn:last-child { border-radius: 0 6px 6px 0; border-left: none; }
.mode-btn.active {
  background: #2166AC;
  border-color: #2166AC;
  color: #fff;
}

/* Drainage controls */
.drainage-controls { display: flex; flex-direction: column; gap: 8px; }
.drainage-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.drainage-level-label { font-size: 13px; color: #555; font-weight: 500; }
.drainage-level-select {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
}
.drainage-hint { font-size: 12px; color: #999; }
.lf-instructions { font-size: 13px; color: #555; line-height: 1.5; }
.lf-shape { font-size: 12px; color: #2166AC; }
.combine-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 10px;
  background: #eef4fb;
  border: 1px solid #cfe0f2;
  border-radius: 6px;
}
.combine-label { font-size: 13px; font-weight: 600; color: #2c3e50; }
.combine-opt {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #445;
  cursor: pointer;
}
.combine-opt input { cursor: pointer; margin: 0; }
.combine-sub { color: #8a97a5; font-size: 12px; }
.drainage-note {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #7a6a55;
  background: #fdf6ec;
  border: 1px solid #f3e2c7;
  border-radius: 6px;
  padding: 8px 10px;
}
.drainage-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.drainage-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 10px;
  background: #fdf0e6;
  border: 1px solid #f0c9a8;
  border-radius: 12px;
  font-size: 12px;
  color: #b5581f;
}
.chip-x {
  border: none;
  background: transparent;
  color: #b5581f;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}
.chip-x:hover { color: #7a3a12; }
.drainage-badge { background: #D95F0E !important; }

.geo-modal-body {
  flex: 1 1 auto;
  min-height: 0;        /* allow the flex child to shrink so it can scroll */
  overflow-y: auto;     /* short viewports (e.g. devtools open) scroll here,
                           keeping the footer buttons visible */
}

.map-wrapper {
  position: relative;
  height: 400px;
  flex-shrink: 0;
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
  flex-shrink: 0;   /* stay pinned; the body scrolls instead */
}

.geo-modal-header { flex-shrink: 0; }

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