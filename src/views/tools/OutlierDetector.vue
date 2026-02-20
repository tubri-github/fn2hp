<template>
  <div class="outlier-detector">
    <div class="container">
      <div class="sidebar">
        <h2 style="margin-bottom: 20px; color: #333;">🌊 Species River Distribution Analysis</h2>

        <!-- API Connection Status -->
        <div :class="['api-status', apiConnected ? 'api-connected' : 'api-disconnected']">
          {{ apiConnected ? '✅ API Connected' : '❌ API Connection Failed' }}
        </div>

        <!-- Analysis Mode Switch -->
        <div class="mode-switch">
          <button :class="['mode-btn', {active: analysisMode === 'species'}]"
                  @click="switchMode('species')">
            🐟 Species Analysis
          </button>
          <button :class="['mode-btn', {active: analysisMode === 'river'}]"
                  @click="switchMode('river')">
            🌊 River Analysis
          </button>
        </div>

        <!-- HUC Level Selection -->
        <div class="control-group">
          <h3>🗺️ Watershed Analysis Level (HUC)</h3>
          <div class="huc-selector">
            <button :class="['huc-option', {active: selectedHucLevel === 'huc4'}]"
                    @click="selectHucLevel('huc4')">
              HUC4
            </button>
            <button :class="['huc-option', {active: selectedHucLevel === 'huc8'}]"
                    @click="selectHucLevel('huc8')">
              HUC8
            </button>
          </div>
          <div class="huc-info">
            <div v-if="selectedHucLevel === 'huc4'">
              <strong>HUC4 (Subregion):</strong> Large watershed regions for broad analysis
            </div>
            <div v-if="selectedHucLevel === 'huc8'">
              <strong>HUC8 (Subbasin):</strong> Smaller watershed units for detailed analysis
            </div>
            <div v-if="hucStatistics">
              <strong>Coverage:</strong> {{ hucStatistics.watersheds_count }} watersheds analyzed
            </div>
          </div>
        </div>

        <!-- Species Analysis Mode -->
        <div v-if="analysisMode === 'species'" class="control-group">
          <h3>🐟 Species River Distribution</h3>
          <div class="form-group">
            <label>Select Species:</label>
            <select v-model="selectedSpecies" @change="onSpeciesChange">
              <option value="">Please select species</option>
              <option v-for="species in availableSpecies" :key="species" :value="species">
                {{ species }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="selectedSpecies">
            <label>River Buffer Zone: {{ bufferDistance }}km</label>
            <input type="range" v-model="bufferDistance" min="0.5" max="10" step="0.5" @input="onBufferChange">
            <div class="range-value">{{ bufferDistance }}km</div>
          </div>
          <button class="btn btn-success" @click="analyzeSpeciesRivers"
                  :disabled="!selectedSpecies || loading">
            {{ loading ? 'Analyzing...' : '🔍 Analyze Species Distribution' }}
          </button>
        </div>

        <!-- River Analysis Mode -->
        <div v-if="analysisMode === 'river'" class="control-group">
          <h3>🌊 River Outlier Detection</h3>
          <div class="form-group">
            <label>Select River:</label>
            <select v-model="selectedRiver" @change="onRiverChange">
              <option value="">Please select river</option>
              <option v-for="river in availableRivers" :key="river.id" :value="river.name">
                {{ river.name }} ({{ river.feature_type }})
              </option>
            </select>
          </div>
          <div class="form-group" v-if="selectedRiver">
            <label>Outlier Detection Buffer: {{ outlierBuffer }}km</label>
            <input type="range" v-model="outlierBuffer" min="1" max="20" step="1" @input="onOutlierBufferChange">
            <div class="range-value">{{ outlierBuffer }}km</div>
          </div>
          <button class="btn btn-success" @click="analyzeRiverOutliers"
                  :disabled="!selectedRiver || loading">
            {{ loading ? 'Analyzing...' : '🔍 Detect Outliers' }}
          </button>
        </div>

        <!-- River List -->
        <div v-if="analysisMode === 'species' && riversList.length > 0" class="control-group">
          <h3>📊 Related Rivers (Sorted by Sample Points)</h3>
          <div class="river-list">
            <div v-for="river in riversList" :key="river.river_name"
                 :class="['river-item', {highlighted: highlightedRivers.has(river.river_name), selected: selectedRiverForHighlight === river.river_name}]"
                 @click="toggleRiverHighlight(river.river_name)"
                 @mouseenter="highlightRiver(river.river_name)"
                 @mouseleave="unhighlightRiver(river.river_name)">
              <div class="river-name">{{ river.river_name }}</div>
              <div class="river-details">
                {{ river.feature_type }} | {{ river.point_count }} sample points |
                Avg distance: {{ river.avg_distance }}km
              </div>
            </div>
          </div>
        </div>

        <!-- Analysis Results Statistics -->
        <div class="stats" v-if="analysisResults">
          <h4>📈 Analysis Results</h4>
          <div v-if="analysisMode === 'species'">
            <div class="stat-item">
              <span>Species:</span>
              <span style="font-weight: bold;">{{ analysisResults.species_name }}</span>
            </div>
            <div class="stat-item">
              <span>HUC Level:</span>
              <span style="color: #007bff;">{{ selectedHucLevel.toUpperCase() }}</span>
            </div>
            <div class="stat-item">
              <span>Watersheds Covered:</span>
              <span style="color: #28a745;">{{ analysisResults.statistics.huc_watersheds_count }}</span>
            </div>
            <div class="stat-item">
              <span>Total Sample Points:</span>
              <span>{{ analysisResults.total_points }}</span>
            </div>
            <div class="stat-item">
              <span>Within River Buffer:</span>
              <span style="color: #007bff;">{{ analysisResults.statistics.total_points_near_rivers }}</span>
            </div>
            <div class="stat-item">
              <span>Outside River Buffer:</span>
              <span style="color: #ff6b6b;">{{ analysisResults.statistics.points_outside_rivers }}</span>
            </div>
            <div class="stat-item">
              <span>River Coverage:</span>
              <span style="color: #28a745;">{{ analysisResults.statistics.river_coverage_percentage }}%</span>
            </div>
            <div class="stat-item">
              <span>Covered Rivers:</span>
              <span>{{ analysisResults.rivers_with_species.length }}</span>
            </div>
            <div class="stat-item">
              <span>Buffer Distance:</span>
              <span>{{ bufferDistance }}km</span>
            </div>
          </div>
          <div v-if="analysisMode === 'river'">
            <div class="stat-item">
              <span>River:</span>
              <span style="font-weight: bold;">{{ selectedRiver }}</span>
            </div>
            <div class="stat-item">
              <span>HUC Level:</span>
              <span style="color: #007bff;">{{ selectedHucLevel.toUpperCase() }}</span>
            </div>
            <div class="stat-item">
              <span>Watersheds Covered:</span>
              <span style="color: #28a745;">{{ analysisResults.statistics.huc_watersheds_count }}</span>
            </div>
            <div class="stat-item">
              <span>Total Sample Points:</span>
              <span>{{ analysisResults.total_points }}</span>
            </div>
            <div class="stat-item">
              <span>Normal Data:</span>
              <span style="color: #28a745;">{{ analysisResults.statistics.normal }}</span>
            </div>
            <div class="stat-item">
              <span>Suspicious Data:</span>
              <span style="color: #ffc107;">{{ analysisResults.statistics.suspicious }}</span>
            </div>
            <div class="stat-item">
              <span>Outlier Data:</span>
              <span style="color: #fd7e14;">{{ analysisResults.statistics.outliers }}</span>
            </div>
            <div class="stat-item">
              <span>Severe Outliers:</span>
              <span style="color: #dc3545;">{{ analysisResults.statistics.severe_outliers }}</span>
            </div>
            <div class="stat-item">
              <span>Data Quality:</span>
              <span style="color: #007bff;">{{ analysisResults.statistics.accuracy }}%</span>
            </div>
          </div>
        </div>

        <!-- Available Watersheds Information -->
        <div v-if="availableWatersheds.length > 0" class="control-group">
          <h3>🏞️ Available Watersheds ({{ selectedHucLevel.toUpperCase() }})</h3>
          <div class="stats">
            <div v-for="watershed in availableWatersheds.slice(0, 5)" :key="watershed.huc_code" class="stat-item">
              <span>{{ watershed.name }}</span>
              <span>{{ watershed.feature_count }} features</span>
            </div>
            <div v-if="availableWatersheds.length > 5" class="stat-item">
              <span>... and {{ availableWatersheds.length - 5 }} more</span>
            </div>
          </div>
        </div>

        <!-- Operation Buttons -->
        <div class="control-group">
          <button class="btn btn-secondary" @click="resetAnalysis">
            🔄 Reset Analysis
          </button>
          <button class="btn btn-secondary" @click="fitMapToData" :disabled="!hasMapData">
            🎯 Zoom to Data
          </button>
          <button class="btn btn-secondary" @click="loadWatershedsInfo">
            📋 Load Watershed Info
          </button>
        </div>

        <!-- Legend -->
        <div class="legend">
          <h4>🎨 Legend</h4>
          <div v-if="analysisMode === 'species'">
            <div class="legend-item">
              <div class="legend-color" style="background: #007bff;"></div>
              <span>Sample points within river buffer</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ff6b6b;"></div>
              <span>Sample points outside river buffer</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ffff00;"></div>
              <span>Highlighted rivers</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: linear-gradient(90deg, #87ceeb, #4682b4);"></div>
              <span>WMS water layer</span>
            </div>
          </div>
          <div v-if="analysisMode === 'river'">
            <div class="legend-item">
              <div class="legend-color" style="background: #28a745;"></div>
              <span>Normal (within river)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #ffc107;"></div>
              <span>Suspicious (within buffer)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #fd7e14;"></div>
              <span>Outlier (outside buffer)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #dc3545;"></div>
              <span>Severe outlier (far from river)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #007bff;"></div>
              <span>Selected river</span>
            </div>
          </div>
        </div>

        <!-- Map Configuration -->
        <div class="control-group">
          <h3>🗺️ Map Layers</h3>
          <div class="form-group">
            <label>Base Map:</label>
            <select v-model="selectedBaseMap" @change="changeBaseMap">
              <option value="carto">CartoDB Light</option>
              <option value="osm">OpenStreetMap</option>
              <option value="satellite">Esri Satellite</option>
              <option value="google-roadmap">Google Roadmap</option>
              <option value="google-satellite">Google Satellite</option>
              <option value="google-hybrid">Google Hybrid</option>
              <option value="google-terrain">Google Terrain</option>
              <option value="world-imagery">World Imagery</option>
              <option value="world-topo">World Topographic</option>
              <option value="world-street">World Street Map</option>
              <option value="natgeo">National Geographic</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>
          <div style="font-size: 12px; color: #666;">
            <label>
              <input type="checkbox" v-model="showWMSLayer" @change="toggleWMSLayer">
              Show WMS river layer
            </label>
            <div v-if="showWMSLayer" style="margin-top: 8px;">
              <label>WMS Service URL:</label>
              <input type="text" v-model="wmsUrl" placeholder="https://www.hydroclim.org/geoserver/wms"
                     style="width: 100%; padding: 4px; font-size: 11px; margin-top: 4px;">
              <label style="margin-top: 8px;">Layer Name:</label>
              <input type="text" v-model="wmsLayerName" placeholder="hydroclim:LA_Water"
                     style="width: 100%; padding: 4px; font-size: 11px; margin-top: 4px;">
            </div>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errorMessage" class="error">
          {{ errorMessage }}
        </div>

        <!-- Success Messages -->
        <div v-if="successMessage" class="success">
          {{ successMessage }}
        </div>
      </div>

      <div class="map-container">
        <div id="map" ref="mapContainer"></div>
        <div class="loading" v-if="loading">
          <div class="loading-spinner"></div>
          <div>Executing GIS Analysis...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'OutlierDetector',
  setup() {
    // API Configuration
    const API_BASE_URL = import.meta.env.VITE_FISHESOFLA_API_URL || 'http://localhost:8001'

    // State Management
    const map = ref(null)
    const loading = ref(false)
    const apiConnected = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    // Analysis Mode
    const analysisMode = ref('species') // 'species' or 'river'

    // HUC Level Selection
    const selectedHucLevel = ref('huc8') // 'huc4' or 'huc8'
    const availableWatersheds = ref([])
    const hucStatistics = ref(null)

    // Species Analysis Related
    const availableSpecies = ref([])
    const selectedSpecies = ref('')
    const bufferDistance = ref(2.0)

    // River Analysis Related
    const availableRivers = ref([])
    const selectedRiver = ref('')
    const outlierBuffer = ref(5)

    // Analysis Results
    const analysisResults = ref(null)
    const riversList = ref([])

    // Map Related
    const markersLayer = ref(null)
    const wmsLayer = ref(null)
    const highlightLayer = ref(null)
    const selectedBaseMap = ref('carto')

    // WMS Configuration
    const showWMSLayer = ref(true)
    const wmsUrl = ref('https://www.hydroclim.org/geoserver/wms')
    const wmsLayerName = ref('hydroclim:LA_Water')

    // Highlight State
    const highlightedRivers = ref(new Set())
    const selectedRiverForHighlight = ref('')

    // Computed Properties
    const hasMapData = computed(() => {
      return analysisResults.value &&
        ((analysisMode.value === 'species' && analysisResults.value.total_points > 0) ||
          (analysisMode.value === 'river' && analysisResults.value.total_points > 0))
    })

    // API Request Wrapper
    const apiRequest = async (endpoint, options = {}) => {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.error(`API request failed ${endpoint}:`, error)
        throw error
      }
    }

    // Check API Connection
    const checkApiConnection = async () => {
      try {
        await apiRequest('/health')
        apiConnected.value = true
        errorMessage.value = ''
      } catch (error) {
        apiConnected.value = false
        errorMessage.value = 'API connection failed, please ensure backend service is running'
      }
    }

    // Load Species List
    const loadSpecies = async () => {
      try {
        // Use fixed list of species
        const species = [
          'Pimephales vigilax',
          'Lepomis megalotis',
          'Gambusia affinis',
          'Lepomis macrochirus',
          'Notropis atherinoides'
        ]
        availableSpecies.value = species
      } catch (error) {
        errorMessage.value = 'Failed to load species list: ' + error.message
      }
    }

    // Load Rivers List
    const loadRivers = async () => {
      try {
        const rivers = await apiRequest('/boundaries/list')
        availableRivers.value = rivers
      } catch (error) {
        errorMessage.value = 'Failed to load rivers list: ' + error.message
      }
    }

    // Load Watersheds Information
    const loadWatershedsInfo = async () => {
      try {
        loading.value = true
        const watersheds = await apiRequest(`/watersheds/list?huc_level=${selectedHucLevel.value}`)
        availableWatersheds.value = watersheds
        successMessage.value = `Loaded ${watersheds.length} ${selectedHucLevel.value.toUpperCase()} watersheds`
      } catch (error) {
        errorMessage.value = 'Failed to load watersheds: ' + error.message
      } finally {
        loading.value = false
      }
    }

    // Select HUC Level
    const selectHucLevel = (level) => {
      selectedHucLevel.value = level
      // Reset analysis when HUC level changes
      resetAnalysis()
      // Load watersheds info for the new level
      loadWatershedsInfo()
      // Trigger re-analysis if data exists
      if (selectedSpecies.value && analysisMode.value === 'species') {
        debounceAnalyzeSpecies()
      } else if (selectedRiver.value && analysisMode.value === 'river') {
        debounceAnalyzeRiver()
      }
    }

    // Switch Analysis Mode
    const switchMode = (mode) => {
      analysisMode.value = mode
      resetAnalysis()
      if (mode === 'river' && availableRivers.value.length === 0) {
        loadRivers()
      }
    }

    // Species Change Event
    const onSpeciesChange = () => {
      if (selectedSpecies.value) {
        // First show all species sample points
        loadSpeciesData()
        // Then analyze river distribution
        analyzeSpeciesRivers()
      }
    }

    // Load and Display Species Data Points
    const loadSpeciesData = async () => {
      if (!selectedSpecies.value) return

      try {
        const speciesData = await apiRequest(`/species/data?species=${encodeURIComponent(selectedSpecies.value)}&limit=5000`)
        displaySpeciesPoints(speciesData)
      } catch (error) {
        console.error('Failed to load species data:', error)
      }
    }

    // Display Species Sample Points
    const displaySpeciesPoints = (speciesData) => {
      // Clear existing markers
      if (markersLayer.value) {
        markersLayer.value.clearLayers()
      }

      // Create sample point markers
      speciesData.forEach(point => {
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: 6,
          fillColor: '#007bff',
          color: '#fff',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.7
        })

        const popupContent = `
          <div style="font-size: 12px;">
            <strong>Sample Point #${point.id}</strong><br>
            <strong>Species:</strong> ${point.scientific_name}<br>
            <strong>Coordinates:</strong> ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}<br>
            ${point.institution_code ? `<strong>Institution:</strong> ${point.institution_code}<br>` : ''}
            ${point.catalog_number ? `<strong>Catalog #:</strong> ${point.catalog_number}<br>` : ''}
            ${point.locality ? `<strong>Location:</strong> ${point.locality}<br>` : ''}
            ${point.family ? `<strong>Family:</strong> ${point.family}` : ''}
          </div>
        `

        marker.bindPopup(popupContent)
        markersLayer.value.addLayer(marker)
      })

      // Adjust map view to all points
      if (speciesData.length > 0) {
        const group = new L.featureGroup(markersLayer.value.getLayers())
        map.value.fitBounds(group.getBounds(), { padding: [20, 20] })
      }

      successMessage.value = `Displayed ${speciesData.length} sample points of ${selectedSpecies.value}`
    }

    // Buffer Change Event
    const onBufferChange = () => {
      if (selectedSpecies.value && analysisMode.value === 'species') {
        debounceAnalyzeSpecies()
      }
    }

    // River Change Event
    const onRiverChange = () => {
      if (selectedRiver.value) {
        highlightSelectedRiver()
      }
    }

    // Outlier Detection Buffer Change
    const onOutlierBufferChange = () => {
      if (selectedRiver.value && analysisMode.value === 'river') {
        debounceAnalyzeRiver()
      }
    }

    // Debounce Functions
    let speciesAnalysisTimeout
    const debounceAnalyzeSpecies = () => {
      clearTimeout(speciesAnalysisTimeout)
      speciesAnalysisTimeout = setTimeout(analyzeSpeciesRivers, 500)
    }

    let riverAnalysisTimeout
    const debounceAnalyzeRiver = () => {
      clearTimeout(riverAnalysisTimeout)
      riverAnalysisTimeout = setTimeout(analyzeRiverOutliers, 500)
    }

    // Analyze Species River Distribution - Updated with HUC parameter
    const analyzeSpeciesRivers = async () => {
      if (!selectedSpecies.value) return

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const requestData = {
          species_name: selectedSpecies.value,
          buffer_distance: parseFloat(bufferDistance.value),
          min_points_per_river: 1,
          huc_level: selectedHucLevel.value // Include HUC level
        }

        const results = await apiRequest('/analysis/species-rivers', {
          method: 'POST',
          body: JSON.stringify(requestData)
        })

        analysisResults.value = results
        riversList.value = results.rivers_with_species.sort((a, b) => b.point_count - a.point_count)

        // Update HUC statistics
        hucStatistics.value = {
          watersheds_count: results.statistics.huc_watersheds_count || 0,
          huc_codes: results.statistics.huc_codes_covered || []
        }

        await displaySpeciesAnalysisImproved(results)

        const bufferPoints = results.statistics.total_points_near_rivers
        const totalPoints = results.total_points
        const outsidePoints = results.statistics.points_outside_rivers
        const watershedsCount = results.statistics.huc_watersheds_count || 0
        successMessage.value = `Found ${results.rivers_with_species.length} related rivers across ${watershedsCount} ${selectedHucLevel.value.toUpperCase()} watersheds. Total ${totalPoints} points: ${bufferPoints} within river buffer, ${outsidePoints} outside buffer`

      } catch (error) {
        errorMessage.value = 'Species analysis failed: ' + error.message
      } finally {
        loading.value = false
      }
    }

    // Display Species Analysis Results - Improved Version
    const displaySpeciesAnalysisImproved = async (results) => {
      // Clear existing markers
      if (markersLayer.value) {
        markersLayer.value.clearLayers()
      }

      // Get all species data points
      try {
        const allSpeciesData = await apiRequest(`/species/data?species=${encodeURIComponent(selectedSpecies.value)}&limit=5000`)

        // Create set of points within river buffer
        const pointsInBuffer = new Set()
        results.rivers_with_species.forEach(river => {
          river.sample_points.forEach(point => {
            pointsInBuffer.add(point.id)
          })
        })

        // Display all sample points, distinguishing whether within buffer
        allSpeciesData.forEach(point => {
          const isInBuffer = pointsInBuffer.has(point.id)

          const marker = L.circleMarker([point.latitude, point.longitude], {
            radius: isInBuffer ? 6 : 8,
            fillColor: isInBuffer ? '#007bff' : '#ff6b6b', // Blue: within buffer, Red: outside buffer
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.7
          })

          const popupContent = `
            <div style="font-size: 12px;">
              <strong>Sample Point #${point.id}</strong><br>
              <strong>Species:</strong> ${point.scientific_name}<br>
              <strong>Coordinates:</strong> ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}<br>
              <strong>Status:</strong> ${isInBuffer ?
              `<span style="color: #007bff;">Within river buffer</span>` :
              `<span style="color: #ff6b6b;">Outside river buffer</span>`}<br>
              <strong>HUC Level:</strong> ${selectedHucLevel.value.toUpperCase()}<br>
              ${point.institution_code ? `<strong>Institution:</strong> ${point.institution_code}<br>` : ''}
              ${point.catalog_number ? `<strong>Catalog #:</strong> ${point.catalog_number}<br>` : ''}
              ${point.locality ? `<strong>Location:</strong> ${point.locality}<br>` : ''}
              ${point.family ? `<strong>Family:</strong> ${point.family}<br>` : ''}
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd;">
                <strong>Mark this point:</strong><br>
                <div style="display: flex; gap: 4px; margin-top: 5px;">
                  <button onclick="markOutlierPoint(${point.id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'normal', 'species-river', '${selectedHucLevel.value}')" 
                          style="background: #28a745; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                    Normal
                  </button>
                  <button onclick="markOutlierPoint(${point.id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'suspicious', 'species-river', '${selectedHucLevel.value}')" 
                          style="background: #ffc107; color: black; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                    Suspicious
                  </button>
                  <button onclick="markOutlierPoint(${point.id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'outlier', 'species-river', '${selectedHucLevel.value}')" 
                          style="background: #fd7e14; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                    Outlier
                  </button>
                  <button onclick="markOutlierPoint(${point.id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'severe_outlier', 'species-river', '${selectedHucLevel.value}')" 
                          style="background: #dc3545; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                    Severe
                  </button>
                </div>
              </div>
            </div>
          `

          marker.bindPopup(popupContent)
          markersLayer.value.addLayer(marker)
        })

        // Adjust map view to all points
        if (allSpeciesData.length > 0) {
          const group = new L.featureGroup(markersLayer.value.getLayers())
          map.value.fitBounds(group.getBounds(), { padding: [20, 20] })
        }

      } catch (error) {
        console.error('Failed to get species data:', error)
        errorMessage.value = 'Failed to get species data: ' + error.message
      }
    }

    // Analyze River Outliers - Updated with HUC parameter
    const analyzeRiverOutliers = async () => {
      if (!selectedRiver.value) return

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const requestData = {
          species_filter: availableSpecies.value, // Analyze all species
          boundary_name: selectedRiver.value,
          buffer_distance: parseFloat(outlierBuffer.value),
          analysis_type: 'boundary',
          huc_level: selectedHucLevel.value // Include HUC level
        }

        const results = await apiRequest('/analysis/boundary', {
          method: 'POST',
          body: JSON.stringify(requestData)
        })

        analysisResults.value = results

        // Update HUC statistics
        hucStatistics.value = {
          watersheds_count: results.statistics.huc_watersheds_count || 0,
          huc_codes: results.statistics.huc_codes_analyzed || []
        }

        await displayRiverAnalysis(results)
        const watershedsCount = results.statistics.huc_watersheds_count || 0
        successMessage.value = `Analysis completed across ${watershedsCount} ${selectedHucLevel.value.toUpperCase()} watersheds! Detected ${results.statistics.outliers + results.statistics.severe_outliers} outlier points`

      } catch (error) {
        errorMessage.value = 'River analysis failed: ' + error.message
      } finally {
        loading.value = false
      }
    }

    // Display River Analysis Results
    const displayRiverAnalysis = async (results) => {
      // Clear existing markers
      if (markersLayer.value) {
        markersLayer.value.clearLayers()
      }

      // Status color mapping
      const statusColors = {
        'normal': '#28a745',
        'suspicious': '#ffc107',
        'outlier': '#fd7e14',
        'severe_outlier': '#dc3545'
      }

      const statusSizes = {
        'normal': 6,
        'suspicious': 8,
        'outlier': 10,
        'severe_outlier': 12
      }

      // Display sample points
      results.results.forEach(point => {
        const color = statusColors[point.status]
        const size = statusSizes[point.status]

        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: size,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.7
        })

        const popupContent = `
          <div style="font-size: 12px;">
            <strong>Sample Point #${point.point_id}</strong><br>
            <strong>Species:</strong> ${point.scientific_name}<br>
            <strong>Coordinates:</strong> ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}<br>
            <strong>Distance to River:</strong> ${point.distance_to_boundary.toFixed(2)} km<br>
            <strong>Status:</strong> ${getStatusText(point.status)}<br>
            <strong>HUC Level:</strong> ${selectedHucLevel.value.toUpperCase()}<br>
            ${point.locality ? `<strong>Location:</strong> ${point.locality}<br>` : ''}
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd;">
              <strong>Mark this point:</strong><br>
              <div style="display: flex; gap: 4px; margin-top: 5px;">
                <button onclick="markOutlierPoint(${point.point_id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'normal', 'river-boundary', '${selectedHucLevel.value}')" 
                        style="background: #28a745; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                  Normal
                </button>
                <button onclick="markOutlierPoint(${point.point_id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'suspicious', 'river-boundary', '${selectedHucLevel.value}')" 
                        style="background: #ffc107; color: black; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                  Suspicious
                </button>
                <button onclick="markOutlierPoint(${point.point_id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'outlier', 'river-boundary', '${selectedHucLevel.value}')" 
                        style="background: #fd7e14; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                  Outlier
                </button>
                <button onclick="markOutlierPoint(${point.point_id}, '${point.scientific_name}', ${point.latitude}, ${point.longitude}, 'severe_outlier', 'river-boundary', '${selectedHucLevel.value}')" 
                        style="background: #dc3545; color: white; border: none; padding: 4px 8px; font-size: 10px; border-radius: 3px; cursor: pointer;">
                  Severe
                </button>
              </div>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        markersLayer.value.addLayer(marker)
      })

      // Display river boundary (if available)
      if (results.boundary_geojson) {
        const boundaryLayer = L.geoJSON(results.boundary_geojson, {
          style: {
            color: '#007bff',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.1
          }
        })
        markersLayer.value.addLayer(boundaryLayer)
      }

      // Adjust map view
      if (results.results.length > 0) {
        const group = new L.featureGroup(markersLayer.value.getLayers())
        map.value.fitBounds(group.getBounds(), { padding: [20, 20] })
      }
    }

    // Get Status Text
    const getStatusText = (status) => {
      const statusTexts = {
        'normal': 'Normal',
        'suspicious': 'Suspicious',
        'outlier': 'Outlier',
        'severe_outlier': 'Severe Outlier'
      }
      return statusTexts[status] || status
    }

    // Mark Outlier Point
    const markOutlierPoint = async (samplePointId, speciesName, latitude, longitude, flagType, analysisType, hucLevel, notes = '') => {
      try {
        loading.value = true
        errorMessage.value = ''

        const flagData = {
          sample_point_id: samplePointId,
          species_name: speciesName,
          latitude: latitude,
          longitude: longitude,
          flag_type: flagType,
          analysis_type: analysisType,
          huc_level: hucLevel,
          notes: notes
        }

        const token = getUserToken()
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // Add Authorization header only if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        await apiRequest('/flags/outlier', {
          method: 'POST',
          body: JSON.stringify(flagData),
          headers: headers,
          credentials: 'include' // Include cookies for session-based auth
        })

        successMessage.value = `Successfully marked sample point #${samplePointId} as ${getStatusText(flagType)}`
        
        // Close any open popups
        if (map.value) {
          map.value.closePopup()
        }

      } catch (error) {
        errorMessage.value = `Failed to mark outlier point: ${error.message}`
      } finally {
        loading.value = false
      }
    }

    // Get User Token from SSO system
    const getUserToken = () => {
      // Try different possible token storage locations used by SSO systems
      const possibleTokenKeys = [
        'access_token',
        'authToken', 
        'jwt_token',
        'token',
        'fn2_token',
        'project_token'
      ]
      
      // Check localStorage first
      for (const key of possibleTokenKeys) {
        const token = localStorage.getItem(key)
        if (token && token !== 'null' && token !== 'undefined') {
          return token
        }
      }
      
      // Check sessionStorage
      for (const key of possibleTokenKeys) {
        const token = sessionStorage.getItem(key)
        if (token && token !== 'null' && token !== 'undefined') {
          return token
        }
      }
      
      // If no token found, the request will likely fail and the user will need to re-authenticate
      return null
    }

    // Highlight Rivers - Improved Version: Support multiple segments of rivers with same name
    const toggleRiverHighlight = async (riverName) => {
      if (selectedRiverForHighlight.value === riverName) {
        // Cancel highlight
        selectedRiverForHighlight.value = ''
        if (highlightLayer.value) {
          highlightLayer.value.clearLayers()
        }
        successMessage.value = `Highlight cancelled: ${riverName}`
      } else {
        // Highlight new river
        selectedRiverForHighlight.value = riverName
        await highlightRiverOnMapImproved(riverName)
        successMessage.value = `River highlighted: ${riverName}`
      }
    }

    const highlightRiver = (riverName) => {
      highlightedRivers.value.add(riverName)
    }

    const unhighlightRiver = (riverName) => {
      highlightedRivers.value.delete(riverName)
    }

    // Improved River Highlight Function
    const highlightRiverOnMapImproved = async (riverName) => {
      try {
        // Remove previous highlight layer
        if (highlightLayer.value) {
          highlightLayer.value.clearLayers()
        }

        // Method 1: Get river geometry from analysis results
        if (analysisResults.value && analysisResults.value.rivers_with_species) {
          const riverData = analysisResults.value.rivers_with_species.find(
            river => river.river_name === riverName
          )

          if (riverData && riverData.river_geometry) {
            const highlightStyle = {
              color: '#ffff00',
              weight: 6,
              opacity: 0.9,
              fillColor: '#ffff00',
              fillOpacity: 0.3
            }

            const geoJsonLayer = L.geoJSON(riverData.river_geometry, {
              style: highlightStyle
            })

            highlightLayer.value.addLayer(geoJsonLayer)
            map.value.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] })

            console.log(`Successfully highlighted river: ${riverName} (using analysis results)`)
            return
          }
        }

        // Method 2: Get all river segments with same name from API
        try {
          const riverSegments = await apiRequest(`/boundaries/by-name/${encodeURIComponent(riverName)}`)

          if (riverSegments && riverSegments.segments && riverSegments.segments.length > 0) {
            const highlightStyle = {
              color: '#ffff00',
              weight: 6,
              opacity: 0.9,
              fillColor: '#ffff00',
              fillOpacity: 0.3
            }

            const allBounds = []
            riverSegments.segments.forEach(segment => {
              const segmentLayer = L.geoJSON(segment.geometry, {
                style: highlightStyle
              })
              highlightLayer.value.addLayer(segmentLayer)
              allBounds.push(segmentLayer.getBounds())
            })

            if (allBounds.length > 0) {
              let combinedBounds = allBounds[0]
              for (let i = 1; i < allBounds.length; i++) {
                combinedBounds.extend(allBounds[i])
              }
              map.value.fitBounds(combinedBounds, { padding: [20, 20] })
            }

            console.log(`Successfully highlighted river: ${riverName} (${riverSegments.segments_count} river segments)`)
          } else {
            console.log(`River geometry data not found: ${riverName}`)
            errorMessage.value = `River geometry data not found for "${riverName}"`
          }
        } catch (apiError) {
          console.error('API failed to get river data:', apiError)
          errorMessage.value = `Failed to get river data: ${apiError.message}`
        }

      } catch (error) {
        console.error('River highlight failed:', error)
        errorMessage.value = `River highlight failed: ${error.message}`
      }
    }

    // Current Base Map Layer
    const baseMapLayer = ref(null)

    // Switch Base Map
    const changeBaseMap = () => {
      const mapType = selectedBaseMap.value

      // Remove current base map
      if (baseMapLayer.value) {
        map.value.removeLayer(baseMapLayer.value)
      }

      // Add new base map
      switch (mapType) {
        case 'carto':
          baseMapLayer.value = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          })
          break
        case 'osm':
          baseMapLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          })
          break
        case 'satellite':
          baseMapLayer.value = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
          })
          break
        case 'google-roadmap':
          baseMapLayer.value = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
          })
          break
        case 'google-satellite':
          baseMapLayer.value = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
          })
          break
        case 'google-hybrid':
          baseMapLayer.value = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
          })
          break
        case 'google-terrain':
          baseMapLayer.value = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
          })
          break
        case 'world-imagery':
          baseMapLayer.value = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
          })
          break
        case 'world-topo':
          baseMapLayer.value = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
            maxZoom: 19
          })
          break
        case 'world-street':
          baseMapLayer.value = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{x}/{y}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
            maxZoom: 19
          })
          break
        case 'natgeo':
          baseMapLayer.value = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
            maxZoom: 16
          })
          break
        case 'dark':
          baseMapLayer.value = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          })
          break
        default:
          baseMapLayer.value = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          })
      }

      if (baseMapLayer.value) {
        map.value.addLayer(baseMapLayer.value)
      }
    }

    // Highlight Selected River
    const highlightSelectedRiver = () => {
      console.log(`Selected river: ${selectedRiver.value}`)
    }

    // WMS Layer Control
    const toggleWMSLayer = () => {
      if (showWMSLayer.value) {
        addWMSLayer()
      } else {
        removeWMSLayer()
      }
    }

    const addWMSLayer = () => {
      if (wmsLayer.value) {
        map.value.removeLayer(wmsLayer.value)
      }

      wmsLayer.value = L.tileLayer.wms(wmsUrl.value, {
        layers: wmsLayerName.value,
        styles: '',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        tiled: true,
        srs: 'EPSG:3857',
        opacity: 0.7,
        attribution: 'GeoServer WMS - hydroclim'
      })

      map.value.addLayer(wmsLayer.value)

      // Add click event to get feature info
      map.value.on('click', onMapClick)
    }

    const removeWMSLayer = () => {
      if (wmsLayer.value) {
        map.value.removeLayer(wmsLayer.value)
        wmsLayer.value = null
      }
      map.value.off('click', onMapClick)
    }

    // Map Click Event Handler
    const onMapClick = async (e) => {
      if (!showWMSLayer.value) return

      const { lat, lng } = e.latlng
      const point = map.value.latLngToContainerPoint(e.latlng)

      const params = {
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetFeatureInfo',
        LAYERS: wmsLayerName.value,
        QUERY_LAYERS: wmsLayerName.value,
        STYLES: '',
        FORMAT: 'image/png',
        INFO_FORMAT: 'application/json',
        WIDTH: map.value.getSize().x,
        HEIGHT: map.value.getSize().y,
        X: Math.round(point.x),
        Y: Math.round(point.y),
        SRS: 'EPSG:3857',
        BBOX: map.value.getBounds().toBBoxString()
      }

      const queryString = new URLSearchParams(params).toString()
      const url = `${wmsUrl.value}?${queryString}`

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          const properties = feature.properties

          const popupContent = `
            <div style="font-size: 12px;">
              <strong>Water Body Info</strong><br>
              <strong>Name:</strong> ${properties.NAME || properties.FEATURE_NA || 'Unknown'}<br>
              <strong>Type:</strong> ${properties.FEATURE || properties.FTYPE || 'Unknown'}<br>
              <strong>State:</strong> ${properties.STATE || 'LA'}<br>
              ${properties.AREASQKM ? `<strong>Area:</strong> ${properties.AREASQKM} km²<br>` : ''}
              ${properties.LENGTHKM ? `<strong>Length:</strong> ${properties.LENGTHKM} km<br>` : ''}
            </div>
          `

          L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map.value)
        }
      } catch (error) {
        console.error('GetFeatureInfo request failed:', error)
      }
    }

    // Zoom to Data
    const fitMapToData = () => {
      if (markersLayer.value && markersLayer.value.getLayers().length > 0) {
        const group = new L.featureGroup(markersLayer.value.getLayers())
        map.value.fitBounds(group.getBounds(), { padding: [20, 20] })
      }
    }

    // Reset Analysis
    const resetAnalysis = () => {
      analysisResults.value = null
      riversList.value = []
      errorMessage.value = ''
      successMessage.value = ''
      selectedRiverForHighlight.value = ''
      highlightedRivers.value.clear()
      hucStatistics.value = null

      if (markersLayer.value) {
        markersLayer.value.clearLayers()
      }

      if (highlightLayer.value) {
        highlightLayer.value.clearLayers()
      }
    }

    // Initialize Map
    const initMap = () => {
      const mapContainer = document.getElementById('map')
      if (!mapContainer) return

      map.value = L.map(mapContainer).setView([30.0, -92.0], 7) // Louisiana center

      // Use CartoDB Positron as default base map
      baseMapLayer.value = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map.value)

      // Initialize layers
      markersLayer.value = L.layerGroup().addTo(map.value)
      highlightLayer.value = L.layerGroup().addTo(map.value)

      // 强制地图重新计算大小，解决初始化大小问题
      setTimeout(() => {
        if (map.value) {
          map.value.invalidateSize()
        }
      }, 200)
    }

    // Clear Messages
    const clearMessages = () => {
      setTimeout(() => {
        errorMessage.value = ''
        successMessage.value = ''
      }, 5000)
    }

    // Watch message changes, auto clear
    watch([errorMessage, successMessage], clearMessages)

    // Watch WMS configuration changes
    watch([wmsUrl, wmsLayerName], () => {
      if (showWMSLayer.value) {
        addWMSLayer()
      }
    })

    // Component lifecycle
    onMounted(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for DOM
      
      // Make markOutlierPoint globally accessible for popup buttons
      window.markOutlierPoint = markOutlierPoint
      
      initMap()
      await checkApiConnection()

      if (apiConnected.value) {
        await loadSpecies()
        await loadWatershedsInfo() // Load initial watershed info
        if (showWMSLayer.value) {
          addWMSLayer()
        }
      }

      // 确保地图在窗口调整时重新计算大小
      window.addEventListener('resize', () => {
        if (map.value) {
          setTimeout(() => {
            map.value.invalidateSize()
          }, 100)
        }
      })
    })

    onUnmounted(() => {
      if (map.value) {
        map.value.remove()
      }
      
      // Clean up global reference
      delete window.markOutlierPoint
    })

    return {
      // State
      loading,
      apiConnected,
      errorMessage,
      successMessage,
      analysisMode,

      // HUC Related
      selectedHucLevel,
      availableWatersheds,
      hucStatistics,

      // Data
      availableSpecies,
      selectedSpecies,
      bufferDistance,
      availableRivers,
      selectedRiver,
      outlierBuffer,
      analysisResults,
      riversList,

      // WMS Related
      showWMSLayer,
      wmsUrl,
      wmsLayerName,
      selectedBaseMap,

      // Highlight State
      highlightedRivers,
      selectedRiverForHighlight,

      // Computed Properties
      hasMapData,

      // Methods
      selectHucLevel,
      loadWatershedsInfo,
      switchMode,
      onSpeciesChange,
      onBufferChange,
      onRiverChange,
      onOutlierBufferChange,
      analyzeSpeciesRivers,
      analyzeRiverOutliers,
      toggleRiverHighlight,
      highlightRiver,
      unhighlightRiver,
      toggleWMSLayer,
      changeBaseMap,
      fitMapToData,
      resetAnalysis,
      markOutlierPoint
    }
  }
}
</script>

<style scoped>
.outlier-detector {
  width: 100%;
  padding: 10px;
  margin: 0;
}

.container {
  display: flex;
  height: 85vh; /* 使用视口高度的85%，留出导航和其他元素空间 */
  width: 100%;
  max-width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar {
  width: 380px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.map-container {
  flex: 1;
  position: relative;
  height: 100% !important; /* 强制覆盖其他样式 */
  min-height: 500px !important; /* 确保最小高度 */
}

#map {
  height: 100%;
  width: 100%;
}

.control-group {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-group h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-group select,
.form-group input[type="range"],
.form-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.range-value {
  text-align: center;
  font-weight: bold;
  color: #007bff;
  font-size: 14px;
}

.btn {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  margin-bottom: 8px;
  transition: background-color 0.3s;
}

.btn:hover {
  background: #0056b3;
}

.btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-success {
  background: #28a745;
}

.btn-success:hover {
  background: #218838;
}

.stats {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #ddd;
}

.stats h4 {
  margin-bottom: 12px;
  color: #333;
  font-size: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 4px 0;
  font-size: 13px;
}

.river-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.river-item {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 13px;
}

.river-item:hover {
  background: #f8f9fa;
}

.river-item.highlighted {
  background: #fff3cd;
}

.river-item.selected {
  background: #e7f3ff;
}

.river-name {
  font-weight: bold;
  color: #333;
}

.river-details {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

.legend {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #ddd;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #ccc;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 13px;
}

.success {
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 13px;
}

.api-status {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 15px;
}

.api-connected {
  background: #d4edda;
  color: #155724;
}

.api-disconnected {
  background: #f8d7da;
  color: #721c24;
}

.mode-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: all 0.3s;
}

.mode-btn.active {
  background: #007bff;
  color: white;
}

.huc-info {
  background: #e3f2fd;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  color: #1565c0;
}

.huc-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.huc-option {
  flex: 1;
  padding: 6px 10px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: all 0.3s;
}

.huc-option.active {
  background: #007bff;
  color: white;
}
</style>