<template>
  <header class="header">
    <div class="logo"> <img src="@/assets/fn2logo.png" alt="FishNet2 Logo" /></div>
    <nav class="nav">
      <a href="/" class="nav-link">HOME</a>
      <a href="#" class="nav-link">SEARCH</a>
      <a href="#" class="nav-link">TEAM</a>
      <a href="#" class="nav-link">ABOUT</a>

      <!-- Browse 下拉菜单 -->
      <div class="dropdown-container" @mouseover="showDropdown = true" @mouseleave="showDropdown = false">
        <span class="nav-link">BROWSE</span>
        <div v-if="showDropdown" class="dropdown-menu">
          <a :href="resolvePath('/browse/species')" class="dropdown-item">Species</a>
          <a :href="resolvePath('/browse/countries')" class="dropdown-item">Countries</a>
          <a :href="resolvePath('/browse/providers')" class="dropdown-item">Providers</a>


        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showDropdown: false, // 控制下拉菜单显示
    };
  },
  methods: {
    resolvePath(path) {
      return this.$router.resolve(path).href;
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter+Rounded:wght@400;500;600&display=swap');
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: #ffffff;
}

.logo {
  font-size: 1.2rem;
  font-weight: 500;
  color: #0077ff;
}
.logo img {
  height: 40px; /* 调整 Logo 高度 */
}
.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  font-family: 'Inter Rounded', sans-serif;
  font-weight: 500; /* Medium */
  font-size: 16px;
  color: #004B8D; /* 深蓝色 */
  letter-spacing: 0.5px;
  text-decoration: none;
  position: relative;
}

.nav-link:hover {
  text-decoration: underline;
  color: #002B5C;
}
/* 下拉菜单容器 */
.dropdown-container {
  position: relative;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%; /* 定位到下方 */
  left: 0;
  background-color: #ffffff; /* 白色背景 */
  border: 1px solid #e0e0e0; /* 浅灰边框 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 投影效果 */
  border-radius: 4px;
  z-index: 1000; /* 保证菜单在顶部 */
  display: flex;
  flex-direction: column; /* 垂直排列 */
  min-width: 150px;
}

.dropdown-item {
  font-family: 'Inter Rounded', sans-serif;
  font-size: 14px;
  font-weight: 400; /* Regular */
  color: #004B8D; /* 深蓝色 */
  padding: 10px 20px;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.dropdown-item:hover {
  background-color: #f2f2f2; /* 浅灰色背景 */
  color: #002B5C; /* 更深的蓝色 */
}
</style>
