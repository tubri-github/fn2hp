<template>
  <!-- Compact 5th stat-item: ring chart with % at center, "SPECIES" label below.
       Designed to sit inline with the other StatsDisplay numbers. -->
  <div class="stat-item coverage-stat" v-if="ready" :title="tooltipText">
    <div class="ring-wrap">
      <v-chart class="ring-chart" :option="option" autoresize />
      <span class="ring-pct">{{ percentLabel }}</span>
    </div>
    <div class="stat-label">SPECIES</div>
  </div>
</template>

<script>
import { taxonomyApi } from "@/api/taxonomy.js";

function formatCount(n) {
  if (n == null) return "—";
  return n.toLocaleString("en-US");
}

export default {
  name: "SpeciesCoveragePieChart",
  data() {
    return {
      covered: 0,
      total: 0,
      ready: false,
    };
  },
  computed: {
    remaining() {
      return Math.max(this.total - this.covered, 0);
    },
    percentLabel() {
      if (!this.total) return "—";
      const pct = (this.covered / this.total) * 100;
      // Drop the decimal once we get past 10% so it reads cleaner at small size.
      return pct >= 10 ? Math.round(pct) + "%" : pct.toFixed(1) + "%";
    },
    tooltipText() {
      return `${formatCount(this.covered)} of ${formatCount(this.total)} known fish species`;
    },
    option() {
      return {
        // Tooltip disabled — the parent .stat-item already shows a native
        // title on hover and we want the ring to feel like a static number.
        tooltip: { show: false },
        series: [
          {
            type: "pie",
            radius: ["72%", "92%"],
            center: ["50%", "50%"],
            silent: true,
            label: { show: false },
            labelLine: { show: false },
            data: [
              {
                value: this.covered,
                itemStyle: { color: "#2c7cb9" },
              },
              {
                value: this.remaining,
                itemStyle: { color: "#e4e7ed" },
              },
            ],
          },
        ],
      };
    },
  },
  async mounted() {
    try {
      const r = await taxonomyApi.getTaxonomyStats();
      // Hide the chart entirely when the denominator is unavailable rather
      // than rendering a meaningless 100% slice.
      if (!r.globalFishSpecies || !r.totalSpecies) return;
      this.covered = r.totalSpecies;
      this.total = r.globalFishSpecies;
      this.ready = true;
    } catch (e) {
      console.error("Failed to load species coverage stats:", e);
    }
  },
};
</script>

<style scoped>
/* Mirror StatsDisplay's .stat-item layout so this slots in seamlessly. */
.coverage-stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
}

.ring-wrap {
  position: relative;
  width: 5rem;   /* matches the visual weight of the 5rem stat-number text */
  height: 5rem;
}

.ring-chart {
  width: 100%;
  height: 100%;
}

.ring-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Montserrat", sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c7cb9;
  letter-spacing: -0.5px;
  line-height: 1;
  background: linear-gradient(135deg, #2c7cb9 0%, #4a90e2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  pointer-events: none;
}

.stat-label {
  font-family: "Inter", sans-serif;
  font-size: 1.3rem;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>