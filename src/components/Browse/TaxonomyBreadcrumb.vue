<template>
  <nav class="taxonomy-breadcrumb" aria-label="Taxonomic hierarchy">
    <ol class="breadcrumb-list">
      <!-- Home link -->
      <li class="breadcrumb-item">
        <router-link to="/browse" class="breadcrumb-link">
          <span class="icon">🏠</span>
          Browse
        </router-link>
      </li>

      <!-- Taxonomic hierarchy items -->
      <li v-if="hierarchy.kingdom" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-text">
          <span class="dc-field">kingdom:</span> {{ hierarchy.kingdom }}
        </span>
      </li>

      <li v-if="hierarchy.phylum" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-text">
          <span class="dc-field">phylum:</span> {{ hierarchy.phylum }}
        </span>
      </li>

      <li v-if="hierarchy.class" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-text">
          <span class="dc-field">class:</span> {{ hierarchy.class }}
        </span>
      </li>

      <li v-if="hierarchy.order" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-text">
          <span class="dc-field">order:</span> {{ hierarchy.order }}
        </span>
      </li>

      <li v-if="hierarchy.family" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <router-link
            v-if="current.type !== 'family'"
            :to="{ name: 'FamilyDetail', params: { familyName: hierarchy.family } }"
            class="breadcrumb-link"
        >
          <span class="dc-field">family:</span> {{ hierarchy.family }}
        </router-link>
        <span v-else class="breadcrumb-text current">
          <span class="dc-field">family:</span> {{ hierarchy.family }}
        </span>
      </li>

      <li v-if="hierarchy.genus" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <router-link
            v-if="current.type !== 'genus'"
            :to="{ name: 'GenusDetail', params: { genusName: hierarchy.genus } }"
            class="breadcrumb-link"
        >
          <span class="dc-field">genus:</span> {{ hierarchy.genus }}
        </router-link>
        <span v-else class="breadcrumb-text current">
          <span class="dc-field">genus:</span> {{ hierarchy.genus }}
        </span>
      </li>

      <li v-if="current.type === 'species'" class="breadcrumb-item">
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-text current">
          <span class="dc-field">species:</span>
          <span class="species-name">{{ current.name }}</span>
        </span>
      </li>
    </ol>

    <!-- Quick navigation buttons -->
    <div class="quick-nav">
      <button
          v-if="hasParent"
          @click="navigateToParent"
          class="nav-button parent"
          :title="`Go to parent ${getParentType()}`"
      >
        <span class="icon">↑</span>
        <span class="text">{{ getParentName() }}</span>
      </button>

      <button
          v-if="hasChildren"
          @click="showChildren"
          class="nav-button children"
          :title="`View ${getChildrenType()}`"
      >
        <span class="icon">↓</span>
        <span class="text">{{ getChildrenText() }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  hierarchy: {
    type: Object,
    default: () => ({})
  },
  current: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && ['family', 'genus', 'species'].includes(value.type) && value.name
    }
  }
})

// Emits
const emit = defineEmits(['show-children'])

const router = useRouter()

// Computed properties
const hasParent = computed(() => {
  if (props.current.type === 'species') return !!props.hierarchy.genus
  if (props.current.type === 'genus') return !!props.hierarchy.family
  if (props.current.type === 'family') return !!props.hierarchy.order
  return false
})

const hasChildren = computed(() => {
  return props.current.type === 'family' || props.current.type === 'genus'
})

const getParentType = () => {
  if (props.current.type === 'species') return 'genus'
  if (props.current.type === 'genus') return 'family'
  if (props.current.type === 'family') return 'order'
  return ''
}

const getParentName = () => {
  if (props.current.type === 'species') return props.hierarchy.genus
  if (props.current.type === 'genus') return props.hierarchy.family
  if (props.current.type === 'family') return props.hierarchy.order
  return ''
}

const getChildrenType = () => {
  if (props.current.type === 'family') return 'genera'
  if (props.current.type === 'genus') return 'species'
  return ''
}

const getChildrenText = () => {
  if (props.current.type === 'family') return 'View Genera'
  if (props.current.type === 'genus') return 'View Species'
  return ''
}

// Methods
const navigateToParent = () => {
  const parentType = getParentType()
  const parentName = getParentName()

  if (parentType === 'genus') {
    router.push({
      name: 'GenusDetail',
      params: { genusName: parentName }
    })
  } else if (parentType === 'family') {
    router.push({
      name: 'FamilyDetail',
      params: { familyName: parentName }
    })
  }
  // Note: We don't have order pages, so we don't navigate to orders
}

const showChildren = () => {
  emit('show-children')
}
</script>

<style scoped>
.taxonomy-breadcrumb {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-separator {
  color: #999;
  font-size: 14px;
  user-select: none;
}

.breadcrumb-link {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.breadcrumb-link:hover {
  background: #e3f2fd;
  text-decoration: none;
}

.breadcrumb-text {
  font-size: 14px;
  color: #666;
  padding: 4px 8px;
}

.breadcrumb-text.current {
  color: #2c3e50;
  font-weight: 500;
  background: #f0f0f0;
  border-radius: 4px;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #3498db;
  font-weight: normal;
  margin-right: 4px;
}

.species-name {
  font-style: italic;
}

.icon {
  font-size: 12px;
}

/* Quick Navigation */
.quick-nav {
  display: flex;
  gap: 8px;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  color: #666;
}

.nav-button:hover {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
}

.nav-button.parent .icon {
  transform: rotate(-45deg);
}

.nav-button.children .icon {
  transform: rotate(45deg);
}

.nav-button .text {
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .taxonomy-breadcrumb {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .breadcrumb-list {
    justify-content: center;
    text-align: center;
  }

  .breadcrumb-item {
    flex-wrap: wrap;
    justify-content: center;
  }

  .quick-nav {
    justify-content: center;
  }

  .nav-button .text {
    display: none;
  }

  .nav-button {
    width: 36px;
    height: 36px;
    justify-content: center;
    padding: 0;
  }
}

@media (max-width: 480px) {
  .breadcrumb-list {
    flex-direction: column;
    gap: 4px;
  }

  .breadcrumb-item {
    width: 100%;
    justify-content: center;
  }

  .breadcrumb-separator {
    display: none;
  }

  .breadcrumb-item:not(:first-child)::before {
    content: '↓';
    color: #999;
    margin-bottom: 4px;
    font-size: 12px;
  }
}
</style>