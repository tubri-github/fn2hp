<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>User Profile</h1>
      <p>Manage your account information</p>
    </div>
    
    <div class="profile-content">
      <div v-if="user" class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.display_name || user.username" class="avatar" />
            <div v-else class="avatar-placeholder">
              {{ avatarInitials }}
            </div>
            <button class="change-avatar-btn">Change Avatar</button>
          </div>
          
          <div class="user-basic-info">
            <h2>{{ user.display_name || user.username }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-role">
              <span v-if="isSuperUser" class="role-badge super-admin">Super Admin</span>
              <span v-else-if="isDataProvider" class="role-badge data-provider">Data Provider</span>
              <span v-else class="role-badge user">User</span>
            </div>
          </div>
        </div>
        
        <div class="profile-details">
          <div class="detail-section">
            <h3>Account Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>User ID</label>
                <span>{{ user.user_id }}</span>
              </div>
              <div class="detail-item">
                <label>Username</label>
                <span>{{ user.username }}</span>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <label>Display Name</label>
                <span>{{ user.display_name || 'Not set' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Account Status</h3>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Active</span>
                <span :class="['status-indicator', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Verified</span>
                <span :class="['status-indicator', user.is_verified ? 'verified' : 'unverified']">
                  {{ user.is_verified ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Permissions</h3>
            <div class="permissions-list">
              <span v-if="user.permissions && user.permissions.length > 0" 
                    v-for="permission in user.permissions" 
                    :key="permission" 
                    class="permission-tag">
                {{ permission }}
              </span>
              <span v-else class="no-permissions">No specific permissions assigned</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/utils/auth.js'
import { computed } from 'vue'

export default {
  name: 'Profile',
  setup() {
    const { user, isSuperUser, isDataProvider } = useAuth()

    // 计算用户头像初始字母
    const avatarInitials = computed(() => {
      if (!user.value) return ''
      const name = user.value.display_name || user.value.username || user.value.email
      return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2)
    })

    return {
      user,
      isSuperUser,
      isDataProvider,
      avatarInitials
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c7cb9;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.125rem;
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar, .avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #2c7cb9, #1e5a8a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.change-avatar-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.change-avatar-btn:hover {
  background: #f8f9ff;
  border-color: #2c7cb9;
}

.user-basic-info h2 {
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.user-email {
  color: #666;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.role-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
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

.profile-details {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  font-size: 1.25rem;
  color: #2c7cb9;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e8f0ff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 1rem;
  color: #1a1a1a;
}

.status-grid {
  display: flex;
  gap: 2rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-weight: 500;
  color: #666;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-indicator.active {
  background: #d4edda;
  color: #155724;
}

.status-indicator.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-indicator.verified {
  background: #d1ecf1;
  color: #0c5460;
}

.status-indicator.unverified {
  background: #fff3cd;
  color: #856404;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-tag {
  padding: 0.5rem 0.75rem;
  background: #e8f0ff;
  color: #2c7cb9;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.no-permissions {
  color: #666;
  font-style: italic;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e8f0ff;
  border-top: 3px solid #2c7cb9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>