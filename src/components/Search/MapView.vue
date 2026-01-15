<template>
  <div class="map-section">
    <div class="section-header">
      <h3 class="section-title">Geographic Distribution</h3>
      <div class="section-controls">
        <select v-model="selectedBaseMap" class="filter-select" @change="changeBaseMap">
          <option value="google-roadmap">Google Roadmap</option>
          <option value="google-satellite">Google Satellite</option>
          <option value="google-hybrid">Google Hybrid</option>
          <option value="google-terrain">Google Terrain</option>
          <option value="carto-light">CartoDB Light</option>
          <option value="carto-dark">CartoDB Dark</option>
          <option value="osm">OpenStreetMap</option>
        </select>
      </div>
    </div>

    <div class="map-wrapper">
      <div ref="mapContainer" class="map-container"></div>
    </div>

    <!-- Legend -->
    <div class="map-legend">
      <div class="legend-title">Record Density</div>
      <div class="legend-gradient">
        <div class="gradient-bar"></div>
        <div class="gradient-labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="map-summary">
      <div class="summary-item">
        <span class="summary-value">{{ clusterPoints.length }}</span>
        <span class="summary-label">Locations</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ formatNumber(totalRecords) }}</span>
        <span class="summary-label">Total Records</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">{{ uniqueCountries }}</span>
        <span class="summary-label">Countries</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineProps, defineExpose } from 'vue';

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  }
});

const mapContainer = ref(null);
const selectedBaseMap = ref('google-roadmap');

let map = null;
let markersLayer = null;
let baseMapLayer = null;
let L = null;

// Generate micro-cluster points (~1km range) around a center point
const generateMicroClusters = (centerLat, centerLng, country, baseLocation, numClusters, maxCount) => {
  const clusters = [];
  const spread = 0.05;

  for (let i = 0; i < numClusters; i++) {
    const offsetLat = (Math.random() - 0.5) * spread;
    const offsetLng = (Math.random() - 0.5) * spread;
    const count = Math.floor(Math.random() * maxCount) + 1;

    clusters.push({
      lat: centerLat + offsetLat,
      lng: centerLng + offsetLng,
      count: count,
      country: country,
      location: `${baseLocation} (${(offsetLat * 111).toFixed(1)}km, ${(offsetLng * 111 * Math.cos(centerLat * Math.PI / 180)).toFixed(1)}km)`
    });
  }
  return clusters;
};

// Mock cluster points data
const clusterPoints = computed(() => {
  if (props.points.length > 0) return props.points;

  const allClusters = [
    ...generateMicroClusters(29.95, -90.07, 'USA', 'New Orleans, LA', 25, 50),
    ...generateMicroClusters(30.45, -91.15, 'USA', 'Baton Rouge, LA', 20, 40),
    ...generateMicroClusters(25.76, -80.19, 'USA', 'Miami, FL', 30, 60),
    ...generateMicroClusters(-3.12, -60.02, 'Brazil', 'Manaus, Amazon', 35, 80),
    ...generateMicroClusters(-33.87, 151.21, 'Australia', 'Sydney', 22, 55),
    ...generateMicroClusters(51.51, -0.13, 'UK', 'London', 15, 35),
    ...generateMicroClusters(35.68, 139.69, 'Japan', 'Tokyo', 20, 50),
    ...generateMicroClusters(-33.93, 18.42, 'South Africa', 'Cape Town', 20, 50),
  ];

  return allClusters;
});

const totalRecords = computed(() => {
  return clusterPoints.value.reduce((sum, p) => sum + p.count, 0);
});

const uniqueCountries = computed(() => {
  return new Set(clusterPoints.value.map(p => p.country)).size;
});

const formatNumber = (num) => {
  return num.toLocaleString();
};

const getHeatColor = (count, maxCount) => {
  const ratio = count / maxCount;
  if (ratio > 0.7) return '#d73027';
  if (ratio > 0.5) return '#fc8d59';
  if (ratio > 0.3) return '#fee08b';
  if (ratio > 0.15) return '#91cf60';
  return '#1a9850';
};

const getPointRadius = (count, maxCount) => {
  const minRadius = 3;
  const maxRadius = 8;
  const ratio = Math.sqrt(count / maxCount);
  return minRadius + ratio * (maxRadius - minRadius);
};

const getTileConfig = (mapType) => {
  switch (mapType) {
    case 'google-roadmap':
      return { url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attribution: '© Google Maps', maxZoom: 20 };
    case 'google-satellite':
      return { url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', attribution: '© Google Maps', maxZoom: 20 };
    case 'google-hybrid':
      return { url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', attribution: '© Google Maps', maxZoom: 20 };
    case 'google-terrain':
      return { url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', attribution: '© Google Maps', maxZoom: 20 };
    case 'carto-light':
      return { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 };
    case 'carto-dark':
      return { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 };
    case 'osm':
      return { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© OpenStreetMap contributors', maxZoom: 19 };
    default:
      return { url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attribution: '© Google Maps', maxZoom: 20 };
  }
};

const changeBaseMap = () => {
  if (!map || !L) return;
  if (baseMapLayer) map.removeLayer(baseMapLayer);
  const config = getTileConfig(selectedBaseMap.value);
  baseMapLayer = L.tileLayer(config.url, {
    attribution: config.attribution,
    maxZoom: config.maxZoom,
    subdomains: config.subdomains || 'abc'
  });
  baseMapLayer.addTo(map);
};

const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    // Dynamically import Leaflet
    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    // Initialize map
    map = L.map(mapContainer.value, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
      preferCanvas: true
    });

    // Add base map
    const config = getTileConfig(selectedBaseMap.value);
    baseMapLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    });
    baseMapLayer.addTo(map);

    // Create markers layer
    markersLayer = L.layerGroup().addTo(map);

    // Add markers
    updateMarkers();

    // Fix size
    const fixSize = () => {
      if (map) map.invalidateSize();
    };
    setTimeout(fixSize, 100);
    setTimeout(fixSize, 300);
    setTimeout(fixSize, 500);

  } catch (error) {
    console.error('Failed to initialize map:', error);
  }
};

const updateMarkers = () => {
  if (!map || !L || !markersLayer) return;

  markersLayer.clearLayers();

  const maxCount = Math.max(...clusterPoints.value.map(p => p.count));

  clusterPoints.value.forEach(point => {
    const color = getHeatColor(point.count, maxCount);
    const radius = getPointRadius(point.count, maxCount);

    const marker = L.circleMarker([point.lat, point.lng], {
      radius: radius,
      fillColor: color,
      color: '#fff',
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.75
    });

    marker.bindPopup(`
      <div style="font-family: sans-serif; min-width: 150px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${point.location}</div>
        <div style="color: #666; font-size: 12px;">${point.country}</div>
        <div style="margin-top: 8px; font-size: 14px;">
          <strong style="color: #3498db;">${formatNumber(point.count)}</strong> records
        </div>
      </div>
    `);

    markersLayer.addLayer(marker);
  });
};

const handleResize = () => {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
};

watch(() => props.points, () => {
  updateMarkers();
}, { deep: true });

onMounted(() => {
  initMap();
  window.addEventListener('resize', handleResize);

  if (mapContainer.value && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mapContainer.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (map) {
    map.remove();
    map = null;
  }
});

const refresh = () => {
  if (map) {
    setTimeout(() => map.invalidateSize(), 50);
  }
};

defineExpose({ refresh });
</script>

<style scoped>
.map-section {
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.section-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

.map-wrapper {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
}

.map-container {
  height: 400px;
  width: 100%;
  background: #e8e8e8;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 15px;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.legend-gradient {
  flex: 1;
  max-width: 300px;
}

.gradient-bar {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, #1a9850, #91cf60, #fee08b, #fc8d59, #d73027);
  margin-bottom: 4px;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

.map-summary {
  display: flex;
  gap: 30px;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #3498db;
}

.summary-label {
  font-size: 13px;
  color: #666;
}
</style>

<style>
/* Leaflet overrides */
.leaflet-popup-content-wrapper {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.leaflet-popup-content {
  margin: 12px 14px;
}
</style>
