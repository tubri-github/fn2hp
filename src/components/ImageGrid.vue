<template>
  <div class="related-projects">
    <h2 class="section-title">Related Projects</h2>

    <div class="carousel-container">
      <div class="carousel">
        <div class="carousel-content" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <!-- 第一页：FishAir -->
          <div class="project-slide">
            <div class="content-section">
              <!-- 图片固定大小布局 -->
              <div class="grid-layout">
                <div
                    v-for="(image, index) in fishairImages"
                    :key="index"
                    class="grid-item"
                >
                  <img :src="image" alt="Fish specimen" />
                </div>
              </div>

              <!-- 中间文字 -->
              <div class="text-section">
                <h3 class="project-title">FishAir</h3>
                <p class="project-description">
                  FishAir is a fish image dataset with built-in image quality management system."Placehoder:expain the relationship between fishair and fishnet2........"
                </p>
              </div>

              <!-- 按钮 -->
              <div class="button-container">
                <button class="redirect-button" @click="goToHomepage('fishair')">
                  Explore Fishair
                </button>
              </div>
            </div>
          </div>

          <!-- 第二页：HydroClim -->
          <div class="project-slide hydroclim-slide">
            <div class="content-section">
              <!-- 顶部图片 -->
              <div class="image-section">
                <img
                    src="@/assets/hydroclim/hydroclim_logo.png"
                    alt="HydroClim Logo"
                    class="logo-image"
                />
                <div class="image-carousel">
                  <div
                      v-for="(image, index) in hydroclimImages"
                      :key="index"
                      class="circular-image"
                  >
                    <img :src="image" alt="HydroClim image" />
                  </div>
                </div>
              </div>

              <!-- 中间文字 -->
              <div class="text-section">
                <h3 class="project-title">HydroClim</h3>
                <p class="project-description">
                  HydroClim provides comprehensive climate and hydrological data integration
                  for environmental research.
                </p>
              </div>

              <!-- 按钮 -->
              <div class="button-container">
                <button class="redirect-button" @click="goToHomepage('hydroclim')">
                  Explore HydroClim
                </button>
              </div>
            </div>
          </div>
        </div>


        <!-- 替换成这部分 -->
        <button class="nav-button prev" @click="prevSlide">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="nav-button next" @click="nextSlide">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- 轮播圆点 -->
      <div class="carousel-dots">
        <button
            v-for="n in 2"
            :key="n"
            class="dot"
            :class="{ active: currentIndex === n - 1 }"
            @click="goToSlide(n - 1)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

export default {
  components: {
    ArrowLeft,
    ArrowRight
  },
  data() {
    return {
      currentIndex: 0,
      fishairImages: [
        new URL('@/assets/fishair/origxk75dt5z.jpg', import.meta.url).href,
        new URL('@/assets/fishair/bb29449d2c.png', import.meta.url).href,
        new URL('@/assets/fishair/seg_jw37113b.png', import.meta.url).href,
        new URL('@/assets/fishair/landwp920v91.png', import.meta.url).href,
      ],
      hydroclimImages: [], // Add your HydroClim images here
    };
  },
  methods: {
    prevSlide() {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : 1;
    },
    nextSlide() {
      this.currentIndex = this.currentIndex < 1 ? this.currentIndex + 1 : 0;
    },
    goToSlide(index) {
      this.currentIndex = index;
    },
    goToHomepage(project) {
      const urls = {
        fishair: 'https://fishair.org',
        hydroclim: 'https://hydroclim.org',
      };
      window.open(urls[project], '_blank');
    },
  },
};
</script>

<style scoped>
.related-projects {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 200;
  color: #333;
  margin-bottom: 60px;
  letter-spacing: -0.5px;
  text-align: center;
}

/* Carousel Container */
.carousel-container {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  overflow: hidden;
}

.carousel {
  position: relative;
  width: 100%;
  background-color: white;
}

.carousel-content {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
}

.project-slide {
  min-width: 100%;
  flex-shrink: 0;
}

/* 图片固定大小布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(4, 250px);
  gap: 20px;
  justify-content: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.grid-item {
  width: 250px;
  height: 150px;
  overflow: hidden;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

/* HydroClim Image Section */
.image-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-image {
  max-width: 200px;
  margin-bottom: 20px;
}

.image-carousel {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.circular-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
}

.circular-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 中间文字部分 */
.text-section {
  text-align: center;
  margin: 30px 0;
  padding: 0 20px;
}

.project-title {
  font-size: 1.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.hydroclim-slide {
  background-color: #1e90ff;
  padding: 40px 0;
  width: 100vw;
}

.hydroclim-slide .content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hydroclim-slide .project-title,
.hydroclim-slide .project-description,
.hydroclim-slide .text-section {
  color: white;
}

.hydroclim-slide .redirect-button {
  background-color: white;
  color: #1e90ff;
  border: none;
}

.hydroclim-slide .redirect-button:hover {
  background-color: #f0f0f0;
  color: #1e90ff;
}

.project-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  max-width: 800px;
  margin: 0 auto;
}

/* 按钮样式 */
.button-container {
  text-align: center;
  margin-top: 20px;
}

.redirect-button {
  background-color: #f5f5f5;
  color: #333;
  font-size: 1rem;
  padding: 12px 28px;
  border-radius: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.redirect-button:hover {
  background-color: #e0e0e0;
  color: #000;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s ease;
}

.nav-button svg {
  stroke: #666;
  transition: stroke 0.3s ease;
}

.nav-button:hover {
  background: #f8f8f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-button:hover svg {
  stroke: #333;
}

.hydroclim-slide .nav-button {
  background: rgba(255, 255, 255, 0.9);
}

.hydroclim-slide .nav-button:hover {
  background: rgba(255, 255, 255, 1);
}

.prev {
  left: 20px;
}

.next {
  right: 20px;
}
/* 轮播圆点 */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #333;
}
</style>