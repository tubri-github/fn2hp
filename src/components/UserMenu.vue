<template>
  <div class="user-menu-container">
    <!-- 未登录状态 -->
    <div v-if="!isAuthenticated" class="auth-buttons">
      <button @click="handleSignIn" class="sign-in-btn">
        <span>Sign In</span>
      </button>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-dropdown-container"
         @mouseenter="showUserDropdown = true"
         @mouseleave="showUserDropdown = false">
      <div class="user-info">
        <div class="user-avatar">
          <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.display_name || user.username" />
          <div v-else class="avatar-placeholder">
            {{ avatarInitials }}
          </div>
        </div>
        <span class="username">{{ user.display_name || user.username }}</span>
        <svg class="dropdown-arrow" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
      
      <transition name="fade">
        <div v-show="showUserDropdown" class="user-dropdown-menu">
          <div class="user-profile-section">
            <div class="profile-info">
              <div class="profile-name">{{ user.display_name || user.username }}</div>
              <div class="profile-email">{{ user.email }}</div>
              <div class="profile-role">
                <span v-if="isSuperUser" class="role-badge super-admin">Super Admin</span>
                <span v-else-if="isDataProvider" class="role-badge data-provider">Data Provider</span>
                <span v-else class="role-badge user">User</span>
              </div>
            </div>
          </div>
          
          <div class="menu-divider"></div>
          
          <div class="menu-items">
            <router-link v-if="canAccessUserDashboard" to="/dashboard/user" class="menu-item">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span>User Dashboard</span>
            </router-link>
            
            <router-link v-if="canAccessProviderDashboard" to="/dashboard/provider" class="menu-item">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              <span>Provider Dashboard</span>
            </router-link>
            
            <div class="menu-item" @click="$router.push('/profile')">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </div>
            
            <div class="menu-item" @click="$router.push('/settings')">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              <span>Settings</span>
            </div>
          </div>
          
          <div class="menu-divider"></div>
          
          <div class="menu-item logout-item" @click="handleLogout">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            <span>Sign Out</span>
          </div>
        </div>
      </transition>
    </div>

    <!-- Loading状态 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/utils/auth.js'
import { computed } from 'vue'

export default {
  name: 'UserMenu',
  setup() {
    const {
      user,
      isAuthenticated,
      isLoading,
      isSuperUser,
      isDataProvider,
      canAccessProviderDashboard,
      canAccessUserDashboard,
      redirectToLogin,
      logout
    } = useAuth()

    // 计算用户头像初始字母
    const avatarInitials = computed(() => {
      if (!user.value) return ''
      const name = user.value.display_name || user.value.username || user.value.email
      return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2)
    })

    return {
      user,
      isAuthenticated,
      isLoading,
      isSuperUser,
      isDataProvider,
      canAccessProviderDashboard,
      canAccessUserDashboard,
      avatarInitials,
      redirectToLogin,
      logout
    }
  },
  data() {
    return {
      showUserDropdown: false
    }
  },
  methods: {
    handleSignIn() {
      this.redirectToLogin()
    },
    
    async handleLogout() {
      this.showUserDropdown = false
      await this.logout()
    }
  }
}
</script>

<style scoped>
.user-menu-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* 登录按钮 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sign-in-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sign-in-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* 用户下拉菜单 */
.user-dropdown-container {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.username {
  color: white;
  font-size: 14px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s ease;
}

.user-dropdown-container:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  z-index: 1000;
  min-width: 280px;
  overflow: hidden;
}

.user-profile-section {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.profile-email {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.profile-role {
  display: flex;
  justify-content: center;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.super-admin {
  background: #ff6b6b;
  color: white;
}

.role-badge.data-provider {
  background: #4ecdc4;
  color: white;
}

.role-badge.user {
  background: #95e1d3;
  color: #2d3436;
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background: #f8f9ff;
  color: #2c7cb9;
}

.menu-item svg {
  opacity: 0.7;
}

.menu-item:hover svg {
  opacity: 1;
}

.logout-item {
  color: #dc3545;
}

.logout-item:hover {
  background: #fff5f5;
  color: #dc3545;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Loading指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .username {
    display: none;
  }
  
  .user-dropdown-menu {
    right: -8px;
    min-width: 240px;
  }
}
</style>