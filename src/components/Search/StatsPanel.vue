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
      <div class="stat-item highlight">
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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

.stat-item {
  padding: 16px 28px;
  text-align: center;
  border-right: 1px solid #eee;
  transition: background 0.2s;
}

.stat-item:last-child {
  border-right: none;
}

.stat-item:hover {
  background: #f8f9fa;
}

.stat-item.highlight {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%);
}

.stat-item.highlight:hover {
  background: linear-gradient(135deg, #e3f0ff 0%, #d9eef4 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

.stat-item.highlight .stat-value {
  color: #3498db;
}

.stat-label {
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
    border-bottom: 1px solid #eee;
  }

  .stat-item:nth-last-child(-n+2) {
    border-bottom: none;
  }
}
</style>
