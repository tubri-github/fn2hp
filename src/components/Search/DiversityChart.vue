<template>
  <div class="diversity-section">
    <div class="section-header">
      <div class="title-block">
        <h3 class="section-title">{{ title }}</h3>
        <p class="data-basis" v-if="basisText">{{ basisText }}</p>
      </div>
      <div class="section-controls">
        <select v-model="chartType" class="filter-select">
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="treemap">Treemap</option>
        </select>
      </div>
    </div>

    <!-- Bar Chart -->
    <div v-if="chartType === 'bar'" class="chart-container">
      <div class="bar-chart">
        <div
          v-for="(item, index) in displayData"
          :key="index"
          class="bar-row"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = null"
        >
          <div class="bar-label" :title="item.key">
            <a :href="getTaxonLink(item.key)" target="_blank" class="taxon-link">
              {{ truncateLabel(item.key) }}
            </a>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: (item.doc_count / maxCount * 100) + '%',
                backgroundColor: colors[index % colors.length]
              }"
            ></div>
          </div>
          <div class="bar-value">{{ formatNumber(item.doc_count) }}</div>
        </div>
      </div>
    </div>

    <!-- Pie Chart -->
    <div v-else-if="chartType === 'pie'" class="chart-container pie-container">
      <div class="pie-wrapper">
        <svg :viewBox="`0 0 ${pieSize} ${pieSize}`" class="pie-svg">
          <g :transform="`translate(${pieSize/2}, ${pieSize/2})`">
            <path
              v-for="(slice, index) in pieSlices"
              :key="index"
              :d="slice.path"
              :fill="colors[index % colors.length]"
              class="pie-slice"
              :class="{ active: activeIndex === index }"
              @mouseenter="activeIndex = index"
              @mouseleave="activeIndex = null"
            />
          </g>
          <circle :cx="pieSize/2" :cy="pieSize/2" :r="pieRadius * 0.5" fill="white" />
          <text :x="pieSize/2" :y="pieSize/2 - 8" class="center-label">Total</text>
          <text :x="pieSize/2" :y="pieSize/2 + 12" class="center-value">{{ formatNumber(totalCount) }}</text>
        </svg>
      </div>
      <div class="pie-legend">
        <div
          v-for="(item, index) in displayData"
          :key="index"
          class="legend-row"
          :class="{ active: activeIndex === index }"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = null"
        >
          <span class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }"></span>
          <a :href="getTaxonLink(item.key)" target="_blank" class="legend-name taxon-link">
            {{ truncateLabel(item.key) }}
          </a>
          <span class="legend-value">{{ formatNumber(item.doc_count) }}</span>
          <span class="legend-percent">{{ getPercent(item.doc_count) }}%</span>
        </div>
      </div>
    </div>

    <!-- Treemap -->
    <div v-else class="chart-container treemap-container">
      <div class="treemap" ref="treemapRef">
        <div
          v-for="(item, index) in treemapLayout"
          :key="index"
          class="treemap-cell"
          :style="{
            left: item.x + '%',
            top: item.y + '%',
            width: item.w + '%',
            height: item.h + '%',
            backgroundColor: colors[index % colors.length]
          }"
          :class="{ active: activeIndex === index }"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = null"
        >
          <div class="cell-content">
            <a :href="getTaxonLink(item.key)" target="_blank" class="cell-label taxon-link">
              {{ truncateLabel(item.key, 15) }}
            </a>
            <div class="cell-value">{{ formatNumber(item.doc_count) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="diversity-summary">
      <div class="summary-item">
        <span class="summary-label">Categories</span>
        <span class="summary-value">{{ displayData.length }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Total Records</span>
        <span class="summary-value">{{ formatNumber(totalCount) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Top Category</span>
        <span class="summary-value">{{ displayData[0]?.key || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Distribution'
  },
  data: {
    type: Array,
    default: () => []
  },
  linkType: {
    type: String,
    default: 'families' // 'families', 'genera', 'species', 'institutions'
  },
  // Total records returned by the search query — lets us show what fraction
  // of the search this chart actually represents (records covered by the
  // top-N family/genus buckets returned by the aggregation).
  searchTotal: {
    type: Number,
    default: 0
  }
});

const chartType = ref('bar');
const activeIndex = ref(null);
const pieSize = 220;
const pieRadius = 90;

const colors = [
  '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#e74c3c', '#1abc9c', '#34495e', '#95a5a6'
];

// Mock data if no data provided
const displayData = computed(() => {
  if (props.data.length > 0) return props.data.slice(0, 8);

  return [
    { key: 'Cyprinidae', doc_count: 12500 },
    { key: 'Cichlidae', doc_count: 8900 },
    { key: 'Characidae', doc_count: 6700 },
    { key: 'Salmonidae', doc_count: 5200 },
    { key: 'Gobiidae', doc_count: 4100 },
    { key: 'Percidae', doc_count: 3500 },
    { key: 'Poeciliidae', doc_count: 2800 },
    { key: 'Others', doc_count: 8100 }
  ];
});

const maxCount = computed(() => {
  return Math.max(...displayData.value.map(d => d.doc_count));
});

const totalCount = computed(() => {
  return displayData.value.reduce((sum, d) => sum + d.doc_count, 0);
});

// "Based on top-N families covering X records (Y% of total search)" —
// reminds users that the chart only shows the top buckets returned by
// the aggregation, not every family in the search.
const basisText = computed(() => {
  const local = totalCount.value;
  const search = props.searchTotal;
  if (!search || !local) return '';
  const pct = ((local / search) * 100).toFixed(local / search >= 0.995 ? 0 : 1);
  return `Top ${displayData.value.length} categories covering ${local.toLocaleString('en-US')} records (${pct}% of ${search.toLocaleString('en-US')} total)`;
});

// Generate link to fn2hp
const getTaxonLink = (name) => {
  const baseUrl = 'http://localhost:5173'; // fn2hp base URL
  if (props.linkType === 'institutions') {
    return `${baseUrl}/browse/institutions/${encodeURIComponent(name)}`;
  }
  return `${baseUrl}/browse/${props.linkType}/${encodeURIComponent(name)}`;
};

// Squarified Treemap Layout Algorithm
const treemapLayout = computed(() => {
  const data = displayData.value.map(d => ({ ...d }));
  const total = totalCount.value;

  // Container dimensions (percentage based)
  const containerWidth = 100;
  const containerHeight = 100;

  // Sort by value descending
  data.sort((a, b) => b.doc_count - a.doc_count);

  // Calculate areas
  const totalArea = containerWidth * containerHeight;
  data.forEach(d => {
    d.area = (d.doc_count / total) * totalArea;
  });

  // Simple row-based layout
  const layout = [];
  let currentY = 0;
  let remainingHeight = containerHeight;
  let i = 0;

  while (i < data.length && remainingHeight > 0) {
    // Determine how many items fit in this row
    let rowItems = [];
    let rowArea = 0;
    const rowHeight = Math.min(remainingHeight, Math.max(15, remainingHeight / Math.ceil((data.length - i) / 2)));
    const targetRowArea = containerWidth * rowHeight;

    // Fill the row
    while (i < data.length && rowArea < targetRowArea * 0.95) {
      rowItems.push(data[i]);
      rowArea += data[i].area;
      i++;
      if (rowItems.length >= 4) break; // Max 4 items per row
    }

    // Layout items in this row
    let currentX = 0;
    const actualRowHeight = rowItems.length > 0 ?
      Math.min(rowHeight, (rowArea / containerWidth)) : rowHeight;

    rowItems.forEach(item => {
      const itemWidth = (item.area / actualRowHeight);
      layout.push({
        ...item,
        x: currentX,
        y: currentY,
        w: Math.min(itemWidth, containerWidth - currentX),
        h: actualRowHeight
      });
      currentX += itemWidth;
    });

    currentY += actualRowHeight;
    remainingHeight -= actualRowHeight;
  }

  return layout;
});

const pieSlices = computed(() => {
  const slices = [];
  let currentAngle = -Math.PI / 2;

  displayData.value.forEach((item) => {
    const sliceAngle = (item.doc_count / totalCount.value) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = Math.cos(startAngle) * pieRadius;
    const y1 = Math.sin(startAngle) * pieRadius;
    const x2 = Math.cos(endAngle) * pieRadius;
    const y2 = Math.sin(endAngle) * pieRadius;

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    slices.push({
      path: `M 0 0 L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      item
    });

    currentAngle = endAngle;
  });

  return slices;
});

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const truncateLabel = (label, max = 18) => {
  return label.length > max ? label.substring(0, max) + '...' : label;
};

const getPercent = (count) => {
  return ((count / totalCount.value) * 100).toFixed(1);
};
</script>

<style scoped>
.diversity-section {
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
  gap: 10px;
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
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  padding: 20px;
  margin-bottom: 15px;
  min-height: 350px;
}

/* Taxon Link */
.taxon-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.taxon-link:hover {
  color: #3498db;
  text-decoration: underline;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.bar-row:hover {
  background: #f8f9fa;
}

.bar-label {
  width: 120px;
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-value {
  width: 60px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-align: right;
}

/* Pie Chart */
.pie-container {
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

.pie-wrapper {
  flex-shrink: 0;
}

.pie-svg {
  width: 220px;
  height: 220px;
}

.pie-slice {
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  transform-origin: center;
}

.pie-slice:hover,
.pie-slice.active {
  opacity: 0.85;
}

.center-label {
  font-size: 12px;
  fill: #999;
  text-anchor: middle;
}

.center-value {
  font-size: 18px;
  font-weight: 700;
  fill: #2c3e50;
  text-anchor: middle;
}

.pie-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.legend-row:hover,
.legend-row.active {
  background: #f8f9fa;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 13px;
  color: #2c3e50;
}

.legend-value {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.legend-percent {
  font-size: 12px;
  color: #999;
  width: 45px;
  text-align: right;
}

/* Treemap */
.treemap-container {
  padding: 10px;
}

.treemap {
  position: relative;
  width: 100%;
  height: 320px;
}

.treemap-cell {
  position: absolute;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.3);
  box-sizing: border-box;
}

.treemap-cell:hover,
.treemap-cell.active {
  opacity: 0.85;
}

.cell-content {
  text-align: center;
  color: white;
  padding: 6px;
  overflow: hidden;
}

.cell-label {
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 2px;
  display: block;
  color: white;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.cell-label:hover {
  text-decoration: underline;
}

.cell-value {
  font-size: 13px;
  font-weight: 700;
}

/* Summary */
.diversity-summary {
  display: flex;
  gap: 30px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}
</style>
