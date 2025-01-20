<template>
  <div class="chart-container" ref="chart"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    type: String, // 图表类型 (如 "pie" 或 "bar")
    data: Array, // 当前图表数据
    title: String, // 当前图表标题
    drilldown: Function // 点击图表数据触发的回调函数
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const chart = echarts.init(this.$refs.chart);

      const options = {
        title: {
          text: this.title,
          left: "center"
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          bottom: "0%"
        },
        xAxis: this.type === "bar" ? {type: "category", data: this.data.map(d => d.label)} : undefined,
        yAxis: this.type === "bar" ? {type: "value"} : undefined,
        series: [
          {
            name: this.title,
            type: this.type,
            data: this.type === "pie"
                ? this.data.map(d => ({name: d.label, value: d.value}))
                : this.data.map(d => d.value),
            radius: this.type === "pie" ? "50%" : undefined
          }
        ]
      };

      chart.setOption(options);

      // 点击事件
      chart.on("click", params => {
        if (this.drilldown) {
          this.drilldown(params.name); // 将点击部分的名称传递给回调函数
        }
      });

      // 响应式调整大小
      window.addEventListener("resize", () => {
        chart.resize();
      });
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 可根据需要调整高度 */
}
</style>
