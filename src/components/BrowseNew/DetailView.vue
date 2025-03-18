<!-- DetailView.vue -->
<template>
  <div class="detail-view">
    <!-- 头部区域 -->
    <div class="detail-header">
      <button class="back-button" @click="$emit('close')">
        ← Back
      </button>

      <!-- 物种名称区域 -->
      <div class="species-header">
        <h1 class="scientific-name">{{ itemData.name }}</h1>
        <div class="taxonomy-status">
          <span class="status-tag" :class="{ 'accepted': isAccepted }">
            {{ isAccepted ? 'Accepted' : 'Not Accepted' }}
          </span>
        </div>

        <!-- 同义名列表 -->
        <div class="synonyms-section" v-if="synonyms.length">
          <h3>Synonyms:</h3>
          <ul class="synonyms-list">
            <li v-for="syn in synonyms" :key="syn.name" class="synonym-item">
              {{ syn.name }}
              <span class="year" v-if="syn.year">({{ syn.year }})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="tab-navigation">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <!-- 基本信息 Tab -->
      <div v-if="currentTab === 'info'" class="info-tab">
        <!-- 上栏：分类信息和分布地图 -->
        <div class="top-row">
          <!-- 分类信息区域（左） -->
          <div class="classification-section">
            <div class="info-section">
              <h3>Classification</h3>
              <div class="classification-info">
                <div class="info-row">
                  <span class="label">Kingdom:</span>
                  <span class="value">Animalia</span>
                </div>
                <div class="info-row">
                  <span class="label">Phylum:</span>
                  <span class="value">Chordata</span>
                </div>
                <div class="info-row">
                  <span class="label">Class:</span>
                  <span class="value">Actinopterygii</span>
                </div>
                <div class="info-row">
                  <span class="label">Order:</span>
                  <span class="value">Cypriniformes</span>
                </div>
                <div class="info-row">
                  <span class="label">Family:</span>
                  <span class="value">Cyprinidae</span>
                </div>
                <div class="info-row">
                  <span class="label">Genus:</span>
                  <span class="value">Cyprinus</span>
                </div>
                <div class="info-row">
                  <span class="label">Species:</span>
                  <span class="value">carpio</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分布地图（右） -->
          <div class="map-section">
            <div class="info-section">
              <h3>Occurrences Distribution</h3>
              <div class="distribution-container">
                <img :src="distributionMap" alt="Global distribution of Cyprinus carpio" class="distribution-map" />
              </div>
            </div>
          </div>
        </div>

        <!-- 下栏：图片展示区域 -->
        <div class="bottom-row">
          <div class="info-section">
            <h3>Species Images</h3>
            <div class="images-container">
              <div v-for="(image, index) in speciesImages" :key="index" class="image-item">
                <img :src="image.url" :alt="image.caption || 'Cyprinus carpio image'" class="species-image" @click="openImageViewer(index)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 记录数据 Tab -->
      <div v-if="currentTab === 'records'" class="records-tab">
        <div class="table-container">
          <table class="records-table">
            <thead>
            <tr>
              <th>Catalog Number</th>
              <th>Institution</th>
              <th>Country</th>
              <th>Locality</th>
              <th>Date</th>
              <th>Collector</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.catalogNumber }}</td>
              <td>{{ record.institution }}</td>
              <td>{{ record.country }}</td>
              <td>{{ record.locality }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.collector }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div class="image-viewer" v-if="showImageViewer" @click="closeImageViewer">
      <div class="image-viewer-content" @click.stop>
        <button class="close-button" @click="closeImageViewer">×</button>
        <img :src="speciesImages[currentImageIndex].url" :alt="speciesImages[currentImageIndex].caption || 'Species image'" class="viewer-image" />
        <div class="image-caption-full" v-if="speciesImages[currentImageIndex].caption">
          {{ speciesImages[currentImageIndex].caption }}
        </div>
        <div class="image-navigation">
          <button class="nav-button prev" @click="navigateImage(-1)" :disabled="currentImageIndex === 0">⟨</button>
          <span class="image-counter">{{ currentImageIndex + 1 }} / {{ speciesImages.length }}</span>
          <button class="nav-button next" @click="navigateImage(1)" :disabled="currentImageIndex === speciesImages.length - 1">⟩</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  itemData: {
    type: Object,
    required: true
  }
})

// Tab 管理
const tabs = [
  { id: 'info', label: 'Information' },
  { id: 'records', label: 'Records' }
]
const currentTab = ref('info')

// 计算属性
const isAccepted = computed(() => true) // 根据实际数据计算
const synonyms = computed(() => [
  { name: 'Cyprinus auratus Linnaeus, 1758', year: 1758 },
  { name: 'Cyprinus carpio caspicus', year: null }
])
const records = computed(() => [
  {
    id: 1,
    catalogNumber: 'USNM 12345',
    institution: 'NMNH',
    country: 'China',
    locality: 'Yangtze River',
    date: '1985-06-15',
    collector: 'John Smith'
  },
  // 添加更多记录...
])

// 地图URL - 使用热力图
import distributionMapImage from '@/assets/details/heatmap.png'
import image1 from '@/assets/details/6841Dp2F.jpg'
import image2 from '@/assets/details/vw690124.png'
import image3 from '@/assets/details/hz01t11m.png'
import image4 from '@/assets/details/7w33bn1r.png'
const distributionMap = ref(distributionMapImage)

// 物种图片数据
const speciesImages = ref([
  {
    url: image1,
    caption: 'Adult Common Carp (Cyprinus carpio) in natural habitat'
  },
  {
    url: image2,
    caption: 'Juvenile specimen of Cyprinus carpio'
  },
  {
    url: image3,
    caption: 'Common Carp (Cyprinus carpio) - dorsal view'
  },
  {
    url: image4,
    caption: 'Common Carp (Cyprinus carpio) - lateral view'
  }
])

// 图片查看器
const showImageViewer = ref(false)
const currentImageIndex = ref(0)

const openImageViewer = (index) => {
  currentImageIndex.value = index
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const navigateImage = (direction) => {
  const newIndex = currentImageIndex.value + direction
  if (newIndex >= 0 && newIndex < speciesImages.value.length) {
    currentImageIndex.value = newIndex
  }
}
</script>

<style scoped>
.detail-view {
  height: 100%;
  overflow-y: auto;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
}

.detail-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: #e5e7eb;
}

.species-header {
  margin-top: 1rem;
}

.scientific-name {
  font-size: 2rem;
  font-style: italic;
  font-weight: 600;
  margin: 0;
}

.taxonomy-status {
  margin-top: 0.5rem;
}

.status-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #fee2e2;
  color: #991b1b;
}

.status-tag.accepted {
  background: #dcfce7;
  color: #166534;
}

.synonyms-section {
  margin-top: 1rem;
}

.synonyms-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.synonym-item {
  font-style: italic;
  margin: 0.25rem 0;
  color: #4b5563;
}

.synonym-item .year {
  font-style: normal;
  color: #6b7280;
}

.tab-navigation {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 上栏布局 - 分类和地图 */
.top-row {
  display: flex;
  gap: 1.5rem;
}

.classification-section {
  flex: 1;
  min-width: 300px;
  max-width: 350px; /* 控制分类信息区域的最大宽度 */
}

.map-section {
  flex: 3; /* 让地图区域占据更多空间 */
}

/* 下栏 - 图片区域 */
.bottom-row {
  flex: 1;
}

.info-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.info-row {
  display: flex;
  margin: 0.5rem 0;
}

.info-row .label {
  width: 120px;
  font-weight: 500;
  color: #4b5563;
}

/* 分布地图容器 */
.distribution-container {
  width: 100%;
  max-height: 220px;
  overflow: hidden;
  border-radius: 0.375rem;
  position: relative;
  padding-top: 25%; /* 进一步缩小高度比例 */
}

.distribution-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片完整显示不拉伸 */
}

/* 图片网格样式 */
.images-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4列 */
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.image-item {
  position: relative;
  aspect-ratio: 4/3; /* 使用aspect-ratio确保固定比例 */
  overflow: hidden;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.species-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为contain确保图片按原比例显示 */
  background-color: #f1f5f9; /* 添加浅色背景，让图片更好辨识 */
  transition: transform 0.2s;
  cursor: pointer;
}

.species-image:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-row {
    flex-direction: column;
  }

  .classification-section,
  .map-section {
    max-width: none;
  }

  .images-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 记录表格样式 */
.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.records-table th {
  background: #f9fafb;
  font-weight: 500;
  color: #374151;
}

.records-table tr:hover {
  background: #f9fafb;
}

/* 图片查看器 */
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-button {
  position: absolute;
  top: -30px;
  right: -30px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.viewer-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.image-caption-full {
  color: white;
  margin-top: 1rem;
  font-size: 1rem;
  text-align: center;
}

.image-navigation {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.nav-button:disabled {
  color: #6b7280;
  cursor: not-allowed;
}

.image-counter {
  color: white;
  font-size: 0.875rem;
}
</style>