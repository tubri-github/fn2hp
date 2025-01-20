<template>
  <div class="browse-page">
    <div class="sidebar">
      <TreeView :type="type" :data="treeData" @selectionChange="handleSelectionChange" />
    </div>

    <div class="content">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb" aria-label="Navigation path">
        <div class="flex items-center gap-2">
          <span
              v-for="(level, index) in drilldownLevel"
              :key="index"
              @click="navigateToLevel(index)"
              class="breadcrumb-item cursor-pointer hover:text-blue-600"
          >
            {{ level }}
            <span v-if="index < drilldownLevel.length - 1" class="mx-2">→</span>
          </span>
        </div>
      </nav>

      <!-- 图表区域 -->
      <div class="charts">
        <button
            @click="prevChart"
            class="nav-button"
            :disabled="currentChartIndex === 0"
            :class="{'opacity-50': currentChartIndex === 0}"
        >
          ←
        </button>

        <div class="chart-container" ref="chartContainer">
          <div
              class="charts-scroll"
              :style="{ transform: `translateX(-${currentChartIndex * (100/maxVisibleCharts)}%)` }"
          >
            <div
                v-for="(chart, index) in charts"
                :key="index"
                class="chart-wrapper"
                :class="{'active': isChartVisible(index)}"
            >
              <Chart
                  :type="chart.type"
                  :data="chart.data"
                  :title="chart.title"
                  :drilldown="handleDrilldown"
              />
            </div>
          </div>
        </div>

        <button
            @click="nextChart"
            class="nav-button"
            :disabled="currentChartIndex + maxVisibleCharts >= charts.length"
            :class="{'opacity-50': currentChartIndex + maxVisibleCharts >= charts.length}"
        >
          →
        </button>
      </div>

      <div class="data-table">
        <DataTable :data="tableData" />
      </div>
    </div>
  </div>
</template>

<script>
import TreeView from './TreeView.vue';
import Chart from './Chart.vue';
import DataTable from './DataTable.vue';
import {mockData} from '@/mock/mockData.js';
import {getTreeDataByType} from '@/mock/getTreeData';

export default {
  name: 'BrowsePage',
  components: {TreeView, Chart, DataTable},
  data() {
    return {
      type: this.$route.params.type,
      treeData: [],
      charts: [],
      tableData: [],
      drilldownLevel: [], // 当前路径层级
      currentChartIndex: 0, // 当前图表的起始索引
      maxVisibleCharts: 2, // 同时显示的图表数量
      isTransitioning: false
    };
  },
  computed: {
    visibleCharts() {
      // 获取当前可见范围内的图表
      return this.charts.slice(this.currentChartIndex, this.currentChartIndex + this.maxVisibleCharts);
    }
  },
  created() {
    this.loadTreeData();
    this.loadMockData();
  },
  methods: {
    loadTreeData() {
      this.treeData = getTreeDataByType(this.type);
    },
    loadMockData() {
      this.charts = mockData[this.type].charts || [];
      this.tableData = mockData[this.type].table || [];
      this.drilldownLevel = []; // 初始化路径
    },
    handleSelectionChange(node) {
      console.log('Selected node:', node);  // 查看节点结构
      if (node.level === 0) {  // family 层级
        // 重置状态
        this.drilldownLevel = [];
        this.charts = [];
        this.currentChartIndex = 0;
      }
      // 触发下钻
      this.handleDrilldown(node.name);
    },
    handleDrilldown(selectedName) {
      const level = this.drilldownLevel.length;

      if (level === 0) {
        const genusData = mockData[this.type].genus[selectedName] || [];
        if (genusData.length) {
          this.drilldownLevel.push(selectedName);
          this.charts.push({
            type: "pie",
            title: `Occurrences in ${selectedName}`,
            data: genusData
          });
        }
      } else if (level === 1) {
        const speciesData = mockData[this.type].species[selectedName] || [];
        if (speciesData.length) {
          this.drilldownLevel.push(selectedName);
          this.charts.push({
            type: "pie",
            title: `Occurrences in ${selectedName}`,
            data: speciesData
          });
        }
      }

      // 自动滚动到最后的图表
      this.$nextTick(() => {
        this.currentChartIndex = Math.max(0, this.charts.length - this.maxVisibleCharts);
      });
    },
    navigateToLevel(levelIndex) {
      // 截断层级和图表
      this.drilldownLevel = this.drilldownLevel.slice(0, levelIndex + 1);
      this.charts = this.charts.slice(0, levelIndex + 1);

      // 回到路径指定的图表
      this.$nextTick(() => {
        this.currentChartIndex = Math.max(0, this.charts.length - this.maxVisibleCharts);
      });
    },
    async prevChart() {
      if (this.currentChartIndex > 0 && !this.isTransitioning) {
        this.isTransitioning = true;
        this.currentChartIndex--;
        await this.waitForTransition();
        this.isTransitioning = false;
      }
    },
    async nextChart() {
      if (this.currentChartIndex + this.maxVisibleCharts < this.charts.length && !this.isTransitioning) {
        this.isTransitioning = true;
        this.currentChartIndex++;
        await this.waitForTransition();
        this.isTransitioning = false;
      }
    },
    isChartVisible(index) {
      return index >= this.currentChartIndex &&
          index < this.currentChartIndex + this.maxVisibleCharts;
    },
    waitForTransition() {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
  }
};
</script>

<style scoped>
.browse-page {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  min-width: 250px;
  width: 25%;
  max-width: 350px;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  padding: 10px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.breadcrumb {
  padding: 10px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #e0e0e0;
}

.breadcrumb-item {
  color: #007bff;
  text-decoration: underline;
}

.breadcrumb-item:hover {
  text-decoration: none;
}

.charts {
  display: flex;
  align-items: center;
  padding: 10px;
  flex-shrink: 0;
  overflow: hidden;
}

.chart-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.charts-scroll {
  display: flex;
  transition: transform 0.3s ease;
}

.chart-wrapper {
  width: 50%;
  flex-shrink: 0;
  padding: 0 10px;
  transition: opacity 0.3s ease;
  opacity: 0.5;
}

.chart-wrapper.active {
  opacity: 1;
}

.nav-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 10px;
  transition: opacity 0.2s;
}

.nav-button:disabled {
  cursor: not-allowed;
}

.data-table {
  padding: 10px;
  overflow: auto;
  flex: 1;
  width: 100%;
}
</style>