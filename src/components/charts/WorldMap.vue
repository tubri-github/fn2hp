<template>
  <div class="world-map">
    <div class="map-header">
      <h4>{{ title }}</h4>
      <p class="map-subtitle">{{ subtitle }}</p>
    </div>

    <div class="map-content">
      <!-- 使用 SVG 创建简化的世界地图 -->
      <svg
          viewBox="0 0 1000 500"
          class="world-map-svg"
          @mouseleave="hideTooltip"
      >
        <!-- 背景 -->
        <rect width="1000" height="500" fill="#f8f9fa" />

        <!-- 简化的世界地图路径 -->
        <g class="countries">
          <!-- 北美洲 -->
          <path
              d="M 50 100 L 300 100 L 320 150 L 280 200 L 200 180 L 150 220 L 80 200 Z"
              :fill="getCountryColor('North America')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('North America') }"
              @mouseenter="showTooltip($event, 'North America')"
              @click="selectRegion('North America')"
          />

          <!-- 南美洲 -->
          <path
              d="M 200 250 L 280 240 L 300 300 L 320 400 L 280 450 L 240 440 L 220 380 L 180 320 Z"
              :fill="getCountryColor('South America')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('South America') }"
              @mouseenter="showTooltip($event, 'South America')"
              @click="selectRegion('South America')"
          />

          <!-- 欧洲 -->
          <path
              d="M 450 80 L 550 90 L 580 120 L 560 160 L 520 170 L 480 150 L 460 120 Z"
              :fill="getCountryColor('Europe')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('Europe') }"
              @mouseenter="showTooltip($event, 'Europe')"
              @click="selectRegion('Europe')"
          />

          <!-- 非洲 -->
          <path
              d="M 480 180 L 580 180 L 600 220 L 620 300 L 600 380 L 550 400 L 500 390 L 470 350 L 460 280 L 470 220 Z"
              :fill="getCountryColor('Africa')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('Africa') }"
              @mouseenter="showTooltip($event, 'Africa')"
              @click="selectRegion('Africa')"
          />

          <!-- 亚洲 -->
          <path
              d="M 600 80 L 800 90 L 850 140 L 880 200 L 860 250 L 820 280 L 750 270 L 680 220 L 650 180 L 620 140 Z"
              :fill="getCountryColor('Asia-Pacific')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('Asia-Pacific') }"
              @mouseenter="showTooltip($event, 'Asia-Pacific')"
              @click="selectRegion('Asia-Pacific')"
          />

          <!-- 大洋洲 -->
          <path
              d="M 780 320 L 850 330 L 870 360 L 860 380 L 820 390 L 790 380 L 770 350 Z"
              :fill="getCountryColor('Oceania')"
              :class="{ 'country-path': true, 'has-data': hasDataForRegion('Oceania') }"
              @mouseenter="showTooltip($event, 'Oceania')"
              @click="selectRegion('Oceania')"
          />
        </g>

        <!-- 记录点标记 -->
        <g class="record-points" v-if="showPoints">
          <circle
              v-for="(point, index) in recordPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              :r="getPointSize(point.records)"
              :fill="getPointColor(point.records)"
              :opacity="0.7"
              @mouseenter="showPointTooltip($event, point)"
          />
        </g>
      </svg>

      <!-- 工具提示 -->
      <div
          v-if="tooltip.show"
          class="map-tooltip"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-title">{{ tooltip.title }}</div>
        <div class="tooltip-content">
          <div v-if="tooltip.records">Records: {{ formatNumber(tooltip.records) }}</div>
          <div v-if="tooltip.species">Species: {{ formatNumber(tooltip.species) }}</div>
          <div v-if="tooltip.percentage">Percentage: {{ tooltip.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="map-legend">
      <div class="legend-title">Record Distribution</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color" style="background: #e3f2fd;"></div>
          <span>Low (< 1,000)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #90caf9;"></div>
          <span>Medium (1,000 - 10,000)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #42a5f5;"></div>
          <span>High (10,000 - 50,000)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #1976d2;"></div>
          <span>Very High (> 50,000)</span>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="map-controls">
      <label class="control-item">
        <input type="checkbox" v-model="showPoints" />
        Show individual records
      </label>
      <select v-model="mapMode" class="map-mode-select">
        <option value="records">By Record Count</option>
        <option value="species">By Species Count</option>
        <option value="quality">By Data Quality</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Global Distribution'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['regionSelected', 'countrySelected'])

// 本地状态
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  title: '',
  records: 0,
  species: 0,
  percentage: 0
})

const showPoints = ref(false)
const mapMode = ref('records')
const selectedRegion = ref(null)

// 区域数据映射
const regionData = computed(() => {
  const regions = {
    'North America': { records: 0, species: 0, countries: [] },
    'South America': { records: 0, species: 0, countries: [] },
    'Europe': { records: 0, species: 0, countries: [] },
    'Africa': { records: 0, species: 0, countries: [] },
    'Asia-Pacific': { records: 0, species: 0, countries: [] },
    'Oceania': { records: 0, species: 0, countries: [] }
  }

  // 根据国家映射到区域
  props.data.forEach(country => {
    const region = mapCountryToRegion(country.country)
    if (regions[region]) {
      regions[region].records += country.value || 0
      regions[region].species += country.species || 0
      regions[region].countries.push(country.country)
    }
  })

  return regions
})

// 记录点数据（模拟）
const recordPoints = computed(() => {
  if (!showPoints.value) return []

  // 根据数据生成模拟的记录点
  const points = []
  props.data.forEach((country, index) => {
    if (country.value > 100) { // 只显示有足够记录的点
      points.push({
        x: 100 + (index * 150) % 800,
        y: 150 + (index * 50) % 200,
        records: country.value,
        country: country.country
      })
    }
  })

  return points
})

// 方法
const mapCountryToRegion = (country) => {
  const regionMapping = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Chile': 'South America',
    'Germany': 'Europe',
    'France': 'Europe',
    'United Kingdom': 'Europe',
    'Spain': 'Europe',
    'Italy': 'Europe',
    'China': 'Asia-Pacific',
    'Japan': 'Asia-Pacific',
    'India': 'Asia-Pacific',
    'Australia': 'Oceania',
    'New Zealand': 'Oceania',
    'South Africa': 'Africa',
    'Egypt': 'Africa',
    'Kenya': 'Africa'
  }

  return regionMapping[country] || 'Other'
}

const getCountryColor = (region) => {
  const data = regionData.value[region]
  if (!data || data.records === 0) return '#f5f5f5'

  const value = mapMode.value === 'records' ? data.records :
      mapMode.value === 'species' ? data.species :
          data.records / 1000 // 简化的质量指标

  if (value > 50000) return '#1976d2'
  if (value > 10000) return '#42a5f5'
  if (value > 1000) return '#90caf9'
  return '#e3f2fd'
}

const hasDataForRegion = (region) => {
  return regionData.value[region]?.records > 0
}

const getPointSize = (records) => {
  if (records > 10000) return 8
  if (records > 1000) return 6
  if (records > 100) return 4
  return 2
}

const getPointColor = (records) => {
  if (records > 10000) return '#d32f2f'
  if (records > 1000) return '#f57c00'
  if (records > 100) return '#fbc02d'
  return '#689f38'
}

const showTooltip = (event, region) => {
  const data = regionData.value[region]
  const total = Object.values(regionData.value).reduce((sum, r) => sum + r.records, 0)

  tooltip.value = {
    show: true,
    x: event.offsetX + 10,
    y: event.offsetY - 10,
    title: region,
    records: data?.records || 0,
    species: data?.species || 0,
    percentage: total > 0 ? Math.round((data?.records || 0) / total * 100) : 0
  }
}

const showPointTooltip = (event, point) => {
  tooltip.value = {
    show: true,
    x: event.offsetX + 10,
    y: event.offsetY - 10,
    title: point.country,
    records: point.records,
    species: 0,
    percentage: 0
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const selectRegion = (region) => {
  selectedRegion.value = region
  emit('regionSelected', region, regionData.value[region])
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

onMounted(() => {
  // 初始化地图
})
</script>

<style scoped>
.world-map {
  width: 100%;
  height: 100%;
}

.map-header {
  text-align: center;
  margin-bottom: 20px;
}

.map-header h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 18px;
}

.map-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.map-content {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.world-map-svg {
  width: 100%;
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.country-path {
  stroke: #ffffff;
  stroke-width: 1;
  cursor: pointer;
  transition: opacity 0.2s;
}

.country-path:hover {
  opacity: 0.8;
  stroke-width: 2;
}

.country-path.has-data {
  cursor: pointer;
}

.map-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  min-width: 120px;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.tooltip-content div {
  margin: 2px 0;
}

.map-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.legend-title {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 10px;
}

.legend-items {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.map-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.map-mode-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .world-map-svg {
    height: 300px;
  }

  .map-legend {
    flex-direction: column;
    gap: 10px;
  }

  .legend-items {
    justify-content: center;
  }

  .map-controls {
    flex-direction: column;
    gap: 10px;
  }
}
</style>