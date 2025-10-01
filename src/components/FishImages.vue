<template>
  <div class="fish-images">
    <div class="images-header">
      <h3>Fish-AIR Images</h3>
      <div v-if="loading" class="loading-indicator">Loading images...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <!-- 图片类型筛选和统计 -->
    <div v-if="Object.keys(imageStats).length > 0" class="image-filters">
      <h4>Image Types & Statistics</h4>
      <div class="filter-buttons">
        <button
          @click="selectImageType('all')"
          :class="['filter-btn', { active: selectedType === 'all' }]"
        >
          All Images ({{ totalImages }})
        </button>
        <button
          v-for="(count, type) in imageStats"
          :key="type"
          @click="selectImageType(type)"
          :class="['filter-btn', { active: selectedType === type }]"
        >
          {{ formatImageType(type) }} ({{ count }})
        </button>
      </div>
    </div>

    <!-- 图片网格 -->
    <div v-if="images.length > 0" class="images-grid">
      <div
        v-for="(image, index) in images"
        :key="image.ark_id || index"
        class="image-card"
        @click="openImageModal(image, index)"
      >
        <div class="image-container">
          <img
            :src="getImageUrl(image.path)"
            :alt="`Fish image for ${scientificName}`"
            class="fish-image"
            loading="lazy"
            @error="handleImageError"
          />
          <div class="image-type-badge" :class="getImageTypeBadgeClass(image.dataset)">
            {{ formatImageType(image.dataset) }}
          </div>
          <div v-if="hasChildren(image)" class="tree-indicator" title="Has children images">
            🌳
          </div>
          <div class="image-overlay">
            <div class="image-info">
              <p class="filename">{{ image.filename || 'Unknown' }}</p>
              <p class="ark-id">ARK: {{ image.ark_id }}</p>
              <p class="dataset-type">Type: {{ formatImageType(image.dataset) }}</p>
              <div v-if="image.license || image.source" class="copyright-info">
                <p v-if="image.license" class="license">© {{ image.license }}</p>
                <p v-if="image.source" class="source">Source: {{ image.source }}</p>
                <p v-if="image.owner_institution_code" class="institution">{{ image.owner_institution_code }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <div v-if="hasMore && !loading && images.length > 0" class="load-more-container">
      <button @click="loadMoreImages" class="load-more-btn">
        Load More Images ({{ images.length }}/{{ totalImages }})
      </button>
    </div>

    <!-- 查看所有图片按钮 -->
    <div v-if="totalImages > 100" class="view-all-container">
      <button @click="redirectToFishAIR" class="view-all-btn">
        View All {{ totalImages }} Images in Fish-AIR →
      </button>
    </div>

    <!-- 无图片时的占位符 -->
    <div v-else-if="!loading && !error" class="no-images">
      <div class="no-images-icon">🐠</div>
      <p>No images available for <em>{{ scientificName }}</em></p>
      <p class="no-images-hint">Images may be available through other sources</p>
    </div>

    <!-- 图片模态框 -->
    <div v-if="showModal" class="image-modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ scientificName }}</h4>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <img 
            :src="getImageUrl(selectedImage?.path)" 
            :alt="`Fish image for ${scientificName}`"
            class="modal-image"
          />
          <div class="modal-info">
            <p><strong>Filename:</strong> {{ selectedImage?.filename || 'Unknown' }}</p>
            <p><strong>ARK ID:</strong> {{ selectedImage?.ark_id }}</p>
            <p><strong>Scientific Name:</strong> {{ selectedImage?.scientific_name }}</p>
            <p><strong>Image Type:</strong> {{ formatImageType(selectedImage?.dataset) }}</p>

            <!-- 版权信息 -->
            <div class="info-section">
              <div class="info-row" v-if="selectedImage?.license">
                <span class="info-label">License</span>
                <span class="info-value">{{ selectedImage.license }}</span>
              </div>
              <div class="info-row" v-if="selectedImage?.source">
                <span class="info-label">Source</span>
                <span class="info-value">{{ selectedImage.source }}</span>
              </div>
              <div class="info-row" v-if="selectedImage?.owner_institution_code">
                <span class="info-label">Institution</span>
                <span class="info-value">{{ selectedImage.owner_institution_code }}</span>
              </div>
            </div>

            <!-- 图片层级结构 - 合并 provenance 和 hierarchy -->
            <div class="hierarchy-section">
              <div class="hierarchy-header">
                <h5>Image Hierarchy</h5>
                <button
                  v-if="!imageTree"
                  @click="loadImageTree(selectedImage?.ark_id)"
                  class="hierarchy-toggle-btn"
                  :disabled="loadingTree"
                >
                  {{ loadingTree ? 'Loading...' : 'Expand' }}
                </button>
                <button
                  v-else
                  @click="closeImageTree"
                  class="hierarchy-toggle-btn collapse"
                >
                  Collapse
                </button>
              </div>

              <!-- 完整树结构 -->
              <div v-if="imageTree" class="hierarchy-tree">
                <div v-if="!imageTree.children || imageTree.children.length === 0" class="tree-standalone">
                  <div class="tree-node-content standalone" :class="{ current: imageTree.ark_id === selectedImage?.ark_id }">
                    <div class="tree-node-thumbnail-wrapper">
                      <img :src="getImageUrl(imageTree.path)" class="tree-node-thumbnail" alt="" loading="lazy" @error="e => e.target.style.display='none'" />
                    </div>
                    <span class="tree-node-icon">{{ getNodeIcon(imageTree.dataset) }}</span>
                    <span class="tree-node-label">
                      <strong>{{ formatImageType(imageTree.dataset) }}</strong> <span class="tree-node-id">{{ imageTree.ark_id }}</span>
                    </span>
                  </div>
                  <p class="tree-note">
                    {{ imageTree.parent_ark_id ? 'No children' : 'Standalone image' }}
                  </p>
                </div>
                <div v-else>
                  <TreeNode :node="imageTree" :depth="0" :currentArkId="selectedImage?.ark_id" @select-image="selectImageFromTree" />
                </div>
              </div>
              <div v-else class="hierarchy-collapsed">
                <div class="current-image-indicator">
                  <span class="tree-node-icon">{{ getNodeIcon(selectedImage?.dataset) }}</span>
                  <span class="current-type">{{ formatImageType(selectedImage?.dataset) }}</span>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="treeError" class="tree-error">
                {{ treeError }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-navigation" v-if="images.length > 1">
          <button 
            @click="previousImage" 
            :disabled="selectedIndex === 0"
            class="nav-btn prev-btn"
          >
            ← Previous
          </button>
          <span class="image-counter">{{ selectedIndex + 1 }} / {{ images.length }}</span>
          <button 
            @click="nextImage" 
            :disabled="selectedIndex === images.length - 1"
            class="nav-btn next-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineComponent, h } from 'vue'
import { fishairApi } from '@/api/fishair.js'

// Props
const props = defineProps({
  scientificName: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 5
  }
})

// Reactive data
const images = ref([])
const currentImages = ref([])
const imageStats = ref({})
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const selectedImage = ref(null)
const selectedIndex = ref(0)
const selectedType = ref('all')
const currentPage = ref(1)
const totalImages = ref(0)
const hasMore = ref(false)
const imageTree = ref(null)
const loadingTree = ref(false)
const treeError = ref('')

// TreeNode component definition
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: Object,
    depth: Number,
    currentArkId: String
  },
  emits: ['select-image'],
  setup(props, { emit }) {
    const expanded = ref(true)

    const toggleExpand = () => {
      expanded.value = !expanded.value
    }

    const selectImage = (arkId) => {
      emit('select-image', arkId)
    }

    return () => {
      const { node, depth, currentArkId } = props
      if (!node) return null

      const hasChildren = node.children && node.children.length > 0
      const indent = depth * 20
      const imageUrl = getImageUrl(node.path)
      const isCurrent = node.ark_id === currentArkId

      return h('div', { class: 'tree-node', style: { marginLeft: `${indent}px` } }, [
        h('div', {
          class: ['tree-node-content', { current: isCurrent }],
          onClick: () => selectImage(node.ark_id)
        }, [
          // 第一行：展开/折叠按钮 + 图标 + 类型 + ark_id + 链接
          h('div', { class: 'tree-node-header' }, [
            hasChildren && h('span', {
              class: 'tree-toggle',
              onClick: (e) => {
                e.stopPropagation()
                toggleExpand()
              }
            }, expanded.value ? '▼' : '▶'),
            h('strong', { class: 'tree-node-type' }, formatImageType(node.dataset)),
            ' ',
            h('a', {
              class: 'tree-node-link',
              href: `https://fishair.org/view/${node.ark_id}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              onClick: (e) => {
                e.stopPropagation()
              },
              title: 'Open in FishAIR'
            }, [
              h('span', { class: 'tree-node-id' }, node.ark_id),
              h('svg', {
                class: 'link-icon',
                viewBox: '0 0 20 20',
                fill: 'currentColor',
                xmlns: 'http://www.w3.org/2000/svg'
              }, [
                h('path', {
                  d: 'M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'
                }),
                h('path', {
                  d: 'M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'
                })
              ])
            ])
          ]),
          // 第二行：缩略图
          h('div', { class: 'tree-node-thumbnail-wrapper' }, [
            h('img', {
              src: imageUrl,
              class: 'tree-node-thumbnail',
              alt: node.ark_id,
              loading: 'lazy',
              onError: (e) => { e.target.style.display = 'none' }
            })
          ])
        ]),
        hasChildren && expanded.value && h('div', { class: 'tree-children' },
          node.children.map(child =>
            h(TreeNode, {
              node: child,
              depth: depth + 1,
              currentArkId: currentArkId,
              onSelectImage: (arkId) => emit('select-image', arkId)
            })
          )
        )
      ])
    }
  }
})

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://127.0.0.1:8003${path.startsWith('/') ? path : '/' + path}`
}

const getNodeIcon = (dataset) => {
  // 不使用 emoji，返回空字符串
  return ''
}

const formatImageType = (dataset) => {
  const typeMap = {
    'original': 'Original',
    'segmentation': 'Segmentation',
    'bounding_box': 'Bounding Box',
    'bounding box': 'Bounding Box',
    'landmark': 'Landmark'
  }
  // 如果 dataset 为 null、undefined 或不在列表中，显示为 Original
  if (!dataset || !typeMap[dataset]) {
    return 'Original'
  }
  return typeMap[dataset]
}

const loadFishImages = async (reset = true) => {
  if (!props.scientificName) return

  loading.value = true
  if (reset) {
    error.value = ''
    currentPage.value = 1
  }

  try {
    const options = {
      page: currentPage.value,
      per_page: 20,
      limit: props.limit
    }

    if (selectedType.value !== 'all') {
      options.dataset = selectedType.value
    }

    const response = await fishairApi.getFishImages(props.scientificName, options)

    if (response.success && response.data) {
      let newImages = response.data.images || []

      // 处理图片数据
      // 根据 dataset 字段：segmentation, bounding_box, landmark 是处理过的图片
      // 其他值都是原始图片
      newImages = newImages.map((image) => {
        const dataset = image.dataset || 'original'
        const isProcessed = ['segmentation', 'bounding_box', 'landmark'].includes(dataset)

        return {
          ...image,
          dataset: isProcessed ? dataset : 'original',
          // 版权信息从数据库字段获取，保持原始值
          license: image.license || null,
          source: image.source || null,
          owner_institution_code: image.owner_institution_code || null,
          // parent_ark_id 记录了图片之间的层级关系
          parent_ark_id: image.parent_ark_id || null
        }
      })

      if (reset) {
        images.value = newImages
      } else {
        images.value = [...images.value, ...newImages]
      }

      currentImages.value = images.value
      totalImages.value = response.data.total_images || newImages.length
      hasMore.value = images.value.length < totalImages.value

      if (response.data.stats) {
        imageStats.value = response.data.stats
      }
    } else {
      if (reset) images.value = []
      if (response.message && !response.success) {
        error.value = response.message
      }
    }
  } catch (err) {
    console.error('Error loading fish images:', err)
    error.value = 'Failed to load fish images'
    if (reset) images.value = []
  } finally {
    loading.value = false
  }
}

const loadImageStats = async () => {
  try {
    const response = await fishairApi.getImageStats(props.scientificName)
    if (response.success && response.data) {
      imageStats.value = response.data.stats || {}
    }
  } catch (err) {
    console.error('Error loading image stats:', err)
    imageStats.value = {}
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.parentNode.classList.add('error')
}

const hasChildren = (image) => {
  // 检查图片是否有子图片（简单判断，实际可以从API返回的数据中获取）
  return image.has_children === true || (image.children && image.children.length > 0)
}

const loadImageTree = async (arkId) => {
  if (!arkId) return

  loadingTree.value = true
  treeError.value = ''

  try {
    const response = await fishairApi.getImageTree(arkId)
    console.log('Tree API response:', response) // 调试日志

    if (response && response.data) {
      imageTree.value = response.data
      console.log('Loaded tree:', imageTree.value) // 调试日志

      // 检查树结构
      const hasChildren = response.data.children && response.data.children.length > 0
      const hasParent = response.data.parent_ark_id

      if (!hasChildren && !hasParent) {
        console.log('This is a standalone image with no parent or children')
      }
    } else {
      treeError.value = 'No hierarchy data available for this image'
      console.warn('No tree data in response:', response)
    }
  } catch (err) {
    console.error('Error loading image tree:', err)
    treeError.value = `Failed to load hierarchy: ${err.message || 'Unknown error'}`
  } finally {
    loadingTree.value = false
  }
}

const closeImageTree = () => {
  imageTree.value = null
  treeError.value = ''
}

const selectImageFromTree = (arkId) => {
  // 在当前加载的图片列表中查找该图片
  const imageIndex = images.value.findIndex(img => img.ark_id === arkId)
  if (imageIndex !== -1) {
    selectedImage.value = images.value[imageIndex]
    selectedIndex.value = imageIndex
    // 重新加载树结构以显示新选中的图片
    closeImageTree()
  }
}

const openImageModal = (image, index) => {
  selectedImage.value = image
  selectedIndex.value = index
  showModal.value = true
  // 清空之前的树结构
  closeImageTree()
  console.log('Modal opened with image:', image)
}

const closeModal = () => {
  showModal.value = false
  selectedImage.value = null
  closeImageTree()
}

const previousImage = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
    selectedImage.value = images.value[selectedIndex.value]
  }
}

const nextImage = () => {
  if (selectedIndex.value < images.value.length - 1) {
    selectedIndex.value++
    selectedImage.value = images.value[selectedIndex.value]
  }
}

const selectImageType = (type) => {
  selectedType.value = type
  loadFishImages(true)
}

const loadMoreImages = () => {
  currentPage.value++
  loadFishImages(false)
}

const redirectToFishAIR = () => {
  // 跳转到 FishAIR 官网，并传递 scientific_name 参数
  const fishairUrl = `https://fishair.org/search?scientific_name=${encodeURIComponent(props.scientificName)}`
  window.open(fishairUrl, '_blank')
}

const getImageTypeBadgeClass = (dataset) => {
  const classMap = {
    'original': 'badge-original',
    'segmentation': 'badge-segmentation',
    'bounding_box': 'badge-bbox',
    'landmark': 'badge-landmark'
  }
  return classMap[dataset] || 'badge-original'
}

const getProvenanceDescription = (dataset) => {
  const descriptions = {
    'bounding_box': 'This bounding box image was derived from an original fish image.',
    'segmentation': 'This segmentation image was derived from a bounding box image.',
    'landmark': 'This landmark image was derived from a segmentation image.'
  }
  return descriptions[dataset] || 'This is an original image.'
}

// Watch for changes in scientific name
watch(() => props.scientificName, () => {
  selectedType.value = 'all'
  loadFishImages()
  loadImageStats()
}, { immediate: true })

// Load images and stats on mount
onMounted(async () => {
  await loadImageStats()
  await loadFishImages()
})
</script>

<style scoped>
.fish-images {
  margin: 1.5rem 0;
  padding: 0;
  border: none;
  background: transparent;
}

.images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e9ecef;
}

.images-header h3 {
  margin: 0;
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.loading-indicator {
  color: #718096;
  font-style: italic;
  font-size: 0.875rem;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
  border-radius: 4px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e0;
}

.image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.fish-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.image-card:hover .fish-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 60%, transparent 100%);
  padding: 1.5rem 0.75rem 0.75rem;
  transform: translateY(calc(100% - 3rem));
  transition: transform 0.3s ease;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-info p {
  margin: 0.3rem 0;
  color: white;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.filename {
  font-weight: 600;
  font-size: 0.875rem;
}

.ark-id {
  opacity: 0.9;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.75rem;
}

.no-images {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-images-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-images-hint {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Modal styles */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 85vw;
  max-width: 1400px;
  height: 85vh;
  max-height: 900px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e1e5e9;
  flex-shrink: 0;
}

.modal-header h4 {
  margin: 0;
  font-style: italic;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  min-height: 0;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  grid-column: 1;
  align-self: start;
}

.modal-info {
  grid-column: 2;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.modal-info > p {
  margin: 0.5rem 0;
  font-size: 0.9375rem;
  color: #4a5568;
  line-height: 1.6;
}

.modal-info > p strong {
  color: #2d3748;
  font-weight: 600;
  min-width: 120px;
  display: inline-block;
}

.modal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e1e5e9;
  flex-shrink: 0;
  background: white;
}

.nav-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #0056b3;
}

.nav-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.image-counter {
  font-weight: 500;
  color: #495057;
}

/* 新增样式 */
.image-filters {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.image-filters h4 {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1rem;
  font-weight: 600;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.filter-btn {
  padding: 0.5rem 1.125rem;
  border: 1px solid #e2e8f0;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
  box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);
}

.image-type-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  z-index: 2;
}

.badge-original {
  background: #28a745;
}

.badge-segmentation {
  background: #007bff;
}

.badge-bbox {
  background: #ffc107;
  color: #212529;
}

.badge-landmark {
  background: #dc3545;
}

.copyright-info {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  opacity: 0.9;
}

.copyright-info p {
  margin: 0.125rem 0;
}

.dataset-type {
  font-weight: 600;
  color: #ffc107 !important;
}

.load-more-container, .view-all-container {
  text-align: center;
  margin: 2rem 0;
}

.load-more-btn, .view-all-btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.load-more-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.view-all-btn {
  background: #718096;
  color: white;
  font-size: 0.875rem;
}

.view-all-btn:hover {
  background: #4a5568;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(113, 128, 150, 0.3);
}

/* 信息区域样式 */
.info-section {
  margin: 1.5rem 0;
  padding: 0;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.info-row {
  display: flex;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #718096;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #2d3748;
  font-size: 0.9375rem;
  flex: 1;
}

/* Tree indicator */
.tree-indicator {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 1.2rem;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Hierarchy Section */
.hierarchy-section {
  margin-top: 1.5rem;
  padding: 0;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.hierarchy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.hierarchy-header h5 {
  margin: 0;
  color: #1a202c;
  font-size: 1rem;
  font-weight: 600;
}

.hierarchy-toggle-btn {
  padding: 0.375rem 0.875rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hierarchy-toggle-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.hierarchy-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hierarchy-toggle-btn.collapse {
  color: #718096;
}

.load-tree-btn, .close-tree-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-tree-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
}

.load-tree-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(72, 187, 120, 0.4);
}

.load-tree-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}

.close-tree-btn {
  background: #718096;
  color: white;
  box-shadow: 0 2px 4px rgba(113, 128, 150, 0.2);
}

.close-tree-btn:hover {
  background: #4a5568;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(113, 128, 150, 0.3);
}

.hierarchy-tree {
  margin-top: 0.75rem;
}

.hierarchy-collapsed {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px dashed #cbd5e0;
}

.current-image-indicator {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #4a5568;
  font-size: 0.875rem;
}

.current-type {
  font-weight: 600;
  color: #2d3748;
}

.expand-hint {
  color: #a0aec0;
  font-size: 0.8125rem;
  margin-left: auto;
}

.tree-node {
  margin: 0.375rem 0;
}

.tree-node-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid #e2e8f0;
}

.tree-node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tree-node-content:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tree-node-content.current {
  background: #ebf8ff !important;
  border-color: #3182ce !important;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15) !important;
}

.tree-node-content.current:hover {
  background: #bee3f8 !important;
  border-color: #2c5282 !important;
}

.tree-toggle {
  cursor: pointer;
  font-size: 0.625rem;
  user-select: none;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  flex-shrink: 0;
}

/* 包装器强制限制尺寸 */
.tree-node-thumbnail-wrapper {
  width: 56px !important;
  height: 56px !important;
  min-width: 56px !important;
  min-height: 56px !important;
  max-width: 56px !important;
  max-height: 56px !important;
  overflow: hidden !important;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f7fafc;
  position: relative;
  display: block;
}

.tree-node-thumbnail-wrapper img,
.tree-node-thumbnail-wrapper > img {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  min-width: 100% !important;
  min-height: 100% !important;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  display: block !important;
}

.tree-node-thumbnail {
  /* 为了确保类存在 */
}

.tree-node-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.tree-node-type {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 600;
}

.tree-node-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #3182ce;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.tree-node-link:hover {
  color: #2c5282;
  border-bottom-color: #3182ce;
}

.tree-node-link .tree-node-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.8125rem;
  color: inherit;
}

.tree-children {
  margin-left: 1.5rem;
  margin-top: 0.375rem;
  border-left: 2px solid #e2e8f0;
  padding-left: 0.75rem;
}

.tree-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8d7da;
  border-radius: 4px;
}

.tree-standalone {
  padding: 0;
}

.tree-note {
  margin: 0.625rem 0 0 0;
  font-size: 0.8125rem;
  color: #a0aec0;
  font-style: italic;
  text-align: center;
}

@media (max-width: 768px) {
  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
    text-align: center;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .image-type-badge {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }

  .modal-content {
    width: 95vw;
    height: 90vh;
  }

  .modal-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .modal-image {
    max-height: 40vh;
    grid-row: 1;
  }

  .modal-info {
    grid-row: 2;
    grid-column: 1;
  }
}
</style>

<style>
/* 非 scoped 样式，确保应用到动态创建的元素 */
.tree-node-thumbnail-wrapper {
  max-width: 120px !important;
  max-height: 70px !important;
  overflow: hidden !important;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f7fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tree-node-thumbnail-wrapper img {
  max-width: 120px !important;
  max-height: 70px !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  display: block !important;
}

.link-icon {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0 !important;
  display: inline-block !important;
  vertical-align: middle !important;
}
</style>