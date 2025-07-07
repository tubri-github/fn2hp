
<!-- src/components/common/Pagination.vue -->
<template>
  <div class="pagination">
    <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="pagination-btn"
    >
      ‹ Previous
    </button>

    <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-btn', { active: page === currentPage }]"
    >
      {{ page }}
    </button>

    <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="pagination-btn"
    >
      Next ›
    </button>

    <div class="pagination-info">
      Showing {{ startRecord }}-{{ endRecord }} of {{ total }} records
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 50
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const startRecord = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endRecord = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(totalPages.value, props.currentPage + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.pagination-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  margin-left: 15px;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 10px;
  }

  .pagination-info {
    margin-left: 0;
    order: -1;
  }
}
</style>