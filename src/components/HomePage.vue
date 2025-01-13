<template>
  <div class="home-page">
    <div class="hero-section">
      <SearchBar />
      <StatsDisplay />
    </div>
    <div class="content-section">
<!--      <MapDisplay/>-->
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&display=swap');
.home-page {
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  color: #0044cc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh; /* 占据整个视窗高度 */
  display: flex;
  flex-direction: column;
  /*justify-content: center;*/
  align-items: center;
  text-align: center;
  margin-bottom: 100px;
  background-color: rgba(255, 255, 255, 0.9);
}

.hero-section::after {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  top:60px;
  background: url("@/assets/fish.png") no-repeat center;
  background-size: contain; /* 保证图片比例 */
  opacity: 0.1; /* 图片半透明 */
  pointer-events: none; /* 避免干扰交互 */
}
.content-section {
  width: 100%;
}
</style>
