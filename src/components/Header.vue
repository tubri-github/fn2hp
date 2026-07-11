<template>
  <header class="header">
    <a href="/dist/" class="logo">
      <img src="@/assets/fishnet-logo.png" alt="FishNet Next" />
    </a>

    <!-- 桌面导航：扁平 + 下划线，无套框 -->
    <nav class="nav nav-desktop">
      <a href="/dist/" class="nav-link">HOME</a>
      <router-link to="/about" class="nav-link">ABOUT</router-link>
      <router-link to="/search" class="nav-link">SEARCH</router-link>

      <!-- Browse 下拉菜单 -->
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

    <!-- 右侧：小屏汉堡 + 用户菜单 -->
    <div class="header-right">
      <button
        class="hamburger"
        :class="{ 'is-open': mobileOpen }"
        :aria-expanded="mobileOpen ? 'true' : 'false'"
        aria-label="Toggle navigation menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span></span><span></span><span></span>
      </button>
      <UserMenu />
    </div>

    <!-- 小屏抽屉 -->
    <Teleport to="body">
      <transition name="drawer-fade">
        <div v-if="mobileOpen" class="drawer-backdrop" @click="closeMobile"></div>
      </transition>
    </Teleport>
    <transition name="drawer-slide">
      <nav v-if="mobileOpen" class="nav-mobile">
        <a href="/dist/" class="m-link" @click="closeMobile">Home</a>
        <router-link to="/about" class="m-link" @click="closeMobile">About</router-link>
        <router-link to="/search" class="m-link" @click="closeMobile">Search</router-link>

        <!-- Browse 折叠 -->
        <button class="m-link m-toggle" @click="mobileBrowseOpen = !mobileBrowseOpen">
          <span>Browse</span>
          <span class="m-caret" :class="{ open: mobileBrowseOpen }">▾</span>
        </button>
        <div v-show="mobileBrowseOpen" class="m-sub">
          <div class="m-sub-label">Taxon</div>
          <router-link to="/browse/families" class="m-sublink" @click="closeMobile">Families</router-link>
          <router-link to="/browse/genera" class="m-sublink" @click="closeMobile">Genera</router-link>
          <router-link to="/browse/species" class="m-sublink" @click="closeMobile">Species</router-link>
          <router-link to="/browse/providers" class="m-sublink" @click="closeMobile">Providers</router-link>
          <router-link to="/browse/countries" class="m-sublink" @click="closeMobile">Countries</router-link>
        </div>

        <router-link to="/teams" class="m-link" @click="closeMobile">Team</router-link>
        <router-link to="/collaborations" class="m-link" @click="closeMobile">Collaborations</router-link>

        <template v-if="isAuthenticated">
          <div class="m-divider"></div>
          <div class="m-section-label">Data Center</div>
          <router-link v-if="canAccessUserDashboard" to="/dashboard/user" class="m-link" @click="closeMobile">
            User Dashboard
          </router-link>
          <router-link v-if="canAccessProviderDashboard" to="/dashboard/provider" class="m-link" @click="closeMobile">
            Provider Dashboard
          </router-link>
        </template>
      </nav>
    </transition>
  </header>
</template>

<script>
import UserMenu from './UserMenu.vue'
import { useAuth } from '@/utils/auth.js'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

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

    const route = useRoute()
    const mobileOpen = ref(false)
    const mobileBrowseOpen = ref(false)

    // 路由变化时关闭抽屉
    watch(() => route.fullPath, () => {
      mobileOpen.value = false
    })

    const closeMobile = () => {
      mobileOpen.value = false
    }

    return {
      isAuthenticated,
      canAccessProviderDashboard,
      canAccessUserDashboard,
      mobileOpen,
      mobileBrowseOpen,
      closeMobile
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
  position: relative;
  z-index: 1000; /* 高于抽屉遮罩，保持顶栏明亮 + 汉堡可点 */
}

.logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo img {
  height: 56px;
  width: auto;
  display: block;
  /* 沿透明图形轮廓叠出一圈白边，蓝底上更清晰 */
  filter:
    drop-shadow(0 0 1px #fff)
    drop-shadow(0 0 1px #fff)
    drop-shadow(0 0 1px #fff)
    drop-shadow(0 0 1px #fff)
    drop-shadow(0 0 1px #fff);
}

/* 扁平导航：无外层套框 */
.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  position: relative;
  padding: 8px 14px;
  transition: color 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: none;
  border: none;
}

.nav-link-text {
  cursor: pointer;
}

/* 下划线指示器（选中/悬停）*/
.nav-link::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 2px;
  height: 2px;
  border-radius: 2px;
  background: #ffffff;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.22s ease;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.nav-link.router-link-active {
  color: #ffffff;
  font-weight: 600;
}

/* 下拉菜单容器 */
.dropdown-container {
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px); /* 定位到下方并留出间隙 */
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

/* 桥接区域：防止鼠标移向下拉菜单时丢失 hover（用 ::before，避免与下划线 ::after 冲突）*/
.dropdown-container::before {
  content: '';
  position: absolute;
  height: 12px;
  left: 0;
  right: 0;
  bottom: -12px;
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

/* 右侧容器 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 汉堡按钮（默认隐藏，小屏显示）*/
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.hamburger.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.is-open span:nth-child(2) {
  opacity: 0;
}
.hamburger.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ===== 小屏抽屉 ===== */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 900;
}

.nav-mobile {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  border-radius: 0 0 14px 14px;
  z-index: 950;
  padding: 8px 0;
  max-height: calc(100vh - 100%);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.m-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 15px 22px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #23405a;
  text-decoration: none;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  text-align: left;
}

.m-link:active {
  background: #eef5fb;
}

.m-link.router-link-active {
  color: #2c7cb9;
  box-shadow: inset 3px 0 0 #2c7cb9;
}

.m-toggle .m-caret {
  color: #8aa0b4;
  transition: transform 0.2s ease;
}
.m-toggle .m-caret.open {
  transform: rotate(180deg);
}

.m-sub {
  background: #f6f9fc;
}

.m-sub-label {
  padding: 10px 22px 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8aa0b4;
}

.m-sublink {
  display: block;
  padding: 12px 22px 12px 34px;
  font-size: 15px;
  color: #3a5875;
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.m-sublink:active {
  background: #e7f0f8;
}

.m-sublink.router-link-active {
  color: #2c7cb9;
  font-weight: 600;
}

.m-divider {
  height: 8px;
  background: #f0f4f8;
}

.m-section-label {
  padding: 12px 22px 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8aa0b4;
}

/* 抽屉过渡 */
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.drawer-slide-enter-from, .drawer-slide-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
.drawer-fade-enter-active, .drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from, .drawer-fade-leave-to {
  opacity: 0;
}

/* ===== 断点：iPad mini 竖屏(768) 及以下用汉堡；mini 横屏(1024) 保留完整导航 ===== */
@media (max-width: 900px) {
  .nav-desktop {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .header {
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 10px 16px;
  }
  .logo img {
    height: 44px;
  }
}
</style>
