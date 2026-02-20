<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>Settings</h1>
      <p>Manage your application preferences and account settings</p>
    </div>
    
    <div class="settings-content">
      <div class="settings-sections">
        <div class="settings-section">
          <h3>Profile Settings</h3>
          <div class="setting-item">
            <label>Display Name</label>
            <div class="setting-input">
              <input 
                v-model="displayName" 
                type="text" 
                :placeholder="user?.display_name || user?.username || 'Enter display name'"
                :disabled="!editMode"
              />
              <button v-if="!editMode" @click="editMode = true" class="edit-btn">Edit</button>
              <div v-else class="edit-actions">
                <button @click="saveDisplayName" class="save-btn">Save</button>
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Email Notifications</label>
            <div class="setting-toggle">
              <input 
                type="checkbox" 
                id="email-notifications" 
                v-model="emailNotifications"
                @change="updateNotificationSettings"
              />
              <label for="email-notifications" class="toggle-label">
                Receive email notifications for important updates
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Display Preferences</h3>
          <div class="setting-item">
            <label>Theme</label>
            <div class="setting-select">
              <select v-model="theme" @change="updateTheme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Results Per Page</label>
            <div class="setting-select">
              <select v-model="resultsPerPage" @change="updateResultsPerPage">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Privacy & Security</h3>
          <div class="setting-item">
            <label>Profile Visibility</label>
            <div class="setting-select">
              <select v-model="profileVisibility" @change="updatePrivacySettings">
                <option value="public">Public</option>
                <option value="limited">Limited</option>
                <option value="private">Private</option>
              </select>
              <p class="setting-description">
                Control who can view your profile information
              </p>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Data Collection</label>
            <div class="setting-toggle">
              <input 
                type="checkbox" 
                id="analytics" 
                v-model="analyticsEnabled"
                @change="updateAnalyticsSettings"
              />
              <label for="analytics" class="toggle-label">
                Allow anonymous usage analytics to improve the platform
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section danger-zone">
          <h3>Account Management</h3>
          <div class="setting-item">
            <label>Change Password</label>
            <button @click="showChangePassword = true" class="secondary-btn">
              Change Password
            </button>
          </div>
          
          <div class="setting-item">
            <label>Download Data</label>
            <button @click="exportUserData" class="secondary-btn">
              Export My Data
            </button>
            <p class="setting-description">
              Download a copy of your account data and activity
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <h3>Change Password</h3>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" v-model="passwordForm.current" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" v-model="passwordForm.new" required />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" v-model="passwordForm.confirm" required />
          </div>
          <div class="form-actions">
            <button type="button" @click="showChangePassword = false" class="cancel-btn">Cancel</button>
            <button type="submit" class="primary-btn">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '@/utils/auth.js'

export default {
  name: 'Settings',
  setup() {
    const { user } = useAuth()
    
    // Settings state
    const editMode = ref(false)
    const displayName = ref('')
    const emailNotifications = ref(true)
    const theme = ref('light')
    const resultsPerPage = ref('25')
    const profileVisibility = ref('public')
    const analyticsEnabled = ref(true)
    const showChangePassword = ref(false)
    
    const passwordForm = reactive({
      current: '',
      new: '',
      confirm: ''
    })

    // Load settings from localStorage or defaults
    const loadSettings = () => {
      displayName.value = user.value?.display_name || ''
      emailNotifications.value = localStorage.getItem('emailNotifications') !== 'false'
      theme.value = localStorage.getItem('theme') || 'light'
      resultsPerPage.value = localStorage.getItem('resultsPerPage') || '25'
      profileVisibility.value = localStorage.getItem('profileVisibility') || 'public'
      analyticsEnabled.value = localStorage.getItem('analyticsEnabled') !== 'false'
    }

    // Save display name
    const saveDisplayName = async () => {
      try {
        // In a real app, this would make an API call to update the display name
        console.log('Saving display name:', displayName.value)
        // Update local user object would happen here
        editMode.value = false
      } catch (error) {
        console.error('Failed to save display name:', error)
      }
    }

    const cancelEdit = () => {
      displayName.value = user.value?.display_name || ''
      editMode.value = false
    }

    // Update notification settings
    const updateNotificationSettings = () => {
      localStorage.setItem('emailNotifications', emailNotifications.value)
      console.log('Email notifications:', emailNotifications.value)
    }

    // Update theme
    const updateTheme = () => {
      localStorage.setItem('theme', theme.value)
      // Apply theme logic would go here
      console.log('Theme updated to:', theme.value)
    }

    // Update results per page
    const updateResultsPerPage = () => {
      localStorage.setItem('resultsPerPage', resultsPerPage.value)
      console.log('Results per page:', resultsPerPage.value)
    }

    // Update privacy settings
    const updatePrivacySettings = () => {
      localStorage.setItem('profileVisibility', profileVisibility.value)
      console.log('Profile visibility:', profileVisibility.value)
    }

    // Update analytics settings
    const updateAnalyticsSettings = () => {
      localStorage.setItem('analyticsEnabled', analyticsEnabled.value)
      console.log('Analytics enabled:', analyticsEnabled.value)
    }

    // Change password
    const changePassword = async () => {
      if (passwordForm.new !== passwordForm.confirm) {
        alert('New passwords do not match')
        return
      }
      
      try {
        // In a real app, this would make an API call to change the password
        console.log('Changing password...')
        showChangePassword.value = false
        // Reset form
        Object.keys(passwordForm).forEach(key => {
          passwordForm[key] = ''
        })
      } catch (error) {
        console.error('Failed to change password:', error)
      }
    }

    // Export user data
    const exportUserData = async () => {
      try {
        // In a real app, this would trigger a data export
        console.log('Exporting user data...')
        alert('Your data export will be emailed to you shortly.')
      } catch (error) {
        console.error('Failed to export data:', error)
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      user,
      editMode,
      displayName,
      emailNotifications,
      theme,
      resultsPerPage,
      profileVisibility,
      analyticsEnabled,
      showChangePassword,
      passwordForm,
      saveDisplayName,
      cancelEdit,
      updateNotificationSettings,
      updateTheme,
      updateResultsPerPage,
      updatePrivacySettings,
      updateAnalyticsSettings,
      changePassword,
      exportUserData
    }
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.settings-section h3 {
  font-size: 1.25rem;
  color: #2c7cb9;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e8f0ff;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.setting-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.setting-input input:disabled {
  background: #f8f9fa;
  color: #666;
}

.setting-select select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  min-width: 200px;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.toggle-label {
  font-weight: normal !important;
  margin-bottom: 0 !important;
  cursor: pointer;
}

.setting-description {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.edit-btn, .save-btn, .cancel-btn, .secondary-btn, .primary-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn, .secondary-btn {
  background: #6c757d;
  color: white;
}

.edit-btn:hover, .secondary-btn:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.save-btn, .primary-btn {
  background: #2c7cb9;
  color: white;
}

.save-btn:hover, .primary-btn:hover {
  background: #1e5a8a;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.danger-zone {
}

.danger-zone h3 {
  color: #dc3545;
  border-bottom-color: #f8d7da;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  color: #2c7cb9;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }
  
  .setting-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .edit-actions {
    margin-top: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>