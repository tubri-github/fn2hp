<template>
  <div class="dashboard-page">
    <DataProviderDashboard />
  </div>
</template>

<script setup>
import DataProviderDashboard from '@/components/Dashboard/DataProviderDashboard.vue'
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>