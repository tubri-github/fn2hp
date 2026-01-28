<template>
  <div class="stats-container">
    <div class="stats-panel">
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.totalRecords) }}</div>
        <div class="stat-label">Records</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.speciesCount) }}</div>
        <div class="stat-label">Species</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.institutionCount) }}</div>
        <div class="stat-label">Institutions</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ formatNumber(stats.countryCount) }}</div>
        <div class="stat-label">Countries</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.georefPercent }}%</div>
        <div class="stat-label">Georeferenced</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      totalRecords: 0,
      speciesCount: 0,
      institutionCount: 0,
      countryCount: 0,
      georefPercent: 0
    })
  }
});

const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};
</script>

<style scoped>
.stats-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.stats-panel {
  display: flex;
  background: white;
}

.stat-item {
  padding: 16px 28px;
  text-align: center;
  border-right: 1px dashed #ccc;
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .stats-panel {
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 1 1 33%;
    min-width: 100px;
    padding: 12px 16px;
    border-right: none;
    border-bottom: 1px dashed #ccc;
  }

  .stat-item:nth-last-child(-n+2) {
    border-bottom: none;
  }
}
</style>
