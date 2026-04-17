<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import blurbData from '@/data/institutionBlurbs.json'

const router = useRouter()

// Dynamically import all hero images
const imageModules = import.meta.glob('@/assets/institutions/*_hero.{jpg,png}', { eager: true })
const imageMap = {}
for (const [path, mod] of Object.entries(imageModules)) {
  const filename = path.split('/').pop()
  imageMap[filename] = mod.default
}

// Also import _0 images as fallback for carousel display
const thumbModules = import.meta.glob('@/assets/institutions/*_0.{jpg,png}', { eager: true })
const thumbMap = {}
for (const [path, mod] of Object.entries(thumbModules)) {
  const filename = path.split('/').pop()
  thumbMap[filename] = mod.default
}

// Institution display names mapping
const nameMap = {
  'AM': 'Australian Museum',
  'MVZ': 'Berkeley Museum of Vertebrate Zoology',
  'CMN': 'Canadian Museum of Nature',
  'FSBC': 'Florida Biodiversity Collection',
  'USNM': 'Smithsonian NMNH Fish Collection',
  'ASUMZ': 'Arkansas State University Museum of Zoology',
  'NCSM': 'North Carolina Museum of Natural Sciences',
  'SAIAB': 'South African Institute for Aquatic Biodiversity',
  'LSU': 'LSU Museum of Natural Science',
  'FMNH': 'The Field Museum',
  'TU': 'Tulane University Royal D. Suttkus Fish Collection',
  'UAFMC': 'University of Arkansas Museum Fish Collection',
  'KU': 'University of Kansas Biodiversity Institute',
  'UNA': 'University of North Alabama Fish Collection',
  'UWFC': 'University of Washington Fish Collection',
  'UMZC': 'Cambridge Museum of Zoology',
  'IEPA': 'IEPA Ichthyology Collection'
}

// Build institutions array from blurb data
const institutions = Object.entries(blurbData).map(([code, data]) => {
  // Get first non-image paragraph as summary
  const textParagraphs = data.paragraphs.filter(p => !p.startsWith('Image:'))
  const summary = textParagraphs.slice(0, 2).join(' ')

  // Resolve image: prefer hero image, fallback to _0 thumb
  let image = null
  if (data.heroImage) {
    image = imageMap[data.heroImage] || null
  }
  if (!image) {
    // Try to find a _0 thumbnail
    const codeLC = code.toLowerCase()
    for (const [filename, url] of Object.entries(thumbMap)) {
      if (filename.startsWith(codeLC + '_0') || filename.startsWith(codeLC.replace(/\s/g, '') + '_0')) {
        image = url
        break
      }
    }
  }

  return {
    code,
    name: nameMap[code] || code,
    image,
    summary
  }
})

const current = ref(0)
let timer = null

const next = () => {
  current.value = (current.value + 1) % institutions.length
}

const prev = () => {
  current.value = (current.value - 1 + institutions.length) % institutions.length
}

const goTo = (index) => {
  current.value = index
}

const goToProvider = (code) => {
  router.push(`/browse/providers/${code}`)
}

const startAutoPlay = () => {
  timer = setInterval(next, 6000)
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div class="carousel" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <h2 class="carousel-title">Partnering Institutions</h2>

    <div class="carousel-viewport">
      <button class="carousel-arrow carousel-arrow-left" @click="prev">&lsaquo;</button>

      <div class="carousel-slide" @click="goToProvider(institutions[current].code)">
        <div class="slide-image" :class="{ 'no-image': !institutions[current].image }">
          <img v-if="institutions[current].image" :src="institutions[current].image" :alt="institutions[current].name" />
          <div v-else class="slide-image-placeholder">
            <span>{{ institutions[current].code }}</span>
          </div>
        </div>
        <div class="slide-content">
          <h3 class="slide-name">{{ institutions[current].name }}</h3>
          <p class="slide-summary">{{ institutions[current].summary }}</p>
          <span class="slide-link">View Collection &rarr;</span>
        </div>
      </div>

      <button class="carousel-arrow carousel-arrow-right" @click="next">&rsaquo;</button>
    </div>

    <div class="carousel-dots">
      <button
        v-for="(inst, i) in institutions"
        :key="inst.code"
        class="dot"
        :class="{ active: i === current }"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  max-width: 900px;
  margin: 0 auto;
}

.carousel-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 20px 0;
}

.carousel-viewport {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-arrow:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f0f7ff;
}

.carousel-slide {
  flex: 1;
  display: flex;
  gap: 24px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  min-height: 200px;
}

.carousel-slide:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.slide-image {
  flex-shrink: 0;
  width: 240px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f0fe 0%, #d4e4fc 100%);
  color: #3498db;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
}

.slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slide-name {
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.slide-summary {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  margin: 0 0 auto 0;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-link {
  font-size: 13px;
  color: #3498db;
  font-weight: 500;
  margin-top: 12px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.dot.active {
  background: #3498db;
  transform: scale(1.3);
}

@media (max-width: 768px) {
  .carousel-slide {
    flex-direction: column;
    gap: 16px;
  }

  .slide-image {
    width: 100%;
    height: 160px;
  }
}
</style>