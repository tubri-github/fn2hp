<template>
  <div class="diversity-chart">
    <div class="chart-header">
      <h4>{{ title }}</h4>
      <div class="chart-controls">
        <select v-model="chartType" class="chart-type-select">
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="treemap">Tree Map</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <!-- 条形图 -->
      <div v-if="chartType === 'bar'" class="bar-chart">
        <div class="chart-axis">
          <div class="y-axis">
            <div v-for="tick in yAxisTicks" :key="tick" class="y-tick">
              {{ formatNumber(tick) }}
            </div>
          </div>
          <div class="chart-plot">
            <div
                v-for="(item, index) in chartData"
                :key="item.name"
                class="bar-item"
                :style="{ height: getBarHeight(item.value) + '%' }"
                @mouseenter="showTooltip($event, item)"
                @mouseleave="hideTooltip"
            >
              <div class="bar" :style="{ backgroundColor: getBarColor(index) }"></div>
              <div class="bar-label">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 饼图 -->
      <div v-if="chartType === 'pie'" class="pie-chart">
        <svg viewBox="0 0 400 400" class="pie-svg">
          <g transform="translate(200,200)">
            <path
                v-for="(segment, index) in pieSegments"
                :key="index"
                :d="segment.path"
                :fill="getBarColor(index)"
                :stroke="'white'"
                :stroke-width="2"
                class="pie-segment"
                @mouseenter="showTooltip($event, segment.data)"
                @mouseleave="hideTooltip"
            />
          </g>
        </svg>
        <div class="pie-legend">
          <div
              v-for="(item, index) in chartData.slice(0, 8)"
              :key="item.name"
              class="legend-item"
          >
            <div
                class="legend-color"
                :style="{ backgroundColor: getBarColor(index) }"
            ></div>
            <span class="legend-text">{{ item.name }} ({{ item.value }})</span>
          </div>
        </div>
      </div>

      <!-- 树状图 -->
      <div v-if="chartType === 'treemap'" class="treemap-chart">
        <div class="treemap-container">
          <div
              v-for="(item, index) in treemapData"
              :key="item.name"
              class="treemap-cell"
              :style="{
              width: item.width + '%',
              height: item.height + '%',
              backgroundColor: getBarColor(index),
              opacity: 0.8
            }"
              @mouseenter="showTooltip($event, item)"
              @mouseleave="hideTooltip"
          >
            <div class="treemap-label">
              <div class="treemap-name">{{ item.name }}</div>
              <div class="treemap-value">{{ formatNumber(item.value) }}</div>
            </div>
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
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-content">
        <div>{{ type === 'genera' ? 'Species' : 'Records' }}: {{ formatNumber(tooltip.value) }}</div>
        <div v-if="tooltip.records">Total Records: {{ formatNumber(tooltip.records) }}</div>
        <div v-if="tooltip.percentage">Percentage: {{ tooltip.percentage }}%</div>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="chart-summary">
      <div class="summary-item">
        <span class="summary-label">Total {{ type }}:</span>
        <span class="summary-value">{{ chartData.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Top contributor:</span>
        <span class="summary-value">{{ topContributor?.name || 'N/A' }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Diversity index:</span>
        <span class="summary-value">{{ diversityIndex }}</span>
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
  type: {
    type: String,
    default: 'genera' // 'genera' or 'species'
  },
  title: {
    type: String,
    default: 'Diversity Distribution'
  }
})

const emit = defineEmits(['itemSelected'])

// 本地状态
const chartType = ref('bar')
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  title: '',
  value: 0,
  records: 0,
  percentage: 0
})

// 计算属性
const chartData = computed(() => {
  return props.data
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15) // 只显示前15个
})

const maxValue = computed(() => {
  return Math.max(...chartData.value.map(item => item.value))
})

const totalValue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0)
})

const yAxisTicks = computed(() => {
  if (maxValue.value === 0) return [0]

  const max = maxValue.value
  const step = Math.pow(10, Math.floor(Math.log10(max))) / 2
  const ticks = []

  for (let i = 0; i <= max; i += step) {
    ticks.push(i)
  }

  return ticks.slice(0, 6) // 最多6个刻度
})

const pieSegments = computed(() => {
  const segments = []
  let currentAngle = -Math.PI / 2 // 从顶部开始
  const radius = 150

  chartData.value.forEach((item, index) => {
    const percentage = item.value / totalValue.value
    const angle = percentage * 2 * Math.PI
    const endAngle = currentAngle + angle

    const x1 = Math.cos(currentAngle) * radius
    const y1 = Math.sin(currentAngle) * radius
    const x2 = Math.cos(endAngle) * radius
    const y2 = Math.sin(endAngle) * radius

    const largeArcFlag = angle > Math.PI ? 1 : 0

    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ')

    segments.push({
      path,
      data: {
        ...item,
        percentage: Math.round(percentage * 100)
      }
    })

    currentAngle = endAngle
  })

  return segments
})

const treemapData = computed(() => {
  if (chartData.value.length === 0) return []

  // 简化的树状图布局算法
  const data = [...chartData.value]
  const total = totalValue.value

  let x = 0, y = 0
  const result = []

  data.forEach((item, index) => {
    const percentage = item.value / total
    const width = Math.sqrt(percentage) * 100
    const height = Math.sqrt(percentage) * 100

    if (x + width > 100) {
      x = 0
      y += height
    }

    result.push({
      ...item,
      x,
      y,
      width: Math.min(width, 100 - x),
      height: Math.min(height, 100 - y),
      percentage: Math.round(percentage * 100)
    })

    x += width
  })

  return result
})

const topContributor = computed(() => {
  return chartData.value.length > 0 ? chartData.value[0] : null
})

const diversityIndex = computed(() => {
  // 计算Shannon多样性指数
  if (chartData.value.length === 0) return '0.00'

  const total = totalValue.value
  let shannonIndex = 0

  chartData.value.forEach(item => {
    const p = item.value / total
    if (p > 0) {
      shannonIndex -= p * Math.log(p)
    }
  })

  return shannonIndex.toFixed(2)
})

// 方法
const getBarHeight = (value) => {
  return maxValue.value > 0 ? (value / maxValue.value) * 100 : 0
}

const getBarColor = (index) => {
  const colors = [
    '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd',
    '#388e3c', '#66bb6a', '#a5d6a7', '#e8f5e8',
    '#f57c00', '#ffb74d', '#ffcc02', '#fff3e0',
    '#d32f2f', '#f44336', '#ffcdd2', '#ffebee'
  ]
  return colors[index % colors.length]
}

const showTooltip = (event, item) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const container = event.currentTarget.closest('.diversity-chart').getBoundingClientRect()

  tooltip.value = {
    show: true,
    x: rect.left - container.left + rect.width / 2,
    y: rect.top - container.top - 10,
    title: item.name,
    value: item.value,
    records: item.records || 0,
    percentage: item.percentage || Math.round((item.value / totalValue.value) * 100)
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const selectItem = (item) => {
  emit('itemSelected', item)
}

onMounted(() => {
  // 组件初始化
})
</script>

<style scoped>
.diversity-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.chart-type-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* 条形图样式 */
.bar-chart {
  height: 100%;
}

.chart-axis {
  display: flex;
  height: 100%;
}

.y-axis {
  width: 50px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  padding: 10px 5px;
  border-right: 1px solid #e0e0e0;
}

.y-tick {
  font-size: 10px;
  color: #666;
  text-align: right;
}

.chart-plot {
  flex: 1;
  display: flex;
  align-items: end;
  padding: 10px;
  gap: 4px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  min-height: 20px;
}

.bar {
  width: 100%;
  min-height: 5px;
  border-radius: 2px 2px 0 0;
  transition: opacity 0.2s;
}

.bar-item:hover .bar {
  opacity: 0.8;
}

.bar-label {
  font-size: 10px;
  color: #666;
  text-align: center;
  margin-top: 5px;
  transform: rotate(-45deg);
  transform-origin: center;
  white-space: nowrap;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 饼图样式 */
.pie-chart {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

.pie-svg {
  width: 250px;
  height: 250px;
}

.pie-segment {
  cursor: pointer;
  transition: opacity 0.2s;
}

.pie-segment:hover {
  opacity: 0.8;
}

.pie-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-text {
  color: #333;
}

/* 树状图样式 */
.treemap-chart {
  height: 100%;
}

.treemap-container {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.treemap-cell {
  position: absolute;
  border: 1px solid white;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.treemap-cell:hover {
  opacity: 1 !important;
}

.treemap-label {
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  padding: 4px;
}

.treemap-name {
  font-size: 12px;
  margin-bottom: 2px;
}

.treemap-value {
  font-size: 10px;
}

/* 工具提示 */
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
  transform: translateX(-50%);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.tooltip-content div {
  margin: 2px 0;
}

/* 统计摘要 */
.chart-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  color: #666;
  margin-bottom: 2px;
}

.summary-value {
  display: block;
  font-weight: bold;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .pie-chart {
    flex-direction: column;
    gap: 15px;
  }

  .pie-svg {
    width: 200px;
    height: 200px;
  }

  .chart-summary {
    flex-direction: column;
    gap: 8px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
  }

  .summary-label {
    display: inline;
  }

  .summary-value {
    display: inline;
  }
}
</style>