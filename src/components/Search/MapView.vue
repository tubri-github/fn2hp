<template>
  <div class="map-section">
    <div class="section-header">
      <div class="title-block">
        <h3 class="section-title">Geographic Distribution</h3>
        <p class="data-basis" v-if="basisText">{{ basisText }}</p>
      </div>
      <div class="section-controls">
        <label class="drainage-toggle" title="Overlay US river drainage (HUC4) boundaries">
          <input type="checkbox" v-model="showDrainages" @change="toggleDrainages" />
          <span>Drainages</span>
        </label>
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

    <!-- Individual-points mode status (#19) -->
    <div v-if="pointMode" class="point-mode-hint">
      <span v-if="pointsLoading">Loading individual points…</span>
      <span v-else>
        Showing {{ pointsShown }} individual records in view<span v-if="pointsCapped"> — capped, zoom in for the rest</span>
      </span>
    </div>

    <!-- Heatmap mode: nudge users to zoom for individual points (#19) -->
    <div v-if="!pointMode" class="zoom-guide">
      🔍 Zoom in to see individual record points (click a point for details)
    </div>

    <!-- Legend (heatmap only) -->
    <div v-if="!pointMode" class="map-legend">
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
import api from '@/api/base.js';

const SINGLE_POINT_ZOOM = 6;  // at/above this zoom, switch heatmap -> individual points (#19)

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  // Total records returned by the search query — lets us show what fraction
  // of the search the heatmap actually represents (records with valid
  // coordinates falling into the top-N geohash cells).
  searchTotal: {
    type: Number,
    default: 0
  },
  // Current search terms/filters, so the points endpoint returns the same set.
  searchPayload: {
    type: Object,
    default: () => ({})
  },
  // Active river-drainage filter (huc4_name values). Their HUC4 boundaries are
  // highlighted on the map so the user sees the region they filtered to.
  drainages: {
    type: Array,
    default: () => []
  }
});

const mapContainer = ref(null);
const selectedBaseMap = ref('google-roadmap');

let map = null;
let markersLayer = null;   // L.heatLayer instance (low zoom)
let pointsLayer = null;    // L.layerGroup of circle markers (high zoom, #19)
let baseMapLayer = null;
let L = null;
let pointsDebounce = null;

const pointMode = ref(false);     // true when showing individual points
const pointsCapped = ref(false);
const pointsLoading = ref(false);
const pointsShown = ref(0);

// River-drainage (HUC4) boundary layers
const showDrainages = ref(false); // toggle: overlay ALL drainage boundaries faintly
let drainageAllLayer = null;      // all 245 boundaries (reference overlay)
let drainageHighlightLayer = null;// boundaries of the currently-filtered drainages
let huc4Cache = null;             // lazily fetched FeatureCollection, cached

// Lazily fetch the compact HUC4 boundary GeoJSON (public/geo/huc4_us.geojson).
const loadHuc4 = async () => {
  if (huc4Cache) return huc4Cache;
  const res = await fetch(`${import.meta.env.BASE_URL}geo/huc4_us.geojson`);
  huc4Cache = await res.json();
  return huc4Cache;
};

// Outline the boundaries of the currently-filtered drainages and zoom to them.
const updateDrainageHighlight = async () => {
  if (!map || !L) return;
  if (drainageHighlightLayer) { map.removeLayer(drainageHighlightLayer); drainageHighlightLayer = null; }
  const names = props.drainages || [];
  if (!names.length) return;
  const gj = await loadHuc4();
  const feats = gj.features.filter(f => names.includes(f.properties.huc4_name));
  if (!feats.length) return;
  drainageHighlightLayer = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
    pane: 'drainagePane',
    style: { color: '#2166AC', weight: 2, fillColor: '#2166AC', fillOpacity: 0.08 },
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindTooltip(p.huc4_name, { sticky: true, direction: 'top' });
      layer.bindPopup(`<strong>${p.huc4_name}</strong><br/><span style="color:#888">River drainage · HUC4 ${p.huc4}</span>`);
    },
  }).addTo(map);
  // Zoom is handled by fitToResults() (fits to the actual result points), so we
  // only draw the boundary here.
};

// Zoom/centre the map onto the current result data. Broad results keep the map
// wide (heatmap); narrow results (a drainage / drawn shape) zoom in so the
// heatmap→points switch kicks in — no need to hunt for the data manually.
const fitToResults = () => {
  if (!map || !L) return;
  const pts = (props.points || []).filter(p => p && p.lat != null && p.lng != null);
  if (!pts.length) return;
  try {
    const bounds = L.latLngBounds(pts.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  } catch (e) { /* empty */ }
};

// Toggle the faint all-drainages reference overlay.
const toggleDrainages = async () => {
  if (!map || !L) return;
  if (showDrainages.value) {
    const gj = await loadHuc4();
    // Near-transparent fill so the whole polygon is hoverable for its name.
    drainageAllLayer = L.geoJSON(gj, {
      pane: 'drainagePane',
      style: { color: '#888', weight: 1, fillColor: '#888', fillOpacity: 0.03, opacity: 0.5 },
      onEachFeature: (f, layer) => {
        layer.bindTooltip(f.properties.huc4_name, { sticky: true, direction: 'top' });
      },
    }).addTo(map);
  } else if (drainageAllLayer) {
    map.removeLayer(drainageAllLayer);
    drainageAllLayer = null;
  }
};

// Lazily load the leaflet.heat plugin (same source CompactHeatMap uses).
// Resolves once L.heatLayer is available on the global L.
const loadHeatmapPlugin = () => {
  return new Promise((resolve, reject) => {
    if (L && typeof L.heatLayer !== 'undefined') {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-leaflet-heat]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
    script.dataset.leafletHeat = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load leaflet.heat'));
    document.head.appendChild(script);
  });
};

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

// "Mapped X records (Y% of total search)" — clarifies that the heatmap
// only includes records with usable coordinates and may be capped by the
// backend's geohash bucket size limit on huge searches.
const basisText = computed(() => {
  const local = totalRecords.value;
  const search = props.searchTotal;
  if (!search || !local) return '';
  const pct = ((local / search) * 100).toFixed(local / search >= 0.995 ? 0 : 1);
  return `Mapped ${formatNumber(local)} records with coordinates (${pct}% of ${formatNumber(search)} total)`;
});

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
    L = L.default || L;
    await import('leaflet/dist/leaflet.css');

    // The leaflet.heat plugin script patches window.L. Expose our imported
    // L so plugin extensions land on the same instance we use.
    if (typeof window !== 'undefined') {
      window.L = window.L || L;
    }

    // Make sure leaflet.heat is attached to L before we render.
    await loadHeatmapPlugin();

    // Initialize map
    map = L.map(mapContainer.value, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      worldCopyJump: true,
      preferCanvas: true
    });

    // Dedicated pane for drainage boundaries: above the heatmap canvas (~400)
    // so the outline is always visible, but below markers (600) so points stay
    // clickable.
    map.createPane('drainagePane');
    map.getPane('drainagePane').style.zIndex = 450;
    map.getPane('drainagePane').style.pointerEvents = 'auto';

    // Add base map
    const config = getTileConfig(selectedBaseMap.value);
    baseMapLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    });
    baseMapLayer.addTo(map);

    // Centre on the results, then render heat/points and the drainage boundary.
    fitToResults();
    updateView();
    updateDrainageHighlight();

    // Switch heat<->points and refresh on zoom/pan (issues #10 + #19).
    map.on('zoomend', updateView);
    map.on('moveend', updateView);

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

// Heat blobs use a fixed pixel radius, so without this they turn into tiny
// isolated dots when you zoom in (issue #10). Grow the radius with zoom so
// points keep blending into a readable density surface.
const heatRadiusForZoom = (zoom) => {
  return Math.round(Math.max(12, Math.min(45, 8 + zoom * 2.2)));
};

// Normalize intensity against the max count *currently in view*, not the global
// peak. Otherwise, once you zoom past a dense hotspot, the remaining local points
// are tiny relative to the global max and render as faint green dots (issue #10).
const visibleMax = () => {
  if (!map) return 1;
  const bounds = map.getBounds();
  let m = 1;
  for (const p of clusterPoints.value) {
    if (bounds.contains([p.lat, p.lng]) && p.count > m) m = p.count;
  }
  return m;
};

const updateHeatView = () => {
  if (!map || !markersLayer) return;
  const r = heatRadiusForZoom(map.getZoom());
  markersLayer.setOptions({ radius: r, blur: Math.round(r * 1.2), max: visibleMax() });
};

const updateMarkers = () => {
  if (!map || !L) return;
  if (typeof L.heatLayer === 'undefined') return;  // plugin not ready yet

  // Remove the previous heat layer (if any) before re-rendering.
  if (markersLayer) {
    map.removeLayer(markersLayer);
    markersLayer = null;
  }

  const points = clusterPoints.value;
  if (!points.length) return;

  // L.heatLayer expects [[lat, lng, intensity], ...]. Intensity is the
  // bucket's record count; the layer normalizes against `max` internally.
  const heatData = points.map(p => [p.lat, p.lng, p.count]);

  // radius/blur scale with zoom (heatRadiusForZoom); max is the in-view peak
  // (visibleMax) so local density stays visible after zooming past a hotspot.
  // No explicit maxZoom, so intensity scales across the map's full zoom range
  // instead of capping at 12 (which made high zooms look flat/empty).
  const r = heatRadiusForZoom(map.getZoom());
  markersLayer = L.heatLayer(heatData, {
    radius: r,
    blur: Math.round(r * 1.2),
    max: visibleMax(),
    minOpacity: 0.35,
    gradient: {
      0.2: '#1a9850',
      0.4: '#91cf60',
      0.6: '#fee08b',
      0.8: '#fc8d59',
      1.0: '#d73027',
    },
  });
  markersLayer.addTo(map);
};

// ---- Individual points mode (#19) -------------------------------------------

const clearHeat = () => {
  if (markersLayer) { map.removeLayer(markersLayer); markersLayer = null; }
};

const clearPoints = () => {
  if (pointsLayer) { map.removeLayer(pointsLayer); pointsLayer = null; }
  pointsShown.value = 0;
  pointsCapped.value = false;
};

const renderPoints = (points, capped) => {
  if (!map || !L) return;
  clearPoints();
  pointsLayer = L.layerGroup();
  for (const p of points) {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 4, weight: 1, color: '#c0392b', fillColor: '#e74c3c', fillOpacity: 0.7,
    });
    const name = p.scientificName || '(no name)';
    marker.bindPopup(
      `<div style="font-size:12px;line-height:1.6;">`
      + `<strong>${name}</strong><br/>`
      + `${(p.institutionCode || '')} ${(p.catalogNumber || '')}<br/>`
      + `${(p.country || '')}<br/>`
      + `<span style="color:#888;">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</span>`
      + `</div>`
    );
    marker.addTo(pointsLayer);
  }
  pointsLayer.addTo(map);
  pointsShown.value = points.length;
  pointsCapped.value = capped;
};

const fetchPoints = async () => {
  if (!map) return;
  const b = map.getBounds();
  const bbox = {
    min_lat: b.getSouth(), max_lat: b.getNorth(),
    min_lon: b.getWest(), max_lon: b.getEast(),
  };
  pointsLoading.value = true;
  try {
    const resp = await api.post('/map_points', {
      ...(props.searchPayload || {}),
      bbox,
      limit: 2000,
    });
    renderPoints(resp.points || [], !!resp.capped);
  } catch (e) {
    console.error('Failed to load map points:', e);
  } finally {
    pointsLoading.value = false;
  }
};

// Switch heatmap <-> individual points by zoom, and refresh on pan/zoom.
const updateView = () => {
  if (!map || !L) return;
  const zoom = map.getZoom();
  if (zoom >= SINGLE_POINT_ZOOM) {
    if (!pointMode.value) {
      pointMode.value = true;
      clearHeat();
    }
    if (pointsDebounce) clearTimeout(pointsDebounce);
    pointsDebounce = setTimeout(fetchPoints, 300);
  } else {
    if (pointMode.value) {
      pointMode.value = false;
      clearPoints();
    }
    if (!markersLayer) updateMarkers();
    else updateHeatView();
  }
};

const handleResize = () => {
  if (map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
};

watch(() => props.points, () => {
  fitToResults();   // recentre/zoom onto the new results first
  updateView();     // then render heat/points for that zoom
}, { deep: true });

// Redraw the drainage highlight whenever the active drainage filter changes.
watch(() => props.drainages, () => {
  updateDrainageHighlight();
}, { deep: true });

// When the search/filters change, refresh the individual points (if in point
// mode) so the map matches the table (e.g. shape ∩ drainage), not a stale set.
watch(() => props.searchPayload, () => {
  if (pointMode.value) {
    if (pointsDebounce) clearTimeout(pointsDebounce);
    pointsDebounce = setTimeout(fetchPoints, 300);
  }
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
    setTimeout(() => {
      map.invalidateSize();
      // Now that the map is sized/visible, recentre on the results and redraw the
      // drainage boundary — covers filters applied while this tab was hidden.
      fitToResults();
      updateView();
      updateDrainageHighlight();
    }, 50);
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

.title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.data-basis {
  font-size: 11px;
  color: #888;
  margin: 0;
  font-style: italic;
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

.drainage-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  user-select: none;
}

.drainage-toggle input {
  cursor: pointer;
  margin: 0;
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

.point-mode-hint {
  font-size: 12px;
  color: #c0392b;
  padding: 8px 12px;
  background: #fdf3f2;
  border: 1px solid #f5c6c0;
  border-radius: 4px;
  margin-bottom: 15px;
}

.zoom-guide {
  font-size: 12px;
  color: #3498db;
  padding: 8px 12px;
  background: #f0f7ff;
  border: 1px solid #cfe6ff;
  border-radius: 4px;
  margin-bottom: 15px;
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
