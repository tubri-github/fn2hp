<!-- ContinentalChart.vue (饼图的特化版本) -->
<template>
  <div class="continental-chart">
    <PieChart
        :data="continentalData"
        :title="title"
        :height="height"
        @segment-clicked="onContinentSelected"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PieChart from './PieChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: 'Continental Distribution' },
  height: { type: Number, default: 300 }
})

const emit = defineEmits(['continentSelected'])

const continentalData = computed(() => {
  return props.data.map(continent => ({
    name: continent.name,
    value: continent.records || continent.value,
    records: continent.records,
    percentage: continent.percentage
  }))
})

const onContinentSelected = (continent) => {
  emit('continentSelected', continent)
}
</script>

<!-- CountryChart.vue (水平条形图) -->
<template>
  <div class="country-chart">
    <div class="chart-header">
      <h4>{{ title }}</h4>
    </div>

    <div class="chart-container" :style="{ height: height + 'px' }">
      <div class="horizontal-bars">
        <div
            v-for="(country, index) in chartData"
            :key="country.country"
            class="country-bar"
        >
          <div class="country-label">{{ country.country }}</div>
          <div class="bar-track">
            <div
                class="bar-fill"
                :style="{
                width: getBarWidth(country.records) + '%',
                backgroundColor: getBarColor(index)
              }"
                @mouseenter="showTooltip($event, country)"
                @mouseleave="hideTooltip"
            ></div>
          </div>
          <div class="country-value">{{ formatNumber(country.records) }}</div>
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
        <div>Records: {{ formatNumber(tooltip.records) }}</div>
        <div v-if="tooltip.species">Species: {{ formatNumber(tooltip.species) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: 'Top Countries' },
  height: { type: Number, default: 400 }
})

const tooltip = ref({ show: false, x: 0, y: 0, title: '', records: 0, species: 0 })

const chartData = computed(() => {
  return props.data
      .filter(country => country.records > 0)
      .sort((a, b) => b.records - a.records)
      .slice(0, 15)
})

const maxRecords = computed(() => {
  return Math.max(...chartData.value.map(c => c.records), 0)
})

const getBarWidth = (records) => {
  return maxRecords.value > 0 ? (records / maxRecords.value) * 100 : 0
}

const getBarColor = (index) => {
  const intensity = 1 - (index * 0.05)
  return `rgba(52, 152, 219, ${Math.max(intensity, 0.3)})`
}

const showTooltip = (event, country) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const container = event.currentTarget.closest('.country-chart').getBoundingClientRect()

  tooltip.value = {
    show: true,
    x: rect.left - container.left + rect.width / 2,
    y: rect.top - container.top - 10,
    title: country.country,
    records: country.records,
    species: country.species || 0
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const formatNumber = (num) => {
  return num.toLocaleString()
}
</script>

<style scoped>
.country-chart {
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  padding: 15px;
  overflow-y: auto;
}

.horizontal-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.country-bar {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.country-label {
  font-weight: 500;
  color: #2c3e50;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  height: 20px;
  background: #f1f2f6;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
  cursor: pointer;
}

.bar-fill:hover {
  opacity: 0.8;
}

.country-value {
  font-weight: bold;
  color: #666;
  text-align: right;
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
  transform: translateX(-50%);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .country-bar {
    grid-template-columns: 80px 1fr 60px;
    gap: 5px;
  }

  .country-label {
    font-size: 10px;
  }
}
</style>