<template>
  <div class="filter-sidebar">
    <div class="filter-header">
      <h3 class="filter-title">Filters</h3>
      <button v-if="hasActiveFilters" class="clear-all-btn" @click="clearAllFilters">
        Clear All
      </button>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="active-filters">
      <div class="active-filter-tags">
        <el-tag
          v-for="tag in activeFilterTags"
          :key="tag.key"
          closable
          size="small"
          @close="removeFilter(tag)"
        >
          {{ tag.label }}
        </el-tag>
      </div>
    </div>

    <!-- Taxonomy Filters -->
    <el-collapse v-model="expandedPanels" class="filter-collapse">
      <!-- Family Filter -->
      <el-collapse-item name="family" class="filter-section">
        <template #title>
          <div class="section-header">
            <span class="section-title">Family</span>
            <span v-if="selectedFilters.family.length" class="filter-count">
              ({{ selectedFilters.family.length }})
            </span>
          </div>
        </template>
        <div class="filter-content">
          <el-input
            v-model="searchTexts.family"
            placeholder="Search families..."
            size="small"
            clearable
            class="filter-search"
          />
          <el-checkbox-group
            v-model="selectedFilters.family"
            class="checkbox-group"
            @change="onFilterChange"
          >
            <el-checkbox
              v-for="item in filteredOptions('family', aggregations.Taxon?.Family)"
              :key="item.key"
              :label="item.key"
              class="filter-checkbox"
            >
              <span class="checkbox-label">{{ item.key }}</span>
              <span class="checkbox-count">({{ item.doc_count }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="hasMoreItems('family', aggregations.Taxon?.Family)" class="show-more">
            <button @click="toggleShowMore('family')">
              {{ showMore.family ? 'Show Less' : 'Show More' }}
            </button>
          </div>
        </div>
      </el-collapse-item>

      <!-- Institution Code Filter -->
      <el-collapse-item name="institution" class="filter-section">
        <template #title>
          <div class="section-header">
            <span class="section-title">Institution</span>
            <span v-if="selectedFilters.institutionCode.length" class="filter-count">
              ({{ selectedFilters.institutionCode.length }})
            </span>
          </div>
        </template>
        <div class="filter-content">
          <el-input
            v-model="searchTexts.institution"
            placeholder="Search institutions..."
            size="small"
            clearable
            class="filter-search"
          />
          <el-checkbox-group
            v-model="selectedFilters.institutionCode"
            class="checkbox-group"
            @change="onFilterChange"
          >
            <el-checkbox
              v-for="item in filteredOptions('institution', aggregations.Occurrence?.InstitutionCode)"
              :key="item.key"
              :label="item.key"
              class="filter-checkbox"
            >
              <span class="checkbox-label">{{ item.key }}</span>
              <span class="checkbox-count">({{ item.doc_count }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="hasMoreItems('institution', aggregations.Occurrence?.InstitutionCode)" class="show-more">
            <button @click="toggleShowMore('institution')">
              {{ showMore.institution ? 'Show Less' : 'Show More' }}
            </button>
          </div>
        </div>
      </el-collapse-item>

      <!-- Country Filter -->
      <el-collapse-item name="country" class="filter-section">
        <template #title>
          <div class="section-header">
            <span class="section-title">Country</span>
            <span v-if="selectedFilters.country.length" class="filter-count">
              ({{ selectedFilters.country.length }})
            </span>
          </div>
        </template>
        <div class="filter-content">
          <el-input
            v-model="searchTexts.country"
            placeholder="Search countries..."
            size="small"
            clearable
            class="filter-search"
          />
          <el-checkbox-group
            v-model="selectedFilters.country"
            class="checkbox-group"
            @change="onFilterChange"
          >
            <el-checkbox
              v-for="item in filteredOptions('country', aggregations.Location?.Country)"
              :key="item.key"
              :label="item.key"
              class="filter-checkbox"
            >
              <span class="checkbox-label">{{ item.key }}</span>
              <span class="checkbox-count">({{ item.doc_count }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="hasMoreItems('country', aggregations.Location?.Country)" class="show-more">
            <button @click="toggleShowMore('country')">
              {{ showMore.country ? 'Show Less' : 'Show More' }}
            </button>
          </div>
        </div>
      </el-collapse-item>

      <!-- State/Province Filter -->
      <el-collapse-item name="stateProvince" class="filter-section">
        <template #title>
          <div class="section-header">
            <span class="section-title">State/Province</span>
            <span v-if="selectedFilters.stateProvince.length" class="filter-count">
              ({{ selectedFilters.stateProvince.length }})
            </span>
          </div>
        </template>
        <div class="filter-content">
          <el-input
            v-model="searchTexts.stateProvince"
            placeholder="Search states..."
            size="small"
            clearable
            class="filter-search"
          />
          <el-checkbox-group
            v-model="selectedFilters.stateProvince"
            class="checkbox-group"
            @change="onFilterChange"
          >
            <el-checkbox
              v-for="item in filteredOptions('stateProvince', aggregations.Location?.StateProvince)"
              :key="item.key"
              :label="item.key"
              class="filter-checkbox"
            >
              <span class="checkbox-label">{{ item.key }}</span>
              <span class="checkbox-count">({{ item.doc_count }})</span>
            </el-checkbox>
          </el-checkbox-group>
          <div v-if="hasMoreItems('stateProvince', aggregations.Location?.StateProvince)" class="show-more">
            <button @click="toggleShowMore('stateProvince')">
              {{ showMore.stateProvince ? 'Show Less' : 'Show More' }}
            </button>
          </div>
        </div>
      </el-collapse-item>

      <!-- Year Range Filter (Slider) -->
      <el-collapse-item name="year" class="filter-section">
        <template #title>
          <div class="section-header">
            <span class="section-title">Year Collected</span>
            <span v-if="isYearRangeActive" class="filter-count">
              ({{ selectedFilters.yearRange[0] }} - {{ selectedFilters.yearRange[1] }})
            </span>
          </div>
        </template>
        <div class="filter-content range-filter">
          <div class="range-inputs">
            <el-input-number
              v-model="selectedFilters.yearRange[0]"
              :min="yearBounds.min"
              :max="selectedFilters.yearRange[1]"
              size="small"
              controls-position="right"
              @change="onFilterChange"
            />
            <span class="range-separator">to</span>
            <el-input-number
              v-model="selectedFilters.yearRange[1]"
              :min="selectedFilters.yearRange[0]"
              :max="yearBounds.max"
              size="small"
              controls-position="right"
              @change="onFilterChange"
            />
          </div>
          <el-slider
            v-model="selectedFilters.yearRange"
            range
            :min="yearBounds.min"
            :max="yearBounds.max"
            :marks="yearMarks"
            class="range-slider"
            @change="onFilterChange"
          />
        </div>
      </el-collapse-item>

      <!-- Collection Code filter removed: not meaningful as a search facet. -->
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  aggregations: {
    type: Object,
    default: () => ({})
  },
  yearBounds: {
    type: Object,
    default: () => ({ min: 1800, max: new Date().getFullYear() })
  }
});

const emit = defineEmits(['filterChange']);

// Expanded panels
const expandedPanels = ref(['family', 'institution', 'country']);

// Search texts for filtering options
const searchTexts = ref({
  family: '',
  institution: '',
  country: '',
  stateProvince: ''
});

// Show more state
const showMore = ref({
  family: false,
  institution: false,
  country: false,
  stateProvince: false
});

const DEFAULT_VISIBLE_COUNT = 5;

// Selected filters
const selectedFilters = ref({
  family: [],
  institutionCode: [],
  country: [],
  stateProvince: [],
  yearRange: [props.yearBounds.min, props.yearBounds.max]
});

// Year marks for slider
const yearMarks = computed(() => {
  const { min, max } = props.yearBounds;
  const mid = Math.floor((min + max) / 2);
  return {
    [min]: String(min),
    [mid]: String(mid),
    [max]: String(max)
  };
});

// Check if year range is active (different from default)
const isYearRangeActive = computed(() => {
  return selectedFilters.value.yearRange[0] !== props.yearBounds.min ||
         selectedFilters.value.yearRange[1] !== props.yearBounds.max;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedFilters.value.family.length > 0 ||
         selectedFilters.value.institutionCode.length > 0 ||
         selectedFilters.value.country.length > 0 ||
         selectedFilters.value.stateProvince.length > 0 ||
         isYearRangeActive.value;
});

// Generate active filter tags
const activeFilterTags = computed(() => {
  const tags = [];

  selectedFilters.value.family.forEach(f => {
    tags.push({ key: `family-${f}`, label: f, type: 'family', value: f });
  });
  selectedFilters.value.institutionCode.forEach(i => {
    tags.push({ key: `inst-${i}`, label: i, type: 'institutionCode', value: i });
  });
  selectedFilters.value.country.forEach(c => {
    tags.push({ key: `country-${c}`, label: c, type: 'country', value: c });
  });
  selectedFilters.value.stateProvince.forEach(s => {
    tags.push({ key: `state-${s}`, label: s, type: 'stateProvince', value: s });
  });
  if (isYearRangeActive.value) {
    tags.push({
      key: 'year-range',
      label: `${selectedFilters.value.yearRange[0]}-${selectedFilters.value.yearRange[1]}`,
      type: 'yearRange',
      value: selectedFilters.value.yearRange
    });
  }

  return tags;
});

// Filter options based on search text
const filteredOptions = (type, options) => {
  if (!options) return [];

  const searchText = searchTexts.value[type]?.toLowerCase() || '';
  let filtered = options;

  if (searchText) {
    filtered = options.filter(item =>
      item.key.toLowerCase().includes(searchText)
    );
  }

  // Limit visible items unless "show more" is clicked
  if (!showMore.value[type]) {
    return filtered.slice(0, DEFAULT_VISIBLE_COUNT);
  }

  return filtered;
};

// Check if there are more items to show
const hasMoreItems = (type, options) => {
  if (!options) return false;
  const searchText = searchTexts.value[type]?.toLowerCase() || '';
  const filtered = searchText
    ? options.filter(item => item.key.toLowerCase().includes(searchText))
    : options;
  return filtered.length > DEFAULT_VISIBLE_COUNT;
};

// Toggle show more
const toggleShowMore = (type) => {
  showMore.value[type] = !showMore.value[type];
};

// Remove individual filter
const removeFilter = (tag) => {
  if (tag.type === 'yearRange') {
    selectedFilters.value.yearRange = [props.yearBounds.min, props.yearBounds.max];
  } else {
    const index = selectedFilters.value[tag.type].indexOf(tag.value);
    if (index > -1) {
      selectedFilters.value[tag.type].splice(index, 1);
    }
  }
  onFilterChange();
};

// Clear all filters
const clearAllFilters = () => {
  selectedFilters.value = {
    family: [],
    institutionCode: [],
    country: [],
    stateProvince: [],
    yearRange: [props.yearBounds.min, props.yearBounds.max]
  };
  onFilterChange();
};

// Emit filter change
const onFilterChange = () => {
  const filters = {
    Family: selectedFilters.value.family,
    InstitutionCode: selectedFilters.value.institutionCode,
    Country: selectedFilters.value.country,
    StateProvince: selectedFilters.value.stateProvince,
    YearRange: isYearRangeActive.value ? selectedFilters.value.yearRange : null
  };

  // Remove empty arrays
  Object.keys(filters).forEach(key => {
    if (Array.isArray(filters[key]) && filters[key].length === 0) {
      delete filters[key];
    }
    if (filters[key] === null) {
      delete filters[key];
    }
  });

  emit('filterChange', filters);
};

// Watch for yearBounds changes to reset range
watch(() => props.yearBounds, (newBounds) => {
  if (!isYearRangeActive.value) {
    selectedFilters.value.yearRange = [newBounds.min, newBounds.max];
  }
}, { deep: true });

// Expose method to reset filters
defineExpose({
  clearAllFilters
});
</script>

<style scoped>
.filter-sidebar {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  background: #fafbfc;
}

.filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.clear-all-btn {
  padding: 4px 10px;
  font-size: 12px;
  color: #e74c3c;
  background: transparent;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #e74c3c;
  color: white;
}

.active-filters {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.active-filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-collapse {
  border: none;
}

.filter-collapse :deep(.el-collapse-item__header) {
  padding: 0 16px;
  height: 44px;
  font-size: 13px !important;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
}

.filter-collapse :deep(.el-collapse-item__content) {
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title {
  font-size: 13px !important;
  font-weight: 500;
  color: #2c3e50;
}

.filter-count {
  font-size: 11px !important;
  color: #3498db;
  font-weight: 600;
}

.filter-content {
  padding: 12px 16px 16px;
}

.filter-search {
  margin-bottom: 10px;
}

.filter-search :deep(.el-input__inner) {
  font-size: 12px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.filter-checkbox {
  display: flex !important;
  align-items: center;
  padding: 6px 8px;
  margin: 0 !important;
  border-radius: 4px;
  transition: background 0.15s;
}

.filter-checkbox:hover {
  background: #f5f7fa;
}

.filter-checkbox :deep(.el-checkbox__label) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: 8px;
  font-size: 13px;
}

.checkbox-label {
  color: #2c3e50;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checkbox-count {
  color: #999;
  font-size: 11px;
  margin-left: 8px;
  flex-shrink: 0;
}

.show-more {
  margin-top: 8px;
  text-align: center;
}

.show-more button {
  padding: 4px 12px;
  font-size: 12px;
  color: #3498db;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.show-more button:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* Range Filter Styles */
.range-filter {
  padding-top: 8px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.range-inputs :deep(.el-input-number) {
  width: 90px;
}

.range-inputs :deep(.el-input-number .el-input__inner) {
  padding-left: 8px;
  padding-right: 32px;
}

.range-separator {
  color: #999;
  font-size: 13px;
}

.range-slider {
  padding: 0 6px;
}

.range-slider :deep(.el-slider__marks-text) {
  font-size: 10px;
  color: #999;
}

/* Scrollbar styles */
.checkbox-group::-webkit-scrollbar {
  width: 6px;
}

.checkbox-group::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.checkbox-group::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.checkbox-group::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
