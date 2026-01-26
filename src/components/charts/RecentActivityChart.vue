<template>
  <div class="ra" v-if="sorted.length">
    <div class="ra-bars">
      <div class="ra-col" v-for="item in sorted" :key="item.year" :title="`${item.year}: ${item.records.toLocaleString()}`">
        <div class="ra-bar-area">
          <div class="ra-bar" :style="{ height: pct(item.records) + '%' }" :class="{ peak: item.records === max }"></div>
        </div>
        <span class="ra-yr">{{ item.year }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ data: { type: Array, default: () => [] } })
const sorted = computed(() => [...props.data].sort((a, b) => a.year - b.year))
const max = computed(() => Math.max(...props.data.map(d => d.records || 0), 1))
const pct = (v) => Math.max(3, (v / max.value) * 100)
</script>

<style scoped>
.ra { padding: 2px 0; }
.ra-bars { display: flex; gap: 2px; align-items: flex-end; }
.ra-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
.ra-bar-area { width: 100%; height: 56px; display: flex; align-items: flex-end; }
.ra-bar { width: 100%; background: #b4d5e8; border-radius: 1.5px 1.5px 0 0; min-height: 2px; }
.ra-bar.peak { background: #2171b5; }
.ra-yr { font-size: 8px; color: #aaa; }
</style>
