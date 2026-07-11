<template>
  <div class="timeline-section">
    <div class="section-header">
      <div class="title-block">
        <h3 class="section-title">Temporal Distribution</h3>
        <p class="data-basis" v-if="basisText">{{ basisText }}</p>
      </div>
      <div class="section-controls">
        <span class="year-count-hint">({{ chartData.length }} years)</span>
        <select v-model="selectedRange" class="filter-select">
          <option value="all">All Years</option>
          <option value="recent">Last 20 Years</option>
          <option value="modern">1990-Present</option>
          <option value="historic">Pre-1990</option>
        </select>
        <select v-model="chartStyle" class="filter-select">
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <svg :viewBox="`0 0 ${width} ${height}`" class="timeline-svg">
        <!-- Grid lines -->
        <g class="grid">
          <line
            v-for="(tick, i) in yTicks"
            :key="'grid-' + i"
            :x1="padding.left"
            :x2="width - padding.right"
            :y1="yScale(tick)"
            :y2="yScale(tick)"
            class="grid-line"
          />
        </g>

        <!-- Area/Bar chart -->
        <g v-if="chartStyle === 'area'">
          <path :d="areaPath" class="area-fill" />
          <path :d="linePath" class="line-stroke" />
        </g>
        <g v-else class="bars">
          <rect
            v-for="(point, i) in chartData"
            :key="'bar-' + i"
            :x="xScale(point.year) - barWidth/2"
            :y="yScale(point.count)"
            :width="barWidth"
            :height="Math.max(0, height - padding.bottom - yScale(point.count))"
            class="bar"
            @mouseenter="showTooltip($event, point)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- Data points (for area chart, skip if too many points) -->
        <g v-if="chartStyle === 'area' && chartData.length <= 80" class="points">
          <circle
            v-for="(point, i) in chartData"
            :key="'point-' + i"
            :cx="xScale(point.year)"
            :cy="yScale(point.count)"
            :r="chartData.length > 50 ? 2 : 4"
            class="data-point"
            @mouseenter="showTooltip($event, point)"
            @mouseleave="hideTooltip"
          />
        </g>

        <!-- X-axis -->
        <g class="x-axis">
          <line
            :x1="padding.left"
            :x2="width - padding.right"
            :y1="height - padding.bottom"
            :y2="height - padding.bottom"
            class="axis-line"
          />
          <g v-for="(tick, i) in xTicks" :key="'x-' + i">
            <line
              :x1="xScale(tick)"
              :x2="xScale(tick)"
              :y1="height - padding.bottom"
              :y2="height - padding.bottom + 5"
              class="tick-line"
            />
            <text
              :x="xScale(tick)"
              :y="height - padding.bottom + 18"
              class="axis-label"
            >
              {{ tick }}
            </text>
          </g>
        </g>

        <!-- Y-axis -->
        <g class="y-axis">
          <line
            :x1="padding.left"
            :x2="padding.left"
            :y1="padding.top"
            :y2="height - padding.bottom"
            class="axis-line"
          />
          <g v-for="(tick, i) in yTicks" :key="'y-' + i">
            <text
              :x="padding.left - 10"
              :y="yScale(tick) + 4"
              class="axis-label y-label"
            >
              {{ formatNumber(tick) }}
            </text>
          </g>
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltip.visible"
        class="chart-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-year">{{ tooltip.year }}</div>
        <div class="tooltip-count">{{ formatNumber(tooltip.count) }} records</div>
      </div>
    </div>

    <!-- Summary -->
    <div class="timeline-summary">
      <div class="summary-card">
        <div class="summary-label">Time Range</div>
        <div class="summary-value">{{ timeRange }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Peak Year</div>
        <div class="summary-value">{{ peakYear }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Records</div>
        <div class="summary-value">{{ formatNumber(totalRecords) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  // Total records returned by the search query — lets us show what fraction
  // of the search this chart actually represents (records with a parseable
  // YearCollected; older / undated records get dropped).
  searchTotal: {
    type: Number,
    default: 0
  }
});

const selectedRange = ref('all');
const chartStyle = ref('bar');
const width = 800;
const height = 350;
const padding = { top: 30, right: 30, bottom: 50, left: 70 };

// Dynamic bar width based on data count
const barWidth = computed(() => {
  const dataCount = chartData.value.length;
  if (dataCount === 0) return 20;
  const availableWidth = width - padding.left - padding.right;
  // Leave 20% gap between bars
  const calculatedWidth = (availableWidth / dataCount) * 0.8;
  // Min 2px, max 30px
  return Math.max(2, Math.min(30, calculatedWidth));
});

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  year: '',
  count: 0
});

// Fill in missing years with count=0 for continuous timeline
const fillMissingYears = (data) => {
  if (data.length === 0) return data;

  const sorted = [...data].sort((a, b) => a.year - b.year);
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;

  // Create a map of existing data
  const dataMap = new Map(sorted.map(d => [d.year, d.count]));

  // Fill all years
  const filled = [];
  for (let year = minYear; year <= maxYear; year++) {
    filled.push({
      year,
      count: dataMap.get(year) || 0
    });
  }
  return filled;
};

// Generate mock data based on selected range
const chartData = computed(() => {
  if (props.data.length > 0) {
    // Fill missing years for continuous display
    return fillMissingYears(props.data);
  }

  const ranges = {
    all: { start: 1900, end: 2024, step: 5 },
    recent: { start: 2004, end: 2024, step: 2 },
    modern: { start: 1990, end: 2024, step: 2 },
    historic: { start: 1900, end: 1990, step: 5 }
  };

  const range = ranges[selectedRange.value];
  const data = [];
  for (let year = range.start; year <= range.end; year += range.step) {
    const baseCount = selectedRange.value === 'recent' ? 3000 : 1500;
    const variance = Math.random() * 2000;
    const trend = (year - range.start) / (range.end - range.start) * 1500;
    data.push({
      year,
      count: Math.floor(baseCount + variance + trend)
    });
  }
  return data;
});


const xScale = (year) => {
  const years = chartData.value.map(d => d.year);
  if (years.length === 0) return padding.left;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  // Single year (or all-same-year results): avoid 0/0 -> NaN; center the point.
  if (maxYear === minYear) return (padding.left + (width - padding.right)) / 2;
  return padding.left + ((year - minYear) / (maxYear - minYear)) * (width - padding.left - padding.right);
};

const yScale = (count) => {
  const maxCount = Math.max(...chartData.value.map(d => d.count)) * 1.1;
  return height - padding.bottom - (count / maxCount) * (height - padding.top - padding.bottom);
};

const xTicks = computed(() => {
  const years = chartData.value.map(d => d.year);
  if (years.length === 0) return [];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  // Guard step >= 1: when all results are in one year, (max-min)/8 = 0 would make
  // the loop below never advance and grow `ticks` until "Invalid array length".
  const step = Math.max(1, Math.ceil((maxYear - minYear) / 8));
  const ticks = [];
  for (let y = minYear; y <= maxYear; y += step) {
    ticks.push(y);
  }
  return ticks;
});

const yTicks = computed(() => {
  const counts = chartData.value.map(d => d.count);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  // Guard step >= 1000: when maxCount is 0 (or empty) the old step would be 0 and
  // the loop would grow `ticks` forever ("Invalid array length").
  const step = Math.max(1000, Math.ceil(maxCount / 5 / 1000) * 1000);
  const ticks = [];
  for (let i = 0; i <= maxCount; i += step) {
    ticks.push(i);
  }
  return ticks;
});

const linePath = computed(() => {
  return chartData.value
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.count)}`)
    .join(' ');
});

const areaPath = computed(() => {
  const baseline = height - padding.bottom;
  const points = chartData.value.map(d => `${xScale(d.year)},${yScale(d.count)}`).join(' L');
  const firstX = xScale(chartData.value[0]?.year || 0);
  const lastX = xScale(chartData.value[chartData.value.length - 1]?.year || 0);
  return `M ${firstX},${baseline} L${points} L${lastX},${baseline} Z`;
});

const timeRange = computed(() => {
  const years = chartData.value.map(d => d.year);
  return `${Math.min(...years)} - ${Math.max(...years)}`;
});

const peakYear = computed(() => {
  const max = chartData.value.reduce((a, b) => a.count > b.count ? a : b);
  return max.year;
});

const totalRecords = computed(() => {
  return chartData.value.reduce((sum, d) => sum + d.count, 0);
});

// "Based on X records (Y% of total search)" — clarifies that this chart
// only counts records that have a usable YearCollected.
const basisText = computed(() => {
  const local = totalRecords.value;
  const search = props.searchTotal;
  if (!search || !local) return '';
  const pct = ((local / search) * 100).toFixed(local / search >= 0.995 ? 0 : 1);
  return `Based on ${formatLong(local)} records with a year (${pct}% of ${formatLong(search)} total)`;
});

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.round(num).toString();
};

const formatLong = (num) => {
  return Math.round(num).toLocaleString('en-US');
};

const showTooltip = (event, point) => {
  const rect = event.target.closest('.chart-container').getBoundingClientRect();
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 50,
    year: point.year,
    count: point.count
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};
</script>

<style scoped>
.timeline-section {
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
  align-items: center;
  gap: 10px;
}

.year-count-hint {
  font-size: 11px;
  color: #999;
  font-style: italic;
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

.chart-container {
  position: relative;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  padding: 10px;
  margin-bottom: 15px;
}

.timeline-svg {
  width: 100%;
  height: 350px;
}

.grid-line {
  stroke: #eee;
  stroke-dasharray: 3,3;
}

.axis-line {
  stroke: #ccc;
  stroke-width: 1;
}

.tick-line {
  stroke: #ccc;
}

.axis-label {
  font-size: 11px;
  fill: #666;
  text-anchor: middle;
}

.y-label {
  text-anchor: end;
}

.area-fill {
  fill: url(#areaGradient);
  fill: rgba(52, 152, 219, 0.2);
}

.line-stroke {
  fill: none;
  stroke: #3498db;
  stroke-width: 2;
}

.data-point {
  fill: #3498db;
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 6;
}

.bar {
  fill: #3498db;
  cursor: pointer;
  transition: fill 0.2s;
}

.bar:hover {
  fill: #2980b9;
}

.chart-tooltip {
  position: absolute;
  background: rgba(44, 62, 80, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.tooltip-year {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-count {
  color: #74b9ff;
  font-size: 12px;
}

.timeline-summary {
  display: flex;
  gap: 15px;
}

.summary-card {
  flex: 1;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px 16px;
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
</style>
