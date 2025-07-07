<!-- src/components/browse/DataQualityBadge.vue -->
<template>
  <div class="quality-badges">
    <span
        v-for="metric in qualityMetrics"
        :key="metric.name"
        class="quality-badge"
        :class="getQualityClass(metric.value)"
        :title="`${metric.label}: ${metric.value}%`"
    >
      {{ metric.name }}: {{ metric.value }}%
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataQuality } from '@/composables/useDataQuality'

const props = defineProps({
  georeferenced: {
    type: Number,
    default: 0
  },
  dateQuality: {
    type: Number,
    default: 0
  },
  taxonomicQuality: {
    type: Number,
    default: 0
  }
})

const { getQualityClass } = useDataQuality()

const qualityMetrics = computed(() => [
  { name: 'Geo', label: 'Georeferencing', value: props.georeferenced },
  { name: 'Date', label: 'Date Quality', value: props.dateQuality },
  { name: 'Tax', label: 'Taxonomic Quality', value: props.taxonomicQuality }
])
</script>

<style scoped>
.quality-badges {
  display: flex;
  gap: 4px;
}

.quality-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.quality-badge.quality-excellent { background: #d4edda; color: #155724; }
.quality-badge.quality-good { background: #fff3cd; color: #856404; }
.quality-badge.quality-poor { background: #f8d7da; color: #721c24; }
</style>