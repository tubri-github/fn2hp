<template>
  <div class="related-projects">
    <h2 class="section-title">Related Projects</h2>

    <div class="carousel-container">
      <div class="carousel">
        <div class="carousel-content" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <!-- 第一页：FishAIR -->
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
                <h3 class="project-title">FishAIR</h3>
                <p class="project-description">
                  FishAIR is a fish image dataset with built-in image quality management system.
                </p>
              </div>

              <!-- 按钮 -->
              <div class="button-container">
                <button class="redirect-button" @click="goToHomepage('fishair')">
                  Explore FishAIR
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');

.related-projects {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 700;
  color: #16232e;
  margin-bottom: 60px;
  letter-spacing: -0.02em;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #2c7cb9, #5aa7d8);
  border-radius: 2px;
}

/* Carousel Container */
.carousel-container {
  position: relative;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  overflow: hidden;
  border-radius: 16px;
  /*box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);*/
}

.carousel {
  position: relative;
  width: 100%;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
}

.carousel-content {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
}

.project-slide {
  flex: 0 0 100%;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: 30px 0;
}

/* 图片固定大小布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
  justify-content: center;
  padding: 20px;
  max-width: 720px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

.grid-item {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.grid-item:hover img {
  transform: scale(1.05);
}

/* HydroClim Image Section */
.image-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-image {
  max-width: 200px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 10px rgba(255, 255, 255, 0.3));
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
  /*box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);*/
  border: 3px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.circular-image:hover {
  transform: translateY(-3px);
 /* box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);*/
}

.circular-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.circular-image:hover img {
  transform: scale(1.1);
}

/* 中间文字部分 */
.text-section {
  text-align: center;
  margin: 30px 0;
  padding: 0 20px;
}

.project-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c7cb9;
  margin-bottom: 10px;
}

.hydroclim-slide {
  background: linear-gradient(135deg, #2c7cb9 0%, #5aa7d8 100%);
  padding: 40px 0;
  width: 100%;
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hydroclim-slide .redirect-button {
  background-color: white;
  color: #2c7cb9;
  border: none;
}

.hydroclim-slide .redirect-button:hover {
  background-color: #f0f0f0;
  color: #2c7cb9;
}

.project-description {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #566672;
  max-width: 800px;
  margin: 0 auto;
}

/* 按钮样式 */
.button-container {
  text-align: center;
  margin-top: 20px;
}

.redirect-button {
  background-color: #f5f9ff;
  color: #2c7cb9;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 12px 28px;
  border-radius: 25px;
  box-shadow: 0 4px 18px rgba(20, 35, 46, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.redirect-button:hover {
  background-color: #e6f2ff;
  color: #2c7cb9;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s ease;
}

.nav-button svg {
  stroke: #566672;
  transition: stroke 0.3s ease;
}

.nav-button:hover {
  background: #f5f9ff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.nav-button:hover svg {
  stroke: #2c7cb9;
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
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #2c7cb9;
  transform: scale(1.2);
}

/* ===== 平板 / 手机：修复滚动错位 + 隐藏两侧箭头改用圆点 ===== */
@media (max-width: 768px) {
  .related-projects {
    padding: 40px 12px;
  }
  .section-title {
    margin-bottom: 40px;
  }
  /* 两侧留白，给缩小后的箭头让位，箭头不再压住内容 */
  .project-slide {
    padding: 24px 42px;
  }
  .grid-layout {
    gap: 12px;
    padding: 8px;
    max-width: 100%;
  }
  .grid-item {
    height: 120px;
  }
  .circular-image {
    width: 120px;
    height: 120px;
  }
  .text-section {
    padding: 0 4px;
  }
  .nav-button {
    width: 34px;
    height: 34px;
  }
  .prev { left: 2px; }
  .next { right: 2px; }
}
</style>