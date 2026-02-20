<template>
  <div class="timeline-chart">
    <div class="chart-header">
      <h4>{{ title }}</h4>
      <p class="chart-subtitle">{{ subtitle }}</p>
      <div class="chart-controls">
        <select v-model="timeRange" class="time-range-select">
          <option value="all">All Years</option>
          <option value="recent">Last 20 Years</option>
          <option value="modern">1990-Present</option>
          <option value="historical">Pre-1990</option>
        </select>
        <select v-model="chartStyle" class="chart-style-select">
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-wrapper">
        <!-- Y轴 -->
        <div class="y-axis">
          <div v-for="tick in yAxisTicks" :key="tick" class="y-tick">
            {{ formatNumber(tick) }}
          </div>
        </div>

        <!-- 主图表区域 -->
        <div class="chart-area">
          <svg
              :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
              class="timeline-svg"
              @mousemove="handleMouseMove"
              @mouseleave="hideTooltip"
          >
            <!-- 网格线 -->
            <g class="grid">
              <!-- 水平网格线 -->
              <line
                  v-for="tick in yAxisTicks"
                  :key="`h-${tick}`"
                  :x1="0"
                  :y1="getYPosition(tick)"
                  :x2="chartWidth"
                  :y2="getYPosition(tick)"
                  stroke="#f0f0f0"
                  stroke-width="1"
              />
              <!-- 垂直网格线 -->
              <line
                  v-for="(point, index) in displayData"
                  :key="`v-${point.year}`"
                  v-if="index % Math.ceil(displayData.length / 10) === 0"
                  :x1="getXPosition(point.year)"
                  :y1="0"
                  :x2="getXPosition(point.year)"
                  :y2="chartHeight"
                  stroke="#f0f0f0"
                  stroke-width="1"
              />
            </g>

            <!-- 面积图 -->
            <path
                v-if="chartStyle === 'area'"
                :d="areaPath"
                fill="url(#areaGradient)"
                stroke="#3498db"
                stroke-width="2"
            />

            <!-- 线图 -->
            <path
                v-if="chartStyle === 'line' || chartStyle === 'area'"
                :d="linePath"
                fill="none"
                stroke="#3498db"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- 条形图 -->
            <g v-if="chartStyle === 'bar'">
              <rect
                  v-for="point in displayData"
                  :key="`bar-${point.year}`"
                  :x="getXPosition(point.year) - barWidth / 2"
                  :y="getYPosition(point.records)"
                  :width="barWidth"
                  :height="chartHeight - getYPosition(point.records)"
                  fill="#3498db"
                  :opacity="0.7"
                  class="bar-rect"
                  @mouseenter="showTooltip($event, point)"
              />
            </g>

            <!-- 数据点 -->
            <g v-if="chartStyle === 'line' || chartStyle === 'area'">
              <circle
                  v-for="point in displayData"
                  :key="`point-${point.year}`"
                  :cx="getXPosition(point.year)"
                  :cy="getYPosition(point.records)"
                  :r="4"
                  fill="#3498db"
                  stroke="white"
                  stroke-width="2"
                  class="data-point"
                  @mouseenter="showTooltip($event, point)"
              />
            </g>

            <!-- 渐变定义 -->
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3498db;stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:#3498db;stop-opacity:0.1" />
              </linearGradient>
            </defs>
          </svg>

          <!-- X轴标签 -->
          <div class="x-axis">
            <div
                v-for="(point, index) in displayData"
                :key="`x-${point.year}`"
                v-if="index % Math.ceil(displayData.length / 8) === 0"
                class="x-tick"
                :style="{ left: getXPosition(point.year) + 'px' }"
            >
              {{ point.year }}
            </div>
          </div>
        </div>
      </div>

      <!-- 工具提示 -->
      <div
          v-if="tooltip.show"
          class="chart-tooltip"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-title">{{ tooltip.year }}</div>
        <div class="tooltip-content">
          <div>Records: {{ formatNumber(tooltip.records) }}</div>
          <div v-if="tooltip.trend">Trend: {{ tooltip.trend }}</div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="chart-stats">
      <div class="stat-item">
        <span class="stat-label">Total Years:</span>
        <span class="stat-value">{{ yearSpan }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Year:</span>
        <span class="stat-value">{{ peakYear?.year || 'N/A' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Peak Records:</span>
        <span class="stat-value">{{ formatNumber(peakYear?.records || 0) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Average/Year:</span>
        <span class="stat-value">{{ formatNumber(averagePerYear) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Recent Trend:</span>
        <span class="stat-value" :class="trendClass">{{ trendDirection }}</span>
      </div>
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
    default: 'Collection Timeline'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['yearSelected', 'periodSelected'])

// 本地状态
const timeRange = ref('all')
const chartStyle = ref('bar')
const chartWidth = 800
const chartHeight = 300
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  year: '',
  records: 0,
  trend: ''
})

// 计算属性
const displayData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  let filtered = [...props.data].sort((a, b) => a.year - b.year)

  switch (timeRange.value) {
    case 'recent':
      filtered = filtered.filter(d => d.year >= new Date().getFullYear() - 20)
      break
    case 'modern':
      filtered = filtered.filter(d => d.year >= 1990)
      break
    case 'historical':
      filtered = filtered.filter(d => d.year < 1990)
      break
  }

  return filtered
})

const yearSpan = computed(() => {
  if (displayData.value.length === 0) return 0
  const years = displayData.value.map(d => d.year)
  return Math.max(...years) - Math.min(...years) + 1
})

const maxRecords = computed(() => {
  return Math.max(...displayData.value.map(d => d.records), 0)
})

const minYear = computed(() => {
  return Math.min(...displayData.value.map(d => d.year))
})

const maxYear = computed(() => {
  return Math.max(...displayData.value.map(d => d.year))
})

const yAxisTicks = computed(() => {
  if (maxRecords.value === 0) return [0]

  const max = maxRecords.value
  const tickCount = 6
  const step = Math.ceil(max / tickCount / Math.pow(10, Math.floor(Math.log10(max / tickCount)))) * Math.pow(10, Math.floor(Math.log10(max / tickCount)))

  const ticks = []
  for (let i = 0; i <= max; i += step) {
    ticks.push(i)
  }

  return ticks.slice(0, tickCount)
})

const barWidth = computed(() => {
  if (displayData.value.length < 2) return 20

  // 计算相邻年份之间的最小间距（像素）
  const yearGaps = []
  for (let i = 1; i < displayData.value.length; i++) {
    const year1 = displayData.value[i - 1].year
    const year2 = displayData.value[i].year
    const pixelGap = getXPosition(year2) - getXPosition(year1)
    yearGaps.push(pixelGap)
  }

  const minGap = Math.min(...yearGaps)
  // bar 宽度为最小间距的 80%，留 20% 作为间隔
  return Math.max(minGap * 0.8, 2)
})

const linePath = computed(() => {
  if (displayData.value.length === 0) return ''

  return displayData.value
      .map((point, index) => {
        const x = getXPosition(point.year)
        const y = getYPosition(point.records)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
})

const areaPath = computed(() => {
  if (displayData.value.length === 0) return ''

  const line = linePath.value
  const firstPoint = displayData.value[0]
  const lastPoint = displayData.value[displayData.value.length - 1]

  return `${line} L ${getXPosition(lastPoint.year)} ${chartHeight} L ${getXPosition(firstPoint.year)} ${chartHeight} Z`
})

const peakYear = computed(() => {
  return displayData.value.reduce((peak, current) =>
      current.records > (peak?.records || 0) ? current : peak, null)
})

const averagePerYear = computed(() => {
  if (displayData.value.length === 0) return 0
  const total = displayData.value.reduce((sum, d) => sum + d.records, 0)
  return Math.round(total / displayData.value.length)
})

const trendDirection = computed(() => {
  if (displayData.value.length < 2) return 'N/A'

  const recent = displayData.value.slice(-5) // 最近5年
  const older = displayData.value.slice(-10, -5) // 之前5年

  if (recent.length === 0 || older.length === 0) return 'N/A'

  const recentAvg = recent.reduce((sum, d) => sum + d.records, 0) / recent.length
  const olderAvg = older.reduce((sum, d) => sum + d.records, 0) / older.length

  const change = ((recentAvg - olderAvg) / olderAvg) * 100

  if (change > 10) return '↗ Increasing'
  if (change < -10) return '↘ Decreasing'
  return '→ Stable'
})

const trendClass = computed(() => {
  if (trendDirection.value.includes('Increasing')) return 'trend-up'
  if (trendDirection.value.includes('Decreasing')) return 'trend-down'
  return 'trend-stable'
})

const highlights = computed(() => {
  if (displayData.value.length < 10) return []

  const highlights = []

  // 找到收集高峰期
  const peaks = findPeaks(displayData.value)
  peaks.forEach(peak => {
    highlights.push({
      period: `${peak.year}`,
      description: `Peak collection year with ${formatNumber(peak.records)} records`
    })
  })

  // 找到增长期
  const growthPeriods = findGrowthPeriods(displayData.value)
  growthPeriods.forEach(period => {
    highlights.push({
      period: period.period,
      description: period.description
    })
  })

  return highlights.slice(0, 3) // 只显示前3个亮点
})

// 方法
const getXPosition = (year) => {
  if (maxYear.value === minYear.value) return chartWidth / 2
  return ((year - minYear.value) / (maxYear.value - minYear.value)) * chartWidth
}

const getYPosition = (records) => {
  if (maxRecords.value === 0) return chartHeight
  return chartHeight - (records / maxRecords.value) * chartHeight
}

const showTooltip = (event, point) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const container = event.currentTarget.closest('.timeline-chart').getBoundingClientRect()

  // 计算趋势
  const index = displayData.value.findIndex(d => d.year === point.year)
  let trend = ''
  if (index > 0) {
    const prev = displayData.value[index - 1]
    const change = point.records - prev.records
    if (change > 0) trend = `+${formatNumber(change)} from ${prev.year}`
    else if (change < 0) trend = `${formatNumber(change)} from ${prev.year}`
    else trend = 'No change from previous year'
  }

  tooltip.value = {
    show: true,
    x: rect.left - container.left,
    y: rect.top - container.top - 10,
    year: point.year,
    records: point.records,
    trend
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const handleMouseMove = (event) => {
  // 鼠标移动时的处理逻辑
}

const findPeaks = (data) => {
  const peaks = []
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i].records > data[i-1].records && data[i].records > data[i+1].records) {
      peaks.push(data[i])
    }
  }
  return peaks.sort((a, b) => b.records - a.records).slice(0, 2)
}

const findGrowthPeriods = (data) => {
  const periods = []
  let growthStart = null

  for (let i = 1; i < data.length; i++) {
    const isGrowing = data[i].records > data[i-1].records * 1.2 // 20%增长

    if (isGrowing && !growthStart) {
      growthStart = i - 1
    } else if (!isGrowing && growthStart !== null) {
      if (i - growthStart >= 3) { // 至少3年的增长期
        const startYear = data[growthStart].year
        const endYear = data[i-1].year
        const growth = ((data[i-1].records - data[growthStart].records) / data[growthStart].records * 100).toFixed(0)

        periods.push({
          period: `${startYear}-${endYear}`,
          description: `Strong growth period (+${growth}%)`
        })
      }
      growthStart = null
    }
  }

  return periods
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

onMounted(() => {
  // 组件初始化
})
</script>

<style scoped>
.timeline-chart {
  width: 100%;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.chart-subtitle {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.time-range-select,
.chart-style-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.chart-container {
  position: relative;
  margin-bottom: 20px;
}

.chart-wrapper {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.y-axis {
  width: 60px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  padding: 20px 10px;
  border-right: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.y-tick {
  font-size: 11px;
  color: #666;
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
}

.timeline-svg {
  width: 100%;
  height: 300px;
  display: block;
}

.data-point,
.bar-rect {
  cursor: pointer;
  transition: opacity 0.2s;
}

.data-point:hover,
.bar-rect:hover {
  opacity: 0.8;
}

.x-axis {
  position: relative;
  height: 30px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.x-tick {
  position: absolute;
  font-size: 11px;
  color: #666;
  transform: translateX(-50%);
  padding: 5px;
}

.chart-tooltip {
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

.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.trend-up {
  color: #27ae60;
}

.trend-down {
  color: #e74c3c;
}

.trend-stable {
  color: #f39c12;
}

.period-highlights {
  margin-top: 20px;
}

.period-highlights h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item {
  padding: 10px;
  background: #e8f4fd;
  border-radius: 6px;
}

.highlight-period {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.highlight-description {
  font-size: 13px;
  color: #666;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-controls {
    justify-content: space-between;
  }

  .chart-wrapper {
    flex-direction: column;
  }

  .y-axis {
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: space-between;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>