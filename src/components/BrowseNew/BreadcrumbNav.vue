// BreadcrumbNav.vue
<template>
  <div class="breadcrumb">
    <!-- Root link -->
    <span
        class="breadcrumb-item clickable"
        :class="{ 'current': !path.length }"
        @click="handleRootClick"
    >
      Cypriniformes
    </span>

    <!-- 根目录与第一个导航项之间的分隔符 -->
    <div class="breadcrumb-separator" v-if="path.length > 0">></div>

    <div
        v-for="(item, index) in path"
        :key="index"
        class="breadcrumb-item"
    >
      <div class="breadcrumb-separator" v-if="index > 0">></div>

      <div class="breadcrumb-content" :class="{ 'current': isCurrentLevel(index) }">
        <div class="breadcrumb-item-content">
          <!-- 可点击的文本（用于导航到该层级） -->
          <span
              v-if="!isCurrentLevel(index)"
              class="item-name clickable"
              @click="handleItemClick(index, item)"
          >
            {{ item.name }}
          </span>

          <!-- 当前层级（不可点击） -->
          <span v-else class="item-name current">
            {{ item.name }}
          </span>

          <!-- 下拉菜单触发器（仅在非当前层级显示） -->
          <span
              v-if="!isCurrentLevel(index)"
              class="dropdown-arrow"
              @click="toggleDropdown(index)"
          >
            ▼
          </span>
        </div>

        <!-- 下拉菜单 -->
        <div
            v-if="!isCurrentLevel(index) && activeDropdown === index"
            class="dropdown-menu"
            v-click-outside="() => closeDropdown()"
        >
          <div
              v-for="option in getOptionsForLevel(item.type)"
              :key="option.id"
              class="dropdown-item"
              :class="{ 'active': option.id === item.id }"
              @click="handleOptionSelect(index, option)"
          >
            {{ option.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { taxonomyData } from '@/mock/browseMock.js'

const props = defineProps({
  path: {
    type: Array,
    required: true
  },
  currentLevel: {
    type: String,
    required: true
  },
  showDetail: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['navigate', 'levelChange', 'click', 'root-click'])

// 处理根目录点击
const handleRootClick = () => {
  emit('root-click')
}

// 处理项目点击（导航到该层级）
const handleItemClick = (index, item) => {
  emit('click', { index, item })
}

const activeDropdown = ref(null)

// 判断是否是当前层级
const isCurrentLevel = (index) => {
  return index === props.path.length - 1
}

// 切换下拉菜单
const toggleDropdown = (index) => {
  activeDropdown.value = activeDropdown.value === index ? null : index
}

// 关闭下拉菜单
const closeDropdown = () => {
  activeDropdown.value = null
}

// 获取当前层级的所有选项
const getOptionsForLevel = (type) => {
  switch (type) {
    case 'family':
      return taxonomyData.family
    case 'genus':
      // 获取当前科下的所有属
      const phylumId = props.path[0].id
      const phylum = taxonomyData.family.find(p => p.id === phylumId)
      return phylum ? phylum.children.map(id => taxonomyData.genus[id]) : []
    case 'species':
      // 获取当前属下的所有种
      const genusId = props.path[1].id
      const genus = taxonomyData.genus[genusId]
      return genus ? genus.children.map(id => taxonomyData.species[id]) : []
    default:
      return []
  }
}

// 处理选项选择
const handleOptionSelect = (index, option) => {
  closeDropdown()
  emit('levelChange', { index, item: option })
}

// 添加点击外部关闭下拉菜单的指令
const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #6b7280;
}

.breadcrumb-content {
  position: relative;
}

.breadcrumb-item-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.item-name {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.item-name.clickable {
  cursor: pointer;
}

.item-name.clickable:hover {
  background-color: #f3f4f6;
}

.item-name.current {
  font-weight: 500;
  color: #374151;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.dropdown-arrow:hover {
  background-color: #f3f4f6;
}

.current-level {
  padding: 0.25rem 0.5rem;
  color: #374151;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
  margin-top: 0.25rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.active {
  background-color: #e5e7eb;
}
</style>