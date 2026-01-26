<template>
  <div class="sp" v-if="data.length">
    <div class="sp-bars">
      <div class="sp-col" v-for="(item, i) in data" :key="item.name">
        <div class="sp-bar-area">
          <div class="sp-bar" :style="{ height: pct(item.records) + '%', background: colors[i % 4] }"></div>
        </div>
        <span class="sp-lbl">{{ short(item.name) }}</span>
        <span class="sp-val">{{ fmt(item.records) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] } })
const colors = ['#74c476', '#31a354', '#e6954b', '#6baed6']
const max = computed(() => Math.max(...props.data.map(d => d.records || 0), 1))
const pct = (v) => Math.max(3, (v / max.value) * 100)
const short = (n) => { const m = n.match(/^(\w+)/); return m ? m[1] : n }
const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n)
</script>

<style scoped>
.sp { padding: 2px 0; }
.sp-bars { display: flex; gap: 8px; align-items: flex-end; }
.sp-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.sp-bar-area { width: 100%; height: 56px; display: flex; align-items: flex-end; }
.sp-bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 2px; }
.sp-lbl { font-size: 10px; color: #888; }
.sp-val { font-size: 10px; color: #555; font-variant-numeric: tabular-nums; }
</style>
