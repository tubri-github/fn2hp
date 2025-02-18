// HierarchyView.vue
<template>
  <div class="hierarchy-view">
    <!-- Family level - Card view -->
    <div v-if="currentLevel === 'family'" class="card-view">
      <div class="hierarchy-list">
        <div
            v-for="(item, index) in displayData"
            :key="item?.id || index"
            class="hierarchy-item"
            @click="handleClick(item)"
        >
          <div class="item-content">
            <span class="item-name">{{ item?.name || 'Unnamed' }}</span>
          </div>
          <div class="item-description">{{ item?.description || 'No description available' }}</div>
        </div>
      </div>
    </div>

    <!-- Genus and Species level - Alphabet index view -->
    <div v-else class="alphabet-view">
      <!-- Alphabet navigation -->
      <div class="alphabet-nav">
        <button
            v-for="letter in alphabet"
            :key="letter"
            class="letter-button"
            :class="{
              'active': currentLetter === letter,
              'has-items': hasItemsForLetter(letter)
            }"
            @click="setCurrentLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>

      <!-- Names grid -->
      <div class="names-container">
        <div class="names-grid">
          <div
              v-for="item in currentLetterItems"
              :key="item.id"
              class="name-item"
              @click="handleClick(item)"
          >
            <div class="name-content">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  currentLevel: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['item-click'])

// Data handling
const displayData = computed(() => {
  console.log('Current level:', props.currentLevel)
  console.log('Received data:', props.data)
  return Array.isArray(props.data) ? props.data : []
})

// Alphabet handling
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const currentLetter = ref(null)

// Get items for a specific letter
const getItemsByLetter = (letter) => {
  return displayData.value.filter(item =>
      item?.name?.toUpperCase().startsWith(letter)
  )
}

// Check if letter has items
const hasItemsForLetter = (letter) => {
  return getItemsByLetter(letter).length > 0
}

// Find first letter with items
const findFirstLetterWithItems = () => {
  return alphabet.find(letter => hasItemsForLetter(letter)) || 'A'
}

// Set initial letter when data changes
watch(displayData, () => {
  if (!currentLetter.value || !hasItemsForLetter(currentLetter.value)) {
    currentLetter.value = findFirstLetterWithItems()
  }
}, { immediate: true })

// Current letter items
const currentLetterItems = computed(() => {
  return getItemsByLetter(currentLetter.value)
})

// Set current letter
const setCurrentLetter = (letter) => {
  if (hasItemsForLetter(letter)) {
    currentLetter.value = letter
  }
}

// Click handler
const handleClick = (item) => {
  console.log('HierarchyView - Clicked item:', item)
  if (item && item.id) {
    emit('item-click', item)
  }
}
</script>

<style scoped>
.hierarchy-view {
  height: 100%;
  background-color: #f8f9fa;
  padding: 1rem;
}

/* Card view styles */
.card-view {
  padding: 1rem;
}

.hierarchy-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.hierarchy-item {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.hierarchy-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.item-content {
  z-index: 1;
}

.item-name {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.75rem;
}

.item-description {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.5;
}

/* Individual styles for different families */
.hierarchy-item:nth-child(1) {
  background: linear-gradient(135deg, white, #e8f4ff);
}

.hierarchy-item:nth-child(2) {
  background: linear-gradient(135deg, white, #f0e8ff);
}

.hierarchy-item:nth-child(3) {
  background: linear-gradient(135deg, white, #e8fff0);
}

/* Names grid styles - 保持原有的字母索引样式不变 */
.alphabet-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Alphabet view styles */
.alphabet-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.alphabet-nav {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  flex-wrap: wrap;
}

.letter-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 1rem;
  color: #9ca3af;
  cursor: default;
  transition: all 0.2s ease;
}

.letter-button.has-items {
  color: #374151;
  cursor: pointer;
}

.letter-button.active {
  color: #4f46e5;
  font-weight: 600;
}

.letter-button.has-items:hover {
  color: #4f46e5;
}

.names-container {
  padding: 0 1rem;
  overflow: hidden;
}

.names-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;  /* 抵消子元素的margin */
}

.name-item {
  flex: 0 0 auto;
  width: calc(20% - 1rem);  /* 每行5个，考虑margin */
  margin: 0.5rem;
  text-align: left;
}

.name-content {
  padding: 0.5rem;
  cursor: pointer;
  font-style: italic;
  color: #1d4ed8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-content:hover {
  color: #4f46e5;
}

@media (max-width: 1400px) {
  .name-item {
    width: calc(25% - 1rem);  /* 每行4个 */
  }
}

@media (max-width: 1100px) {
  .name-item {
    width: calc(33.333% - 1rem);  /* 每行3个 */
  }
}

@media (max-width: 800px) {
  .name-item {
    width: calc(50% - 1rem);  /* 每行2个 */
  }
}

@media (max-width: 500px) {
  .name-item {
    width: calc(100% - 1rem);  /* 每行1个 */
  }
}
</style>