// BrowseView.vue
<template>
  <div class="browse-container">
    <!-- 固定头部区域 -->
    <header class="fixed-header">
      <SearchBar @search="handleSearch" />
      <BreadcrumbNav
          :path="currentPath"
          :current-level="currentLevel"
          :show-detail="showDetail"
          @click="handleBreadcrumbClick"
          @level-change="handleLevelChange"
          @root-click="handleRootClick"
      />
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <transition name="page" mode="out-in">
        <div class="taxonomy-content" :key="currentLevel + (currentParentId || 'root')">
          <HierarchyView
              :currentLevel="currentLevel"
              :data="currentLevelData"
              @item-click="handleItemClick"
          />
        </div>
      </transition>

      <!-- 详情页面 -->
      <transition name="detail">
        <div v-if="showDetail" class="detail-panel">
          <DetailView
              :itemData="selectedItem"
              @close="closeDetail"
          />
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchBar from './SearchBar.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import HierarchyView from './HierarchyView.vue'
import DetailView from './DetailView.vue'
import { taxonomyData, getChildren, searchTaxonomy } from '@/mock/browseMock.js'

// 状态管理
const currentLevel = ref('family')
const currentPath = ref([])
const showDetail = ref(false)
const selectedItem = ref(null)
const currentParentId = ref(null)

// 计算当前层级要显示的数据
const currentLevelData = computed(() => {
  if (currentLevel.value === 'family') {
    return taxonomyData.family;
  } else if (currentLevel.value === 'genus') {
    const parentPhylum = taxonomyData.family.find(p => p.id === currentParentId.value);
    return parentPhylum ? parentPhylum.children.map(id => taxonomyData.genus[id]) : [];
  } else if (currentLevel.value === 'species') {
    const parentGenus = taxonomyData.genus[currentParentId.value];
    return parentGenus ? parentGenus.children.map(id => taxonomyData.species[id]) : [];
  }
  return [];
})

// 搜索处理
const handleSearch = (keyword) => {
  if (!keyword.trim()) return;
  const results = searchTaxonomy(keyword);
  console.log('Search results:', results);
}

// 项目点击处理
const handleItemClick = (item) => {
  if (item.type === 'species') {
    selectedItem.value = item;
    showDetail.value = true;
    const levelIndex = currentPath.value.findIndex(p => p.type === item.type);
    if (levelIndex !== -1) {
      currentPath.value = [...currentPath.value.slice(0, levelIndex), item];
    } else {
      currentPath.value = [...currentPath.value, item];
    }
  } else {
    currentLevel.value = item.type === 'family' ? 'genus' : 'species';
    currentParentId.value = item.id;
    const levelIndex = currentPath.value.findIndex(p => p.type === item.type);
    if (levelIndex !== -1) {
      currentPath.value = [...currentPath.value.slice(0, levelIndex), item];
    } else {
      currentPath.value = [...currentPath.value, item];
    }
  }
}

// 处理面包屑项目点击（导航到之前的层级）
const handleBreadcrumbClick = ({ index, item }) => {
  currentPath.value = currentPath.value.slice(0, index + 1);
  currentLevel.value = item.type === 'family' ? 'genus' : 'species';
  currentParentId.value = item.id;

  if (showDetail.value) {
    closeDetail();
  }
}

// 处理面包屑下拉选择（切换到新的选项）
const handleLevelChange = ({ index, item }) => {
  currentPath.value = [...currentPath.value.slice(0, index), item];
  currentLevel.value = item.type === 'family' ? 'genus' : 'species';
  currentParentId.value = item.id;

  if (showDetail.value) {
    closeDetail();
  }
}

// 处理根目录点击
const handleRootClick = () => {
  currentPath.value = [];
  currentLevel.value = 'family';
  currentParentId.value = null;

  if (showDetail.value) {
    closeDetail();
  }
}

// 关闭详情
const closeDetail = () => {
  showDetail.value = false
  selectedItem.value = null
}
</script>

<style scoped>
.browse-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.5rem;
  background: #f8fafc;
}

.search-input {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 1rem;
  background: white;
  font-size: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 12px -1px rgba(0, 0, 0, 0.15);
}

.main-content {
  margin-top: 120px;
  padding: 1rem;
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #f8fafc;
}

.taxonomy-content {
  height: 100%;
  overflow-y: auto;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translate(0, 30px);
}

.page-leave-to {
  opacity: 0;
  transform: translate(0, -30px);
}

/* 详情页动画 */
.detail-panel {
  position: fixed;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 50;
}

.detail-enter-active,
.detail-leave-active {
  transition: transform 0.3s ease;
}

.detail-enter-from,
.detail-leave-to {
  transform: translateY(100%);
}
</style>