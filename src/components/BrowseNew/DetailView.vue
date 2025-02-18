// DetailView.vue
<template>
  <div class="detail-view">
    <!-- 头部区域 -->
    <div class="detail-header">
      <button class="back-button" @click="$emit('close')">
        ← Back
      </button>

      <!-- 物种名称区域 -->
      <div class="species-header">
        <h1 class="scientific-name">{{ itemData.name }}</h1>
        <div class="taxonomy-status">
          <span class="status-tag" :class="{ 'accepted': isAccepted }">
            {{ isAccepted ? 'Accepted' : 'Not Accepted' }}
          </span>
        </div>

        <!-- 同义名列表 -->
        <div class="synonyms-section" v-if="synonyms.length">
          <h3>Synonyms:</h3>
          <ul class="synonyms-list">
            <li v-for="syn in synonyms" :key="syn.name" class="synonym-item">
              {{ syn.name }}
              <span class="year" v-if="syn.year">({{ syn.year }})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="tab-navigation">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <!-- 基本信息 Tab -->
      <div v-if="currentTab === 'info'" class="info-tab">
        <div class="info-grid">
          <div class="info-section">
            <h3>Classification</h3>
            <div class="classification-info">
              <div class="info-row">
                <span class="label">Kingdom:</span>
                <span class="value">Animalia</span>
              </div>
              <div class="info-row">
                <span class="label">Phylum:</span>
                <span class="value">Chordata</span>
              </div>
              <!-- 添加更多分类信息 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 统计图表 Tab -->
      <div v-if="currentTab === 'stats'" class="stats-tab">
        <div class="charts-grid">
          <!-- 按国家分布的饼图 -->
          <div class="chart-container">
            <h3>Distribution by Country</h3>
            <v-chart class="chart" :option="countryPieOption" />
          </div>

          <!-- 按机构的柱状图 -->
          <div class="chart-container">
            <h3>Records by Institution</h3>
            <v-chart class="chart" :option="institutionBarOption" />
          </div>

          <!-- 按流域分布的横向条形图 -->
          <div class="chart-container">
            <h3>Distribution by Basin</h3>
            <v-chart class="chart" :option="basinBarOption" />
          </div>
        </div>
      </div>

      <!-- 记录数据 Tab -->
      <div v-if="currentTab === 'records'" class="records-tab">
        <div class="table-container">
          <table class="records-table">
            <thead>
            <tr>
              <th>Catalog Number</th>
              <th>Institution</th>
              <th>Country</th>
              <th>Locality</th>
              <th>Date</th>
              <th>Collector</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.catalogNumber }}</td>
              <td>{{ record.institution }}</td>
              <td>{{ record.country }}</td>
              <td>{{ record.locality }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.collector }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  itemData: {
    type: Object,
    required: true
  }
})

// Tab 管理
const tabs = [
  { id: 'info', label: 'Information' },
  { id: 'stats', label: 'Statistics' },
  { id: 'records', label: 'Records' }
]
const currentTab = ref('info')

// 图表配置
const countryPieOption = computed(() => ({
  title: {
    text: 'Distribution by Country',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: 'Country',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 400, name: 'United States' },
        { value: 300, name: 'Canada' },
        { value: 300, name: 'Mexico' },
        { value: 200, name: 'Australia' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

const institutionBarOption = computed(() => ({
  title: {
    text: 'Records by Institution',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['NMNH', 'AMNH', 'BMNH', 'ANSP'],
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Records',
      type: 'bar',
      barWidth: '60%',
      data: [240, 180, 150, 120]
    }
  ]
}))

// 计算属性
const isAccepted = computed(() => true) // 根据实际数据计算
const synonyms = computed(() => [
  { name: 'Cyprinus auratus Linnaeus, 1758', year: 1758 },
  { name: 'Carassius auratus auratus', year: null }
])
const records = computed(() => [
  {
    id: 1,
    catalogNumber: 'USNM 12345',
    institution: 'NMNH',
    country: 'China',
    locality: 'Yangtze River',
    date: '1985-06-15',
    collector: 'John Smith'
  },
  // 添加更多记录...
])

// 流域分布图配置
const basinBarOption = computed(() => ({
  title: {
    text: 'Distribution by Basin',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: '50',
    left: '200',  // 为长河流名称预留空间
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: [
      'Mississippi River Basin',
      'Great Lakes Basin',
      'Columbia River Basin',
      'Colorado River Basin',
      'Rio Grande Basin',
      'St. Lawrence River Basin',
      'Hudson Bay Basin',
      'Sacramento River Basin'
    ].reverse()  // 反转数组使数值大的在上面
  },
  series: [
    {
      name: 'Number of Records',
      type: 'bar',
      data: [320, 280, 250, 190, 150, 120, 90, 80].reverse(),  // 对应反转
      itemStyle: {
        color: function(params) {
// 根据数值生成不同深度的蓝色
          const value = params.value;
          const maxValue = 320;
          const minValue = 80;
          const opacity = 0.3 + 0.7 * (value - minValue) / (maxValue - minValue);
          return `rgba(65, 105, 225, ${opacity})`;
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c} records'
      }
    }
  ]
}))
</script>

<style scoped>
.detail-view {
  height: 100%;
  overflow-y: auto;
  background: white;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: #e5e7eb;
}

.species-header {
  margin-top: 1rem;
}

.scientific-name {
  font-size: 2rem;
  font-style: italic;
  font-weight: 600;
  margin: 0;
}

.taxonomy-status {
  margin-top: 0.5rem;
}

.status-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #fee2e2;
  color: #991b1b;
}

.status-tag.accepted {
  background: #dcfce7;
  color: #166534;
}

.synonyms-section {
  margin-top: 1rem;
}

.synonyms-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.synonym-item {
  font-style: italic;
  margin: 0.25rem 0;
  color: #4b5563;
}

.synonym-item .year {
  font-style: normal;
  color: #6b7280;
}

.tab-navigation {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.info-grid {
  display: grid;
  gap: 1.5rem;
}

.info-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.info-row {
  display: flex;
  margin: 0.5rem 0;
}

.info-row .label {
  width: 120px;
  font-weight: 500;
  color: #4b5563;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart {
  height: 400px;
  width: 100%;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.records-table th {
  background: #f9fafb;
  font-weight: 500;
  color: #374151;
}

.records-table tr:hover {
  background: #f9fafb;
}
</style>