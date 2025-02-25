<template>
  <header class="header">
    <div class="logo"> <img src="@/assets/fn2logo.png" alt="FishNet2 Logo" /></div>
    <nav class="nav">
      <a href="/dist/" class="nav-link">HOME</a>
      <a href="#" class="nav-link">SEARCH</a>
      <a href="#" class="nav-link">TEAM</a>
      <a href="#" class="nav-link">ABOUT</a>

      <!-- Browse 下拉菜单 -->
      <div class="dropdown-container nav-link" @mouseover="showDropdown = true" @mouseleave="showDropdown = false">
        <span class="nav-link">BROWSE</span>
        <div v-if="showDropdown" class="dropdown-menu">
          <router-link to="/browse/species" class="dropdown-item">Species</router-link>
          <router-link to="/browse/countries" class="dropdown-item">Countries</router-link>
          <router-link to="/browse/providers" class="dropdown-item">Providers</router-link>
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
    navigateTo(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 40px;
  background-color: #2c7cb9; /* 较深的蓝色背景 */
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.2rem;
  font-weight: 500;
  color: #ffffff;
}

.logo img {
  height: 40px; /* 调整 Logo 高度 */
  filter: brightness(1.1); /* 让logo在深色背景上更明亮 */
}

.nav {
  display: flex;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: white;
  text-decoration: none;
  position: relative;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  text-decoration: none;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.25);
  font-weight: 600;
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
  background-color: white;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  margin-top: 8px;
  overflow: hidden;
}

.dropdown-item {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  padding: 12px 20px;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f5f9ff;
  color: #2c7cb9;
}

@media (max-width: 768px) {
  .header {
    padding: 10px 20px;
    flex-direction: column;
    gap: 10px;
  }

  .nav {
    width: 100%;
    justify-content: center;
    padding: 5px;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
