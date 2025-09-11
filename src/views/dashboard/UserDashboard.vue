<template>
  <div class="dashboard-page">
    <DataUserDashboard />
  </div>
</template>

<script setup>
import DataUserDashboard from '@/components/Dashboard/DataUserDashboard.vue'
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>