<template>
  <header class="header">
    <div class="logo"> <img src="@/assets/fn2logo.png" alt="FishNet2 Logo" /></div>
    <nav class="nav">
      <a href="/dist/" class="nav-link">HOME</a>
      <router-link to="/search" class="nav-link">SEARCH</router-link>
      <a href="#" class="nav-link">TEAM</a>
      <a href="#" class="nav-link">ABOUT</a>

      <!-- Browse 下拉菜单 - 修复了鼠标移动问题 -->
      <div class="dropdown-container nav-link"
           @mouseenter="showDropdown = true"
           @mouseleave="showDropdown = false">
        <span class="nav-link-text">BROWSE</span>
        <transition name="fade">
          <div v-show="showDropdown" class="dropdown-menu">
            <router-link to="/browse/species" class="dropdown-item">Species</router-link>
            <router-link to="/browse/countries" class="dropdown-item">Countries</router-link>
            <router-link to="/browse/providers" class="dropdown-item">Providers</router-link>
          </div>
        </transition>
      </div>

      <!-- Tools 下拉菜单 -->
      <div class="dropdown-container nav-link"
           @mouseenter="showToolsDropdown = true"
           @mouseleave="showToolsDropdown = false">
        <span class="nav-link-text">TOOLS</span>
        <transition name="fade">
          <div v-show="showToolsDropdown" class="dropdown-menu">
            <router-link to="/tools/outlier-detector" class="dropdown-item">Outlier Detector</router-link>
          </div>
        </transition>
      </div>

      <!-- 个人数据中心下拉菜单 - 只有登录用户才显示 -->
      <div v-if="isAuthenticated" 
           class="dropdown-container nav-link"
           @mouseenter="showDashboardDropdown = true"
           @mouseleave="showDashboardDropdown = false">
        <span class="nav-link-text">DATA CENTER</span>
        <transition name="fade">
          <div v-show="showDashboardDropdown" class="dropdown-menu">
            <router-link v-if="canAccessUserDashboard" to="/dashboard/user" class="dropdown-item">
              User Dashboard
            </router-link>
            <router-link v-if="canAccessProviderDashboard" to="/dashboard/provider" class="dropdown-item">
              Provider Dashboard
            </router-link>
          </div>
        </transition>
      </div>
    </nav>
    
    <!-- 用户菜单 -->
    <UserMenu />
  </header>
</template>

<script>
import UserMenu from './UserMenu.vue'
import { useAuth } from '@/utils/auth.js'

export default {
  components: {
    UserMenu
  },
  setup() {
    const {
      isAuthenticated,
      canAccessProviderDashboard,
      canAccessUserDashboard
    } = useAuth()

    return {
      isAuthenticated,
      canAccessProviderDashboard,
      canAccessUserDashboard
    }
  },
  data() {
    return {
      showDropdown: false, // 控制Browse下拉菜单显示
      showToolsDropdown: false, // 控制Tools下拉菜单显示
      showDashboardDropdown: false, // 控制个人数据中心下拉菜单显示
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

.nav-link-text {
  cursor: pointer;
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
  cursor: pointer;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px); /* 定位到下方并留出间隙 */
  left: 0;
  background-color: white;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  overflow: hidden;
}

/* 添加过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 确保下拉菜单和触发元素之间没有空隙 */
.dropdown-container::after {
  content: '';
  position: absolute;
  height: 8px;
  left: 0;
  right: 0;
  bottom: -8px;
  z-index: 999;
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