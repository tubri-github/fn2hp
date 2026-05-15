<template>
  <header class="header">
    <div class="logo">FishNet Next</div>
    <nav class="nav">
      <a href="/dist/" class="nav-link">HOME</a>
      <router-link to="/about" class="nav-link">ABOUT</router-link>
      <router-link to="/search" class="nav-link">SEARCH</router-link>

      <!-- Browse 下拉菜单 - 修复了鼠标移动问题 -->
      <div class="dropdown-container nav-link"
           @mouseenter="showDropdown = true"
           @mouseleave="showDropdown = false">
        <span class="nav-link-text">BROWSE</span>
        <transition name="fade">
          <div v-show="showDropdown" class="dropdown-menu">
            <div class="dropdown-item has-submenu"
                 @mouseenter="showTaxonSubmenu = true"
                 @mouseleave="showTaxonSubmenu = false">
              <span>Taxon</span>
              <span class="submenu-arrow">›</span>
              <transition name="fade">
                <div v-show="showTaxonSubmenu" class="submenu">
                  <router-link to="/browse/families" class="dropdown-item">Families</router-link>
                  <router-link to="/browse/genera" class="dropdown-item">Genera</router-link>
                  <router-link to="/browse/species" class="dropdown-item">Species</router-link>
                </div>
              </transition>
            </div>
            <router-link to="/browse/providers" class="dropdown-item">Providers</router-link>
            <router-link to="/browse/countries" class="dropdown-item">Countries</router-link>
          </div>
        </transition>
      </div>

      <router-link to="/teams" class="nav-link">TEAM</router-link>
      <router-link to="/collaborations" class="nav-link">COLLABORATIONS</router-link>

      <!-- Tools 下拉菜单 - 暂时禁用 -->
      <div v-if="false" class="dropdown-container nav-link"
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
      showTaxonSubmenu: false, // 控制Taxon二级菜单显示
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

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
  font-family: 'Fredoka', 'Inter', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
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
}

/* 首尾子项圆角 */
.dropdown-menu > :first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-menu > :last-child {
  border-radius: 0 0 8px 8px;
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

/* 二级展开菜单 */
.has-submenu {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/* 桥接区域：防止鼠标移向子菜单时丢失 hover */
.has-submenu::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 0;
  width: 10px;
  height: 100%;
}

.submenu-arrow {
  font-size: 16px;
  color: #999;
  margin-left: 8px;
}

.has-submenu:hover .submenu-arrow {
  color: #2c7cb9;
}

.submenu {
  position: absolute;
  left: 100%;
  top: -1px;
  background-color: white;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  min-width: 160px;
  overflow: hidden;
  z-index: 1001;
  display: flex;
  flex-direction: column;
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