// SearchBar.vue
<template>
  <div class="search-bar">
    <input
        type="text"
        v-model="searchText"
        @input="handleInput"
        placeholder="Search fish..."
        class="search-input"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchText = ref('')
const emit = defineEmits(['search'])

const handleInput = () => {
  emit('search', searchText.value)
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 1rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 12px -1px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}
</style>