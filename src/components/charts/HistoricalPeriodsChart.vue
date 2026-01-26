<template>
  <div class="hp" v-if="data.length">
    <div class="hp-row" v-for="item in data" :key="item.name">
      <span class="hp-label">{{ item.name }}</span>
      <div class="hp-track">
        <div class="hp-fill" :style="{ width: pct(item.records) + '%', background: props.color }"></div>
      </div>
      <span class="hp-num">{{ fmt(item.records) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  data: { type: Array, default: () => [] },
  color: { type: String, default: '#6baed6' }
})
const max = computed(() => Math.max(...props.data.map(d => d.records || 0), 1))
const pct = (v) => Math.max(1, (v / max.value) * 100)
const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n)
</script>

<style scoped>
.hp { display: flex; flex-direction: column; gap: 5px; }
.hp-row { display: flex; align-items: center; gap: 6px; height: 18px; }
.hp-label { width: 68px; flex-shrink: 0; font-size: 11px; color: #555; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hp-track { flex: 1; height: 4px; background: #eee; border-radius: 2px; overflow: hidden; }
.hp-fill { height: 100%; background: #6baed6; border-radius: 2px; }
.hp-num { flex-shrink: 0; font-size: 11px; color: #444; font-variant-numeric: tabular-nums; min-width: 36px; }
</style>
