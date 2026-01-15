<template>
  <div class="custom-chart">
    <!-- Configuration Panel -->
    <div class="config-panel">
      <div class="config-row">
        <div class="config-item">
          <label class="config-label">Field</label>
          <el-select
            v-model="selectedField"
            placeholder="Select a field"
            size="default"
            class="config-select"
            @change="onConfigChange"
          >
            <el-option-group
              v-for="group in fieldGroups"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="field in group.options"
                :key="field.value"
                :label="field.label"
                :value="field.value"
              />
            </el-option-group>
          </el-select>
        </div>

        <div class="config-item">
          <label class="config-label">Chart Type</label>
          <el-select
            v-model="selectedChartType"
            placeholder="Select chart type"
            size="default"
            class="config-select"
            @change="onConfigChange"
          >
            <el-option label="Bar Chart" value="bar" />
            <el-option label="Pie Chart" value="pie" />
            <el-option label="Table" value="table" />
          </el-select>
        </div>

        <div class="config-item">
          <label class="config-label">Top N</label>
          <el-select
            v-model="topN"
            size="default"
            class="config-select config-select-small"
            @change="onConfigChange"
          >
            <el-option :label="5" :value="5" />
            <el-option :label="10" :value="10" />
            <el-option :label="20" :value="20" />
            <el-option :label="50" :value="50" />
          </el-select>
        </div>

        <div class="config-item">
          <label class="config-label">&nbsp;</label>
          <el-button
            type="primary"
            :loading="isLoading"
            :disabled="!selectedField"
            @click="generateChart"
          >
            Generate
          </el-button>
        </div>
      </div>
    </div>

    <!-- Chart Display Area -->
    <div class="chart-area">
      <!-- Initial State -->
      <div v-if="!hasData && !isLoading" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <div class="empty-text">Select a field and click Generate to create a chart</div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Generating chart...</div>
      </div>

      <!-- Chart Content -->
      <div v-else class="chart-content">
        <div class="chart-header">
          <h3 class="chart-title">{{ chartTitle }}</h3>
          <span class="chart-subtitle">{{ chartData.length }} categories, {{ formatNumber(totalCount) }} total records</span>
        </div>

        <!-- Bar Chart -->
        <div v-if="selectedChartType === 'bar'" class="bar-chart">
          <div
            v-for="(item, index) in chartData"
            :key="index"
            class="bar-row"
            :class="{ active: activeIndex === index }"
            @mouseenter="activeIndex = index"
            @mouseleave="activeIndex = null"
          >
            <div class="bar-rank">{{ index + 1 }}</div>
            <div class="bar-label" :title="item.key">{{ truncateLabel(item.key) }}</div>
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
            <div class="bar-percent">{{ getPercent(item.doc_count) }}%</div>
          </div>
        </div>

        <!-- Pie Chart -->
        <div v-else-if="selectedChartType === 'pie'" class="pie-chart">
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
              v-for="(item, index) in chartData"
              :key="index"
              class="legend-row"
              :class="{ active: activeIndex === index }"
              @mouseenter="activeIndex = index"
              @mouseleave="activeIndex = null"
            >
              <span class="legend-color" :style="{ backgroundColor: colors[index % colors.length] }"></span>
              <span class="legend-name">{{ truncateLabel(item.key) }}</span>
              <span class="legend-value">{{ formatNumber(item.doc_count) }}</span>
              <span class="legend-percent">{{ getPercent(item.doc_count) }}%</span>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-else-if="selectedChartType === 'table'" class="table-view">
          <el-table :data="chartData" border stripe size="small">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="key" :label="selectedFieldLabel" min-width="200" />
            <el-table-column prop="doc_count" label="Count" width="120" sortable>
              <template #default="scope">
                {{ formatNumber(scope.row.doc_count) }}
              </template>
            </el-table-column>
            <el-table-column label="Percentage" width="120">
              <template #default="scope">
                {{ getPercent(scope.row.doc_count) }}%
              </template>
            </el-table-column>
            <el-table-column label="Distribution" min-width="200">
              <template #default="scope">
                <div class="table-bar">
                  <div
                    class="table-bar-fill"
                    :style="{ width: (scope.row.doc_count / maxCount * 100) + '%' }"
                  ></div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import api from '@/api/base.js';

const props = defineProps({
  searchTerm: String,
  conditions: Array
});

const emit = defineEmits(['error']);

// Configuration state
const selectedField = ref('');
const selectedChartType = ref('bar');
const topN = ref(10);
const isLoading = ref(false);
const chartData = ref([]);
const activeIndex = ref(null);

// Chart constants
const pieSize = 240;
const pieRadius = 100;
const colors = [
  '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e67e22', '#16a085', '#c0392b',
  '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#7f8c8d',
  '#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f'
];

// Field groups for dropdown
const fieldGroups = [
  {
    label: 'Taxonomy',
    options: [
      { label: 'Scientific Name', value: 'ScientificName' },
      { label: 'Family', value: 'Family' },
      { label: 'Genus', value: 'Genus' },
      { label: 'Order', value: 'Order' },
      { label: 'Class', value: 'Class' }
    ]
  },
  {
    label: 'Location',
    options: [
      { label: 'Country', value: 'Country' },
      { label: 'State/Province', value: 'StateProvince' },
      { label: 'County', value: 'County' }
    ]
  },
  {
    label: 'Collection',
    options: [
      { label: 'Institution Code', value: 'InstitutionCode' },
      { label: 'Collection Code', value: 'CollectionCode' },
      { label: 'Year Collected', value: 'YearCollected' }
    ]
  },
  {
    label: 'Record',
    options: [
      { label: 'Basis of Record', value: 'BasisOfRecord' },
      { label: 'Recorded By', value: 'RecordedBy' }
    ]
  }
];

// Computed properties
const hasData = computed(() => chartData.value.length > 0);

const selectedFieldLabel = computed(() => {
  for (const group of fieldGroups) {
    const field = group.options.find(f => f.value === selectedField.value);
    if (field) return field.label;
  }
  return selectedField.value;
});

const chartTitle = computed(() => {
  return `${selectedFieldLabel.value} Distribution`;
});

const maxCount = computed(() => {
  if (chartData.value.length === 0) return 1;
  return Math.max(...chartData.value.map(d => d.doc_count));
});

const totalCount = computed(() => {
  return chartData.value.reduce((sum, d) => sum + d.doc_count, 0);
});

const pieSlices = computed(() => {
  const total = totalCount.value;
  if (total === 0) return [];

  let currentAngle = -Math.PI / 2;
  return chartData.value.map(item => {
    const sliceAngle = (item.doc_count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = Math.cos(startAngle) * pieRadius;
    const y1 = Math.sin(startAngle) * pieRadius;
    const x2 = Math.cos(endAngle) * pieRadius;
    const y2 = Math.sin(endAngle) * pieRadius;

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    return {
      ...item,
      path: `M 0 0 L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    };
  });
});

// Methods
const onConfigChange = () => {
  // Optional: auto-regenerate on config change
};

const generateChart = async () => {
  if (!selectedField.value) return;

  isLoading.value = true;
  chartData.value = [];

  try {
    const payload = {
      field: selectedField.value,
      size: topN.value,
      term: props.searchTerm || undefined,
      conditions: props.conditions?.length > 0 ? props.conditions : undefined
    };

    const response = await api.post('/custom-aggregation', payload);
    chartData.value = response.buckets || [];
  } catch (error) {
    console.error('Failed to generate chart:', error);
    emit('error', 'Failed to generate chart. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const truncateLabel = (label, maxLen = 25) => {
  if (!label) return '-';
  return label.length > maxLen ? label.substring(0, maxLen) + '...' : label;
};

const getPercent = (count) => {
  const total = totalCount.value;
  if (total === 0) return '0';
  return ((count / total) * 100).toFixed(1);
};
</script>

<style scoped>
.custom-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Configuration Panel */
.config-panel {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  border-radius: 6px 6px 0 0;
}

.config-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.config-select {
  width: 180px;
}

.config-select-small {
  width: 80px;
}

/* Chart Area */
.chart-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.empty-icon {
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-text {
  font-size: 14px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #909399;
}

/* Chart Content */
.chart-content {
  max-width: 900px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 13px;
  color: #909399;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.bar-row:hover,
.bar-row.active {
  background-color: #f5f7fa;
}

.bar-rank {
  width: 24px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.bar-label {
  width: 180px;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
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
  font-weight: 500;
  color: #303133;
  text-align: right;
}

.bar-percent {
  width: 50px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

/* Pie Chart */
.pie-chart {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.pie-wrapper {
  flex-shrink: 0;
}

.pie-svg {
  width: 240px;
  height: 240px;
}

.pie-slice {
  cursor: pointer;
  transition: opacity 0.15s;
}

.pie-slice:hover,
.pie-slice.active {
  opacity: 0.8;
}

.center-label {
  font-size: 12px;
  fill: #909399;
  text-anchor: middle;
}

.center-value {
  font-size: 18px;
  font-weight: 600;
  fill: #303133;
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
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.15s;
  cursor: pointer;
}

.legend-row:hover,
.legend-row.active {
  background-color: #f5f7fa;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.legend-percent {
  width: 50px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

/* Table View */
.table-view {
  max-width: 800px;
}

.table-bar {
  height: 16px;
  background: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
}

.table-bar-fill {
  height: 100%;
  background: #3498db;
  border-radius: 3px;
}
</style>
