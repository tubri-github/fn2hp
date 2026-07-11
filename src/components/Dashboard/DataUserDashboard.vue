<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">FishNet 2</div>
        <div class="user-info">Dr. Henry Bart</div>
      </div>
      
      <ul class="sidebar-menu">
        <li :class="{ active: activeMenu === 'dashboard' }" @click="activeMenu = 'dashboard'">Dashboard</li>
        <li @click="activeMenu = 'search'">Search & Browse</li>
        <li @click="activeMenu = 'interests'">My Interests</li>
        <li @click="activeMenu = 'downloads'">Data Downloads</li>
        <li @click="activeMenu = 'flags'">My Flags</li>
        <li @click="activeMenu = 'messages'">Messages</li>
        <li @click="activeMenu = 'profile'">Profile Settings</li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="header">
        <h1 class="page-title">User Dashboard</h1>
        <div class="header-actions">
          <button class="secondary-button">Export Data</button>
          <button class="button">New Search</button>
        </div>
      </div>

      <!-- Notification Panel -->
      <div v-if="notifications.length > 0" class="notification-panel">
        <div class="notification-header">
          <h2 class="notification-title">Recent Updates</h2>
          <button class="button" @click="markAllAsRead">Mark All Read</button>
        </div>
        <ul class="notification-list">
          <li v-for="notification in notifications" :key="notification.id" class="notification-item">
            <div class="notification-icon">&bull;</div>
            <div class="notification-content">
              <div class="notification-text">{{ notification.text }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
            <div class="notification-close" @click="removeNotification(notification.id)">&times;</div>
          </li>
        </ul>
      </div>

      <!-- Panels Grid -->
      <div class="panels-grid">
        <!-- My Interests -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">My Interests</h2>
          </div>
          <div class="panel-content">
            <div class="interest-groups">
              <div v-for="interest in interests" :key="interest.id" class="interest-tag">
                {{ interest.name }}
                <span class="tag-remove" @click="removeInterest(interest.id)">&times;</span>
              </div>
            </div>
            <div class="chart-container">
              <div ref="interestChart" style="width: 100%; height: 200px;"></div>
            </div>
          </div>
        </div>

        <!-- Quick Search -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Quick Search</h2>
          </div>
          <div class="panel-content">
            <div class="search-box">
              <input 
                v-model="searchQuery"
                type="text" 
                class="search-input" 
                placeholder="Enter search terms..."
                @keyup.enter="performSearch"
              >
              <button class="search-button" @click="performSearch">Search</button>
            </div>
            
            <div class="section-title" style="margin-top: 15px; margin-bottom: 10px;">Saved Searches</div>
            <ul class="saved-searches">
              <li v-for="search in savedSearches" :key="search.id" class="saved-search-item">
                <div>
                  <div class="saved-search-name">{{ search.name }}</div>
                  <div class="saved-search-details">Run {{ search.runCount }} times • Last: {{ search.lastRun }}</div>
                </div>
                <button class="button" style="padding: 4px 8px; font-size: 12px;" @click="runSavedSearch(search)">Run</button>
              </li>
            </ul>
          </div>
        </div>

        <!-- My Data Flags -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">My Data Flags</h2>
            <div class="panel-actions">
              <button class="button">View All</button>
            </div>
          </div>
          <div class="panel-content">
            <ul class="flags-list">
              <li v-for="flag in userFlags" :key="flag.id" class="flag-item" @click="openFlagDetail(flag)">
                <div class="flag-icon">&bull;</div>
                <div class="flag-content">
                  <div class="flag-title">{{ flag.title }}</div>
                  <div class="flag-details">{{ flag.type }} • {{ flag.date }} • <span :class="['status-badge', flag.status]">{{ flag.status }}</span></div>
                </div>
                <div class="flag-actions">
                  <button class="flag-button resolve" @click.stop="openFlagDetail(flag)">View</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="panel panel-double-width">
          <div class="panel-header">
            <h2 class="panel-title">Recent Activity</h2>
          </div>
          <div class="panel-content">
            <ul class="activity-list">
              <li v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.description }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Recent Messages -->
        <div class="panel panel-full-width">
          <div class="panel-header">
            <h2 class="panel-title">Recent Messages</h2>
            <div class="panel-actions">
              <button class="button">View All</button>
            </div>
          </div>
          <div class="panel-content">
            <ul class="messages-list">
              <li v-for="message in recentMessages" :key="message.id" class="message-item">
                <div class="message-avatar">{{ message.from.charAt(0) }}</div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ message.from }}</span>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <div class="message-text">{{ message.text }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Flag Detail Modal -->
    <div v-if="showFlagModal" class="modal-backdrop" @click="closeFlagModal">
      <div class="modal" @click.stop>
        <div class="modal-close" @click="closeFlagModal">&times;</div>

        <div class="issue-header">
          <div>
            <h1 class="issue-title">{{ selectedFlag?.title }}</h1>
            <div class="issue-meta">
              <div class="meta-item">
                <span class="meta-label">Type:</span> {{ selectedFlag?.type }}
              </div>
              <div class="meta-item">
                <span class="meta-label">Status:</span>
                <span :class="['status-badge', selectedFlag?.status]">{{ selectedFlag?.status }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Created:</span> {{ selectedFlag?.date }}
              </div>
            </div>
          </div>
        </div>

        <div class="tabs">
          <div :class="['tab', { active: modalTab === 'details' }]" @click="modalTab = 'details'">Details</div>
          <div :class="['tab', { active: modalTab === 'timeline' }]" @click="modalTab = 'timeline'">Timeline</div>
          <div :class="['tab', { active: modalTab === 'reply' }]" @click="modalTab = 'reply'">Reply</div>
        </div>

        <div :class="['tab-content', { active: modalTab === 'details' }]">
          <div class="record-info">
            <h3 class="section-title">Issue Details</h3>
            <p>{{ selectedFlag?.flagData?.message || selectedFlag?.description || 'No description' }}</p>
            <div class="record-details" v-if="selectedFlag?.flagData">
              <div class="detail-item" v-if="selectedFlag.flagData.scientific_name">
                <span class="detail-label">Scientific Name</span>
                <span class="detail-value">{{ selectedFlag.flagData.scientific_name }}</span>
              </div>
              <div class="detail-item" v-if="selectedFlag.flagData.catalog_number">
                <span class="detail-label">Catalog Number</span>
                <span class="detail-value">{{ selectedFlag.flagData.catalog_number }}</span>
              </div>
              <div class="detail-item" v-if="selectedFlag.flagData.institution_code">
                <span class="detail-label">Institution</span>
                <span class="detail-value">{{ selectedFlag.flagData.institution_code }}</span>
              </div>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: modalTab === 'timeline' }]">
          <div class="record-info">
            <h3 class="section-title">Conversation</h3>
            <div class="timeline-items">
              <!-- Initial flag message -->
              <div v-if="selectedFlag?.flagData" class="timeline-item">
                <div class="timeline-header">
                  <span class="timeline-author">{{ selectedFlag.flagData.username }} (You)</span>
                  <span class="timeline-time">{{ new Date(selectedFlag.flagData.created_at).toLocaleString() }}</span>
                </div>
                <div class="timeline-content">{{ selectedFlag.flagData.message }}</div>
              </div>
              <!-- Replies -->
              <div v-for="reply in flagReplies" :key="reply.id" class="timeline-item">
                <div class="timeline-header">
                  <span class="timeline-author">{{ reply.username }} ({{ reply.user_role === 'provider' ? 'Provider' : 'You' }})</span>
                  <span class="timeline-time">{{ new Date(reply.created_at).toLocaleString() }}</span>
                </div>
                <div class="timeline-content">{{ reply.message }}</div>
              </div>
              <div v-if="flagReplies.length === 0 && !selectedFlag?.flagData?.provider_response" class="no-replies">
                No replies yet.
              </div>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: modalTab === 'reply' }]">
          <div class="reply-form">
            <h3 class="form-title">Add Reply</h3>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea v-model="replyMessage" class="form-control" rows="4" placeholder="Type your reply..."></textarea>
            </div>
            <div class="form-actions">
              <div></div>
              <div>
                <button class="secondary-button" @click="closeFlagModal">Cancel</button>
                <button class="button" @click="sendReply" :disabled="!replyMessage.trim()">Send Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// Reactive data
const activeMenu = ref('dashboard')
const searchQuery = ref('')
const showFlagModal = ref(false)
const selectedFlag = ref(null)
const modalTab = ref('details')
const replyMessage = ref('')
const flagReplies = ref([])

const openFlagDetail = async (flag) => {
  selectedFlag.value = flag
  modalTab.value = 'details'
  replyMessage.value = ''
  flagReplies.value = []
  showFlagModal.value = true

  // Load replies if this is a record flag
  if (flag.flagData) {
    await loadFlagReplies(flag.flagData.id)
  }
}

const closeFlagModal = () => {
  showFlagModal.value = false
  selectedFlag.value = null
  replyMessage.value = ''
  flagReplies.value = []
}

const loadFlagReplies = async (flagId) => {
  try {
    const response = await fetch(`${ESPGSQL_API_URL}/flags/record/${flagId}/replies`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) return

    const data = await response.json()
    flagReplies.value = data.replies || []
  } catch (error) {
    console.error('Failed to load replies:', error)
  }
}

const sendReply = async () => {
  if (!replyMessage.value.trim() || !selectedFlag.value?.flagData) return

  try {
    const flagId = selectedFlag.value.flagData.id

    const response = await fetch(`${ESPGSQL_API_URL}/flags/record/${flagId}/replies`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: replyMessage.value })
    })

    if (!response.ok) {
      console.error('Failed to send reply:', await response.text())
      return
    }

    const newReply = await response.json()
    flagReplies.value.push(newReply)
    replyMessage.value = ''
    modalTab.value = 'timeline'
  } catch (error) {
    console.error('Failed to send reply:', error)
  }
}

// Chart ref
const interestChart = ref(null)

// Data
const notifications = ref([
  {
    id: 1,
    text: 'New fish specimen records from Pacific Ocean expedition have been added to your research area.',
    time: '2 hours ago'
  },
  {
    id: 2,
    text: 'Your data quality flag for specimen TU-2024-001 has been resolved by the data provider.',
    time: '1 day ago'
  },
  {
    id: 3,
    text: 'System maintenance scheduled for January 20, 2024 from 2:00-4:00 AM EST.',
    time: '3 days ago'
  }
])

const interests = ref([
  { id: 1, name: 'Cyprinidae' },
  { id: 2, name: 'PreservedSpecimen' },
  { id: 3, name: 'United States' }
])

const savedSearches = ref([
  {
    id: 1,
    name: 'Pacific Tuna Species',
    runCount: 15,
    lastRun: '2024-01-15'
  },
  {
    id: 2,
    name: 'Deep Sea Fish (>200m)',
    runCount: 8,
    lastRun: '2024-01-12'
  },
  {
    id: 3,
    name: 'Scombridae Family Records',
    runCount: 23,
    lastRun: '2024-01-10'
  }
])

const userFlags = ref([
])

const ESPGSQL_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const recentActivity = ref([
  {
    id: 1,
    type: 'search',
    description: 'Searched for "Pacific bluefin tuna specimens"',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'download',
    description: 'Downloaded dataset: "Scombridae specimens from California waters"',
    time: '1 day ago'
  },
  {
    id: 3,
    type: 'flag',
    description: 'Flagged specimen record TU-2024-001 for taxonomic review',
    time: '3 days ago'
  },
  {
    id: 4,
    type: 'search',
    description: 'Searched for "deep sea fish specimens North Pacific"',
    time: '1 week ago'
  }
])

const recentMessages = ref([
  {
    id: 1,
    from: 'Dr. Sarah Johnson',
    text: 'Thank you for the tuna identification inquiry. Based on the morphological features in the images you provided, this specimen appears to be...',
    time: '2 hours ago'
  },
  {
    id: 2,
    from: 'System Admin',
    text: 'Your recent data quality flags have been reviewed and processed. Two issues have been resolved, one is still under investigation.',
    time: '1 day ago'
  },
  {
    id: 3,
    from: 'Dr. Martinez',
    text: 'I noticed you\'re working on Pacific tuna research. We have some new specimens from our recent expedition that might interest you.',
    time: '3 days ago'
  }
])

// Methods
const markAllAsRead = () => {
  notifications.value = []
}

const removeNotification = (notificationId) => {
  notifications.value = notifications.value.filter(n => n.id !== notificationId)
}

const removeInterest = (interestId) => {
  interests.value = interests.value.filter(i => i.id !== interestId)
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('Searching for:', searchQuery.value)
  }
}

const runSavedSearch = (search) => {
  search.runCount++
  search.lastRun = new Date().toLocaleDateString()
  console.log('Running saved search:', search.name)
}

const getActivityIcon = (type) => {
  const icons = {
    search: 'S',
    download: 'D',
    flag: 'F'
  }
  return icons[type] || '-'
}

const initInterestChart = () => {
  nextTick(() => {
    if (interestChart.value) {
      const chartInstance = echarts.init(interestChart.value)
      const option = {
        title: {
          text: 'Interest Distribution',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: [
              { value: 45, name: 'Cyprinidae' },
              { value: 35, name: 'PreservedSpecimen' },
              { value: 20, name: 'United States' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              color: function(params) {
                const colors = ['#3498db', '#2ecc71', '#f39c12']
                return colors[params.dataIndex % colors.length]
              }
            }
          }
        ]
      }
      chartInstance.setOption(option)

      window.addEventListener('resize', () => {
        chartInstance.resize()
      })
    }
  })
}

// Load user's record flags from ESPgsql API
const loadUserRecordFlags = async () => {
  try {
    const response = await fetch(`${ESPGSQL_API_URL}/flags/record/user`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()

    const recordFlagsFormatted = (data.flags || []).map(flag => ({
      id: `record-${flag.id}`,
      title: `${flag.scientific_name || flag.catalog_number || 'Record'} @ ${flag.institution_code}`,
      type: 'Record Flag',
      date: new Date(flag.created_at).toLocaleDateString(),
      status: flag.status === 'open' ? 'pending' : flag.status,
      providerResponse: flag.provider_response,
      flagData: flag
    }))

    const nonRecordFlags = userFlags.value.filter(
      f => !f.id.toString().startsWith('record-')
    )
    // Newest first
    userFlags.value = [...recordFlagsFormatted, ...nonRecordFlags]

  } catch (error) {
    console.error('Failed to load user record flags:', error)
  }
}

onMounted(() => {
  initInterestChart()
  loadUserRecordFlags()
})
</script>

<style scoped>
/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f5f5f5;
  line-height: 1.6;
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

/* Sidebar styles */
.sidebar {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px 0;
}

.sidebar-header {
  padding: 0 20px 20px 20px;
  border-bottom: 1px solid #34495e;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-info {
  font-size: 14px;
  opacity: 0.8;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.sidebar-menu li {
  padding: 10px 20px;
  cursor: pointer;
}

.sidebar-menu li:hover {
  background: #34495e;
}

.sidebar-menu li.active {
  background: #3498db;
  font-weight: bold;
}

/* Main content styles */
.main-content {
  padding: 20px;
  overflow-y: auto;
  /* grid item: allow it to shrink so wide tables/charts scroll inside it
     instead of pushing the whole dashboard past the viewport. */
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  /* Header.vue's global (un-scoped) .header leaks position:relative + z-index:1000
     onto this div, putting the page title in the same stacking layer as the nav
     bar and (being later in the DOM) over the nav's user dropdown. Drop out of
     that positioned layer so the nav dropdown stays on top. */
  position: static;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.button {
  padding: 8px 15px;
  background: #3498db;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.secondary-button {
  padding: 8px 15px;
  background: #ecf0f1;
  color: #2c3e50;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

/* Notification panel - UNIQUE TO DataUser.html */
.notification-panel {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 15px;
  margin-bottom: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.notification-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
}

.notification-icon {
  width: 24px;
  height: 24px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2196f3;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 14px;
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin-bottom: 5px;
  font-size: 14px;
}

.notification-time {
  font-size: 12px;
  color: #777;
}

.notification-close {
  cursor: pointer;
  color: #bbb;
  font-size: 18px;
  margin-left: 10px;
}

/* Panels Grid */
.panels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.panel {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 10px;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-full-width {
  grid-column: span 3;
}

.panel-double-width {
  grid-column: span 2;
}

/* Interest groups - UNIQUE TO DataUser.html */
.interest-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.interest-tag {
  background: #e1f5fe;
  color: #0288d1;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.tag-remove {
  margin-left: 5px;
  cursor: pointer;
  font-weight: bold;
}

/* Search box - UNIQUE TO DataUser.html */
.search-box {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.search-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

/* Saved searches - UNIQUE TO DataUser.html */
.saved-searches {
  list-style: none;
  padding: 0;
  margin: 0;
}

.saved-search-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saved-search-name {
  font-weight: bold;
}

.saved-search-details {
  font-size: 13px;
  color: #777;
  margin-top: 3px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

/* Flags list */
.flags-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.flag-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.flag-item:hover {
  background-color: #f9f9f9;
}

.flag-icon {
  width: 24px;
  height: 24px;
  background: #ff9800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.flag-content {
  flex: 1;
}

.flag-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.flag-details {
  font-size: 13px;
  color: #666;
}

.flag-actions {
  display: flex;
  gap: 8px;
  margin-left: 10px;
  flex-shrink: 0;
}

.flag-button {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.flag-button.resolve {
  background: #4caf50;
  color: white;
}

.flag-button.dismiss {
  background: #f5f5f5;
  color: #333;
}

/* Flag status variations - Enhanced for DataUser.html */
.status-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.status-badge.pending {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.resolved {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Activity list */
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: bold;
  margin-bottom: 3px;
}

.activity-time {
  font-size: 12px;
  color: #777;
}

/* Messages list */
.messages-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.message-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-weight: bold;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-sender {
  font-weight: bold;
}

.message-time {
  color: #999;
  font-size: 12px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

/* Charts */
.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

/* Modal styles (matching Provider Dashboard) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 5px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  color: #777;
  cursor: pointer;
  z-index: 1;
}

.issue-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.issue-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.issue-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.meta-label {
  font-weight: bold;
  margin-right: 5px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background-color: #f5f5f5;
}

.tab {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: bold;
}

.tab.active {
  background-color: white;
  border-bottom: 2px solid #3498db;
}

.tab-content {
  padding: 20px;
  display: none;
}

.tab-content.active {
  display: block;
}

.record-info {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.record-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  color: #666;
  font-size: 12px;
  margin-bottom: 3px;
}

.detail-value {
  font-size: 14px;
}

.timeline-items {
  border-left: 2px solid #e0e0e0;
  padding: 0 0 0 20px;
  margin-left: 10px;
}

.timeline-item {
  position: relative;
  margin-bottom: 25px;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: -26px;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3498db;
  border: 2px solid white;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.timeline-author {
  font-weight: bold;
  font-size: 14px;
}

.timeline-time {
  font-size: 12px;
  color: #777;
}

.timeline-content {
  background: white;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.no-replies {
  color: #999;
  font-style: italic;
  font-size: 14px;
  padding: 10px 0;
}

.reply-form {
  padding: 20px;
  border-top: 1px solid #eee;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Responsive (2026-07-11): the dashboard had no @media at all — the fixed
   240px sidebar + multi-column grids overflowed on tablet/phone. Collapse the
   sidebar to a top strip with a horizontal menu and stack the content. */
@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .sidebar {
    padding: 12px 0 0;
  }
  .sidebar-menu {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 4px;
    margin: 12px 0 0;
    padding: 0 12px 8px;
    -webkit-overflow-scrolling: touch;
  }
  .sidebar-menu li {
    white-space: nowrap;
    border-radius: 6px;
    padding: 8px 14px;
  }
  .panels-grid {
    grid-template-columns: 1fr;
  }
  .main-content {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .header-actions {
    width: 100%;
  }
}
</style>