<template>
  <div class="home-page">
    <div class="hero-section">
      <SearchBar />
      <StatsDisplay />
    </div>
    <div class="content-section">
      <TextSection />
      <ImageGrid />
    </div>
  </div>
</template>

<script>
import SearchBar from "../components/SearchBar.vue";
import StatsDisplay from "../components/StatsDisplay.vue";
import MapDisplay from "../components/MapDisplay.vue";
import ImageGrid from "../components/ImageGrid.vue";
import TextSection from "@/components/TextSection.vue";

export default {
  components: {
    TextSection,
    SearchBar,
    StatsDisplay,
    MapDisplay,
    ImageGrid,
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@300;400;500;600&display=swap');

.home-page {
  font-family: 'Inter', sans-serif;

  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
}

.home-page::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a3c6f0' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.2;
  z-index: -1;
  pointer-events: none;
}

.hero-section {
  position: relative;
  width: 100%;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 40px;
  overflow: hidden;
}

.hero-section::after {
  content: "";
  position: absolute;
  width: 700px;
  height: 700px;
  top: -80px;
  background: url("@/assets/fish.png") no-repeat center;
  background-size: contain;
  opacity: 0.15;
  filter: drop-shadow(0 0 20px rgba(44, 124, 185, 0.2));
  animation: float 15s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.content-section {
  width: 90%;
  max-width: 1200px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 14px;
  /*box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04);*/
  /*border: 1px solid rgba(0, 0, 0, 0.05);*/
  transition: all 0.3s ease;
  z-index: 10;
  position: relative;
}

.content-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
  transform: translateY(-5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-section::after {
    width: 400px;
    height: 400px;
    top: -40px;
  }

  .content-section {
    width: 95%;
    padding: 20px;
  }
}
</style>
