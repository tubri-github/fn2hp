<!-- PieChart.vue -->
<template>
  <div class="pie-chart">
    <div class="chart-header" v-if="title">
      <h4>{{ title }}</h4>
    </div>

    <div class="chart-container" :style="{ height: height + 'px' }">
      <div class="chart-content">
        <svg :viewBox="`0 0 ${svgSize} ${svgSize}`" class="pie-svg">
          <g :transform="`translate(${svgSize/2},${svgSize/2})`">
            <path
                v-for="(segment, index) in pieSegments"
                :key="index"
                :d="segment.path"
                :fill="getSegmentColor(index)"
                stroke="white"
                stroke-width="2"
                class="pie-segment"
                @mouseenter="showTooltip($event, segment.data)"
                @mouseleave="hideTooltip"
            />
            <text
                v-for="(segment, index) in pieSegments"
                :key="`label-${index}`"
                :x="segment.labelX"
                :y="segment.labelY"
                class="segment-label"
                v-if="segment.data.percentage > 5"
            >
              {{ segment.data.percentage }}%
            </text>
          </g>
        </svg>

        <div class="pie-legend">
          <div
              v-for="(item, index) in chartData.slice(0, 6)"
              :key="item.name"
              class="legend-item"
          >
            <div
                class="legend-color"
                :style="{ backgroundColor: getSegmentColor(index) }"
            ></div>
            <span class="legend-text">{{ item.name }}</span>
            <span class="legend-value">{{ item.percentage }}%</span>
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
        <div>Value: {{ formatValue(tooltip.value) }}</div>
        <div>Percentage: {{ tooltip.percentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  height: { type: Number, default: 300 }
})

const tooltip = ref({ show: false, x: 0, y: 0, title: '', value: 0, percentage: 0 })
const svgSize = 250

const chartData = computed(() => {
  const total = props.data.reduce((sum, item) => sum + (item.value || 0), 0)
  return props.data
      .filter(item => (item.value || 0) > 0)
      .map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
})

const pieSegments = computed(() => {
  const segments = []
  let currentAngle = -Math.PI / 2
  const radius = 100

  chartData.value.forEach((item, index) => {
    const angle = (item.percentage / 100) * 2 * Math.PI
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

    // 标签位置
    const labelAngle = currentAngle + angle / 2
    const labelRadius = radius * 0.7
    const labelX = Math.cos(labelAngle) * labelRadius
    const labelY = Math.sin(labelAngle) * labelRadius

    segments.push({
      path,
      labelX,
      labelY,
      data: item
    })

    currentAngle = endAngle
  })

  return segments
})

const getSegmentColor = (index) => {
  const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e']
  return colors[index % colors.length]
}

const showTooltip = (event, item) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const container = event.currentTarget.closest('.pie-chart').getBoundingClientRect()

  tooltip.value = {
    show: true,
    x: rect.left - container.left,
    y: rect.top - container.top - 10,
    title: item.name,
    value: item.value,
    percentage: item.percentage
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const formatValue = (value) => {
  return value.toLocaleString()
}
</script>

<style scoped>
.pie-chart {
  width: 100%;
  position: relative;
}

.chart-header h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  text-align: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-content {
  display: flex;
  align-items: center;
  gap: 20px;
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

.segment-label {
  font-size: 12px;
  font-weight: bold;
  fill: white;
  text-anchor: middle;
  pointer-events: none;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 200px;
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
  flex: 1;
  color: #333;
}

.legend-value {
  font-weight: bold;
  color: #666;
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
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .chart-content {
    flex-direction: column;
    gap: 15px;
  }

  .pie-svg {
    width: 200px;
    height: 200px;
  }
}
</style>