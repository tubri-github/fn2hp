<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">Fishnet2</div>
        <div class="user-info">{{ reportData.Institution }}</div>
      </div>
      
      <ul class="sidebar-menu">
        <li :class="{ active: activeMenu === 'dashboard' }" @click="activeMenu = 'dashboard'">Dashboard</li>
        <li @click="openDataManagement">Data Management</li>
        <li>Data Quality</li>
        <li @click="activeMenu = 'logs'; showProcessingModal = true">Processing Logs</li>
        <li @click="activeMenu = 'flags'">Flags & Issues</li>
        <li @click="activeMenu = 'messages'">Messages</li>
        <li @click="activeMenu = 'profile'">Profile</li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="header">
        <h1 class="page-title">Data Provider Dashboard</h1>
        <div class="header-actions">
          <button class="secondary-button">Export Report</button>
          <button class="button">Update Data</button>
        </div>
      </div>

      <!-- Stats Summary (powered by ETL report data) -->
      <div v-if="activeMenu === 'dashboard'" class="stats-summary">
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(reportData.total_records) }}</div>
          <div class="stat-label">Total Records</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ Object.keys(reportData.field_statistics).length }}</div>
          <div class="stat-label">Fields Analyzed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageValidPct }}%</div>
          <div class="stat-label">Data Completeness</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(totalModifications) }}</div>
          <div class="stat-label">Modifications</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(totalIssues) }}</div>
          <div class="stat-label">Issues Found</div>
        </div>
      </div>

      <!-- Panels Grid -->
      <div v-if="activeMenu === 'dashboard'" class="panels-grid">
        <!-- ETL Processing Report Panel -->
        <div class="panel panel-full-width report-panel">
          <div class="report-panel-header">
            <div>
              <h2 class="panel-title">Latest Processing Report</h2>
              <span class="report-panel-meta">{{ reportData.filename }} &bull; {{ reportData.Institution }} ({{ reportData['Institution Code'] }}) &bull; {{ reportData.processing_time.duration_seconds.toFixed(1) }}s</span>
            </div>
            <button class="button" @click="showReportDetail = !showReportDetail">
              {{ showReportDetail ? 'Collapse' : 'View Details' }}
            </button>
          </div>
          <!-- Field health mini bars -->
          <div class="field-health-row">
            <div v-for="(stats, field) in reportData.field_statistics" :key="field" class="field-health-item">
              <div class="field-health-name">{{ field }}</div>
              <div class="field-health-bar">
                <div class="field-health-fill" :style="{ width: ((stats.valid / stats.total) * 100) + '%' }" :class="getValidPctClass(stats.valid, stats.total)"></div>
              </div>
              <div class="field-health-pct">{{ ((stats.valid / stats.total) * 100).toFixed(0) }}%</div>
            </div>
          </div>
          <!-- Expandable detail section -->
          <div v-if="showReportDetail" class="report-detail-section">
            <h3 class="report-detail-heading">Field Statistics</h3>
            <table class="table report-detail-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Total</th>
                  <th>Empty</th>
                  <th>Empty %</th>
                  <th>Valid</th>
                  <th>Valid %</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stats, field) in reportData.field_statistics" :key="field">
                  <td><code class="field-name">{{ field }}</code></td>
                  <td>{{ formatNumber(stats.total) }}</td>
                  <td>{{ formatNumber(stats.empty) }}</td>
                  <td>
                    <span class="pct-badge" :class="getEmptyPctClass(stats.empty, stats.total)">
                      {{ ((stats.empty / stats.total) * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td>{{ formatNumber(stats.valid) }}</td>
                  <td>
                    <span class="pct-badge" :class="getValidPctClass(stats.valid, stats.total)">
                      {{ ((stats.valid / stats.total) * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td>{{ formatNumber(stats.modified) }}</td>
                </tr>
              </tbody>
            </table>

            <h3 class="report-detail-heading">Modification Records</h3>
            <div v-for="(mod, field) in reportData.modification_summary" :key="field" class="mod-block">
              <div class="mod-header">
                <code class="field-name">{{ field }}</code>
                <span class="mod-count">{{ formatNumber(mod.count) }} records</span>
                <span class="mod-reasons">{{ mod.reasons.join(', ') }}</span>
              </div>
              <div class="mod-samples" v-if="mod.samples && mod.samples.length">
                <div v-for="(s, i) in mod.samples.slice(0, 3)" :key="i" class="mod-sample">
                  <span class="sample-original">{{ s.original || '(empty)' }}</span>
                  <span class="sample-arrow">&rarr;</span>
                  <span class="sample-modified">{{ s.modified }}</span>
                  <span class="sample-reason">{{ s.reason }}</span>
                </div>
              </div>
            </div>

            <h3 class="report-detail-heading">Issues Summary</h3>
            <table class="table report-detail-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Count</th>
                  <th>Sample</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(issue, key) in reportData.issues_summary" :key="key">
                  <td><code class="issue-key">{{ key }}</code></td>
                  <td>
                    <span class="issue-count" :class="getIssueSeverity(issue.count)">
                      {{ formatNumber(issue.count) }}
                    </span>
                  </td>
                  <td class="issue-sample">{{ issue.samples[0] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Data Source Information (from report) -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Data Source Information</h2>
          </div>
          <div class="panel-content">
            <div class="data-source-info">
              <div class="info-item">
                <span class="info-label">Institution:</span> {{ reportData.Institution }}
              </div>
              <div class="info-item">
                <span class="info-label">Institution Code:</span> {{ reportData['Institution Code'] }}
              </div>
              <div class="info-item">
                <span class="info-label">Source File:</span> {{ reportData.filename }}
              </div>
              <div class="info-item">
                <span class="info-label">Processing Time:</span> {{ reportData.processing_time.duration_seconds.toFixed(1) }}s
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Data Flags -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Recent Data Flags</h2>
            <div class="panel-actions">
              <button class="button">View All</button>
            </div>
          </div>
          <div class="panel-content">
            <ul class="flags-list">
              <li 
                v-for="flag in recentFlags" 
                :key="flag.id"
                class="flag-item"
                @click="openFlagModal(flag)"
              >
                <div class="flag-icon">!</div>
                <div class="flag-content">
                  <div class="flag-title">{{ flag.title }}</div>
                  <div class="flag-details">{{ flag.type }} • {{ flag.date }}</div>
                </div>
                <div class="flag-actions">
                  <button class="flag-button resolve" @click.stop="resolveFlag(flag.id)">Resolve</button>
                  <button class="flag-button dismiss" @click.stop="dismissFlag(flag.id)">Dismiss</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Messages -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Messages</h2>
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

        <!-- Data Processing Overview (from report) -->
        <div class="panel panel-double-width">
          <div class="panel-header">
            <h2 class="panel-title">Field Processing Summary</h2>
            <div class="panel-actions">
              <button class="button" @click="showProcessingModal = true">View Logs</button>
            </div>
          </div>
          <div class="panel-content">
            <table class="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Valid %</th>
                  <th>Empty</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(stats, field) in reportData.field_statistics" :key="field">
                  <td><code class="field-name">{{ field }}</code></td>
                  <td>
                    <span class="pct-badge" :class="getValidPctClass(stats.valid, stats.total)">
                      {{ ((stats.valid / stats.total) * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td>{{ formatNumber(stats.empty) }}</td>
                  <td>{{ formatNumber(stats.modified) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Data Usage Analytics -->
        <div class="panel panel-full-width">
          <div class="panel-header">
            <h2 class="panel-title">Data Usage Analytics</h2>
            <div class="tabs">
              <div 
                :class="['tab', { active: activeTab === 'activity' }]" 
                @click="activeTab = 'activity'"
              >
                User Activity
              </div>
              <div 
                :class="['tab', { active: activeTab === 'distribution' }]" 
                @click="activeTab = 'distribution'"
              >
                Data Distribution
              </div>
            </div>
          </div>
          <div class="panel-content">
            <div class="chart-container">
              <div ref="analyticsChart" style="width: 100%; height: 250px;"></div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Recent Activities</h2>
          </div>
          <div class="panel-content">
            <ul class="activity-list">
              <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon">📊</div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Data Quality Insights -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Data Quality Insights</h2>
          </div>
          <div class="panel-content">
            <div class="chart-container">
              <div ref="qualityChart" style="width: 100%; height: 250px;"></div>
            </div>
          </div>
        </div>

        <!-- Institution Information -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title">Institution Information</h2>
          </div>
          <div class="panel-content">
            <div class="data-source-info">
              <div class="info-item">
                <span class="info-label">Full Name:</span> {{ reportData.Institution }}
              </div>
              <div class="info-item">
                <span class="info-label">Institution Code:</span> {{ reportData['Institution Code'] }}
              </div>
              <div class="info-item">
                <span class="info-label">Source File:</span> {{ reportData.filename }}
              </div>
              <div class="info-item">
                <span class="info-label">Total Records:</span> {{ formatNumber(reportData.total_records) }}
              </div>
            </div>
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
            <p>{{ selectedFlag?.description }}</p>
            <div class="record-details">
              <div class="detail-item">
                <span class="detail-label">Affected Records</span>
                <span class="detail-value">{{ selectedFlag?.affectedRecords || 'Multiple' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Severity</span>
                <span class="detail-value">{{ selectedFlag?.severity || 'Medium' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: modalTab === 'timeline' }]">
          <div class="record-info">
            <h3 class="section-title">Activity Timeline</h3>
            <div class="timeline-items">
              <div v-for="event in selectedFlag?.timeline" :key="event.id" class="timeline-item">
                <div class="timeline-header">
                  <span class="timeline-author">{{ event.user }}</span>
                  <span class="timeline-time">{{ event.date }}</span>
                </div>
                <div class="timeline-content">{{ event.action }}</div>
              </div>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: modalTab === 'reply' }]">
          <div class="reply-form">
            <h3 class="form-title">Add Response</h3>
            <div class="form-group">
              <label class="form-label">Response</label>
              <textarea v-model="replyMessage" class="form-control" rows="4"></textarea>
            </div>
            <div class="form-actions">
              <div class="status-options">
                <label><input type="radio" value="resolved" v-model="newStatus"> Mark as Resolved</label>
                <label><input type="radio" value="in-progress" v-model="newStatus"> Keep In Progress</label>
              </div>
              <div>
                <button class="secondary-button" @click="closeFlagModal">Cancel</button>
                <button class="button" @click="sendReply">Send Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Modal -->
    <div v-if="showProcessingModal" class="modal-backdrop" @click="showProcessingModal = false">
      <div class="modal" @click.stop>
        <div class="modal-close" @click="showProcessingModal = false">&times;</div>
        
        <div class="modal-header">
          <h1 class="issue-title">Data Processing Logs</h1>
        </div>

        <div class="tabs">
          <div :class="['tab', { active: processTab === 'current' }]" @click="processTab = 'current'">Current Process</div>
          <div :class="['tab', { active: processTab === 'history' }]" @click="processTab = 'history'">Process History</div>
          <div :class="['tab', { active: processTab === 'errors' }]" @click="processTab = 'errors'">Error Logs</div>
        </div>

        <div :class="['tab-content', { active: processTab === 'current' }]">
          <div class="record-info">
            <div class="process-step detection">
              <strong>Detection Phase</strong>
              <div class="status-success">Completed</div>
            </div>
            <div class="log-container">
              <pre>{{ currentProcessLog }}</pre>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: processTab === 'history' }]">
          <div class="record-info">
            <div class="scrollable-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Process</th>
                    <th>Status</th>
                    <th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in processHistory" :key="log.id">
                    <td>{{ log.date }}</td>
                    <td>{{ log.process }}</td>
                    <td><span :class="['status-badge', log.status]">{{ log.status }}</span></td>
                    <td>{{ formatNumber(log.records) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div :class="['tab-content', { active: processTab === 'errors' }]">
          <div class="record-info">
            <div v-for="error in errorLogs" :key="error.id" class="error-card">
              <div class="error-title">{{ error.title }}</div>
              <div class="error-detail">{{ error.detail }}</div>
              <div class="error-detail">Time: {{ error.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import reportData from '@/assets/institutionreport/dr346_report.json'

// Reactive data
const activeMenu = ref('dashboard')
const activeTab = ref('activity')
const modalTab = ref('details')
const processTab = ref('current')
const showFlagModal = ref(false)
const showProcessingModal = ref(false)
const selectedFlag = ref(null)
const replyMessage = ref('')
const newStatus = ref('in-progress')
const showReportDetail = ref(false)

// Chart refs
const analyticsChart = ref(null)
const qualityChart = ref(null)

// Data
const recentFlags = ref([
  {
    id: 1,
    title: 'Missing latitude/longitude data',
    type: 'Geographic',
    date: '2024-01-15',
    status: 'pending',
    description: 'Several records are missing geographic coordinates for proper mapping.',
    affectedRecords: '1,247',
    severity: 'High',
    timeline: [
      { id: 1, date: '2024-01-15', user: 'System', action: 'Automatically flagged missing coordinates in batch upload' },
      { id: 2, date: '2024-01-16', user: 'Dr. Smith', action: 'Reviewed issue and contacted data source' }
    ]
  },
  {
    id: 2,
    title: 'Taxonomy mismatch detected',
    type: 'Taxonomic',
    date: '2024-01-14',
    status: 'in-progress',
    description: 'Some species names don\'t match current taxonomic standards.',
    affectedRecords: '324',
    severity: 'Medium',
    timeline: [
      { id: 1, date: '2024-01-14', user: 'Dr. Johnson', action: 'Reported taxonomic inconsistencies' }
    ]
  },
  {
    id: 3,
    title: 'Duplicate specimen records',
    type: 'Data Quality',
    date: '2024-01-13',
    status: 'resolved',
    description: 'Multiple records found for the same specimen.',
    affectedRecords: '89',
    severity: 'Low',
    timeline: [
      { id: 1, date: '2024-01-13', user: 'System', action: 'Detected potential duplicates' },
      { id: 2, date: '2024-01-14', user: 'Admin', action: 'Merged duplicate records' }
    ]
  }
])

// Outlier flags data
const outlierFlags = ref([])
const API_BASE_URL = 'http://localhost:8001'

const recentMessages = ref([
  { id: 1, from: 'Dr. Sarah Johnson', text: 'Question about specimen ZSM-001234...', time: '2 hours ago' },
  { id: 2, from: 'System Admin', text: 'Monthly data quality report is ready', time: '1 day ago' },
  { id: 3, from: 'FishNet Portal', text: 'New user registration: researcher from UCLA', time: '2 days ago' }
])

const processingData = ref([
  { id: 1, name: 'Data Validation', status: 'success', lastRun: '2024-01-15 14:30', recordsProcessed: 15234 },
  { id: 2, name: 'Taxonomy Mapping', status: 'success', lastRun: '2024-01-15 14:25', recordsProcessed: 15234 },
  { id: 3, name: 'Geographic Enhancement', status: 'in-progress', lastRun: '2024-01-15 14:35', recordsProcessed: 8756 },
  { id: 4, name: 'Image Processing', status: 'pending', lastRun: '2024-01-14 09:15', recordsProcessed: 0 }
])

const recentActivities = ref([
  { id: 1, title: 'Bulk upload completed: 1,247 new records', time: '30 minutes ago' },
  { id: 2, title: 'Data quality check initiated', time: '2 hours ago' },
  { id: 3, title: 'Taxonomy update: 23 species names updated', time: '1 day ago' },
  { id: 4, title: 'Monthly backup completed successfully', time: '2 days ago' }
])

const currentProcessLog = ref(`[2024-01-15 14:35:22] Starting geographic enhancement process...
[2024-01-15 14:35:23] Loading coordinate validation rules
[2024-01-15 14:35:25] Processing batch 1 of 157 (100 records)
[2024-01-15 14:35:27] Enhanced coordinates for 89/100 records
[2024-01-15 14:35:28] Processing batch 2 of 157 (100 records)
[2024-01-15 14:35:30] Enhanced coordinates for 92/100 records
[2024-01-15 14:35:32] Processing batch 3 of 157 (100 records)
...`)

const processHistory = ref([
  { id: 1, date: '2024-01-15', process: 'Data Validation', status: 'success', records: 15234 },
  { id: 2, date: '2024-01-14', process: 'Taxonomy Mapping', status: 'success', records: 14987 },
  { id: 3, date: '2024-01-13', process: 'Geographic Enhancement', status: 'success', records: 14756 },
  { id: 4, date: '2024-01-12', process: 'Image Processing', status: 'error', records: 0 }
])

const errorLogs = ref([
  {
    id: 1,
    title: 'Image Processing Failed',
    detail: 'Unable to process specimen images due to corrupted file format',
    time: '2024-01-12 15:45'
  },
  {
    id: 2,
    title: 'API Connection Timeout',
    detail: 'Failed to connect to taxonomy validation service',
    time: '2024-01-11 09:23'
  }
])

// Report computed
const averageValidPct = computed(() => {
  const fields = Object.values(reportData.field_statistics)
  if (fields.length === 0) return 0
  const avg = fields.reduce((sum, f) => sum + (f.valid / f.total) * 100, 0) / fields.length
  return avg.toFixed(1)
})
const totalModifications = computed(() => {
  if (!reportData.modification_summary) return 0
  return Object.values(reportData.modification_summary).reduce((sum, m) => sum + m.count, 0)
})
const totalIssues = computed(() => {
  if (!reportData.issues_summary) return 0
  return Object.values(reportData.issues_summary).reduce((sum, i) => sum + i.count, 0)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const getEmptyPctClass = (empty, total) => {
  const pct = (empty / total) * 100
  if (pct > 50) return 'pct-high'
  if (pct > 20) return 'pct-medium'
  return 'pct-low'
}

const getValidPctClass = (valid, total) => {
  const pct = (valid / total) * 100
  if (pct >= 80) return 'pct-good'
  if (pct >= 50) return 'pct-medium'
  return 'pct-poor'
}

const getIssueSeverity = (count) => {
  if (count > 100000) return 'severity-high'
  if (count > 1000) return 'severity-medium'
  return 'severity-low'
}

const openFlagModal = (flag) => {
  selectedFlag.value = flag
  showFlagModal.value = true
  modalTab.value = 'details'
}

const closeFlagModal = () => {
  showFlagModal.value = false
  selectedFlag.value = null
  replyMessage.value = ''
  newStatus.value = 'in-progress'
}

const resolveFlag = (flagId) => {
  const flag = recentFlags.value.find(f => f.id === flagId)
  if (flag) {
    flag.status = 'resolved'
  }
}

const dismissFlag = (flagId) => {
  recentFlags.value = recentFlags.value.filter(f => f.id !== flagId)
}

const sendReply = () => {
  if (replyMessage.value.trim() && selectedFlag.value) {
    selectedFlag.value.timeline.push({
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      user: 'You',
      action: replyMessage.value
    })
    if (newStatus.value === 'resolved') {
      selectedFlag.value.status = 'resolved'
    }
    replyMessage.value = ''
    modalTab.value = 'timeline'
  }
}

// Outlier flag functions
const loadOutlierFlags = async () => {
  try {
    const token = getUserToken()
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Add Authorization header only if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/flags/outlier`, {
      headers: headers,
      credentials: 'include' // Include cookies for session-based auth
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    outlierFlags.value = data.flags || []
    
    // Convert outlier flags to standard flag format and merge with existing flags
    const outlierFlagsFormatted = outlierFlags.value.map(flag => ({
      id: `outlier-${flag.id}`,
      title: `${flag.flag_type === 'severe_outlier' ? 'Severe Outlier' : flag.flag_type.charAt(0).toUpperCase() + flag.flag_type.slice(1)} - ${flag.species_name}`,
      type: `Outlier Detection (${flag.analysis_type})`,
      date: new Date(flag.created_at).toLocaleDateString(),
      status: flag.status,
      description: `Sample point #${flag.sample_point_id} flagged as ${flag.flag_type} during ${flag.analysis_type} analysis at ${flag.huc_level.toUpperCase()} level.`,
      affectedRecords: '1',
      severity: flag.flag_type === 'severe_outlier' ? 'High' : flag.flag_type === 'outlier' ? 'Medium' : 'Low',
      outlierData: flag, // Store original outlier flag data
      timeline: [
        { 
          id: 1, 
          date: new Date(flag.created_at).toLocaleDateString(), 
          user: flag.username, 
          action: `Marked as ${flag.flag_type}${flag.notes ? `: ${flag.notes}` : ''}` 
        }
      ]
    }))
    
    // Merge with existing flags, but only show recent outlier flags (limit to 5)
    const recentOutlierFlags = outlierFlagsFormatted
      .sort((a, b) => new Date(b.outlierData.created_at) - new Date(a.outlierData.created_at))
      .slice(0, 5)
    
    // Update recentFlags to include outlier flags
    const originalFlags = recentFlags.value.filter(flag => !flag.id.toString().startsWith('outlier-'))
    recentFlags.value = [...originalFlags, ...recentOutlierFlags]
    
  } catch (error) {
    console.error('Failed to load outlier flags:', error)
  }
}

const getUserToken = () => {
  // Try different possible token storage locations used by SSO systems
  const possibleTokenKeys = [
    'access_token',
    'authToken', 
    'jwt_token',
    'token',
    'fn2_token',
    'project_token'
  ]
  
  // Check localStorage first
  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key)
    if (token && token !== 'null' && token !== 'undefined') {
      return token
    }
  }
  
  // Check sessionStorage
  for (const key of possibleTokenKeys) {
    const token = sessionStorage.getItem(key)
    if (token && token !== 'null' && token !== 'undefined') {
      return token
    }
  }
  
  return null
}

const TUMMT_URL = import.meta.env.VITE_TUMMT_URL || 'http://localhost:9528'

const openDataManagement = () => {
  window.open(`${TUMMT_URL}/tummt/#/dashboard`, '_blank')
}

const initCharts = () => {
  nextTick(() => {
    // Analytics Chart
    if (analyticsChart.value) {
      const analyticsChartInstance = echarts.init(analyticsChart.value)
      const analyticsOption = {
        title: { text: 'User Activity', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        yAxis: { type: 'value' },
        series: [{
          data: [120, 200, 150, 80, 70, 110],
          type: 'line',
          smooth: true,
          itemStyle: { color: '#3498db' }
        }]
      }
      analyticsChartInstance.setOption(analyticsOption)

      window.addEventListener('resize', () => {
        analyticsChartInstance.resize()
      })
    }

    // Quality Chart
    if (qualityChart.value) {
      const qualityChartInstance = echarts.init(qualityChart.value)
      const qualityOption = {
        title: { text: 'Data Quality', textStyle: { fontSize: 14 } },
        radar: {
          indicator: [
            { name: 'Completeness', max: 100 },
            { name: 'Accuracy', max: 100 },
            { name: 'Consistency', max: 100 },
            { name: 'Timeliness', max: 100 },
            { name: 'Validity', max: 100 }
          ]
        },
        series: [{
          type: 'radar',
          data: [{
            value: [92, 88, 85, 90, 87],
            name: 'Quality Score',
            itemStyle: { color: '#3498db' }
          }]
        }]
      }
      qualityChartInstance.setOption(qualityOption)

      window.addEventListener('resize', () => {
        qualityChartInstance.resize()
      })
    }
  })
}

onMounted(() => {
  initCharts()
  loadOutlierFlags()
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

/* Stats summary */
.stats-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 5px;
  padding: 15px;
  flex: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

.stat-label {
  font-size: 12px;
  color: #777;
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

/* Data source info */
.data-source-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.info-item {
  font-size: 14px;
  line-height: 1.5;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
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

/* Table styles */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th, .table td {
  border-bottom: 1px solid #eee;
  padding: 10px;
  text-align: left;
}

.table th {
  background: #f9f9f9;
  font-weight: bold;
}

/* Charts */
.chart-container {
  border: 1px solid #eee;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
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

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.in-progress {
  background-color: #e3f2fd;
  color: #0277bd;
}

.status-badge.resolved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.success {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* Tabs */
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

/* Modal styles */
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.status-options {
  display: flex;
  gap: 10px;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.process-step {
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid;
  margin-bottom: 10px;
}

.process-step.detection {
  background: #e8f5e9;
  border-left-color: #4caf50;
}

.log-container {
  background: #1e1e1e;
  color: #f8f8f2;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-container pre {
  margin: 0;
  padding: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.scrollable-table {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 5px;
}

.scrollable-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.scrollable-table th {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
}

.scrollable-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f8f9fa;
}

.error-card {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-left: 4px solid #f56565;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.error-card .error-title {
  font-weight: bold;
  color: #c53030;
  margin-bottom: 8px;
}

.error-card .error-detail {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

/* Processing Report Styles */
.report-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-summary {
  background: white;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.report-summary-header {
  margin-bottom: 16px;
}

.report-summary-header h2 {
  font-size: 18px;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.report-meta {
  font-size: 14px;
  color: #666;
}

.report-stats-row {
  display: flex;
  gap: 15px;
}

.report-stat {
  flex: 1;
  text-align: center;
  background: #f8f9fa;
  border-radius: 5px;
  padding: 12px 8px;
}

.report-stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.report-stat-label {
  font-size: 11px;
  color: #777;
  margin-top: 2px;
}

.field-name {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  color: #555;
}

.pct-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.pct-high { background: #fbe9e7; color: #d84315; }
.pct-medium { background: #fff3e0; color: #e65100; }
.pct-low { background: #e8f5e9; color: #2e7d32; }
.pct-good { background: #e8f5e9; color: #2e7d32; }
.pct-poor { background: #fbe9e7; color: #d84315; }

.mod-block {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.mod-block:last-child {
  border-bottom: none;
}

.mod-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.mod-count {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
}

.mod-reasons {
  font-size: 12px;
  color: #888;
}

.mod-samples {
  margin-left: 8px;
  padding-left: 10px;
  border-left: 2px solid #e0e0e0;
}

.mod-sample {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 3px 0;
  color: #555;
}

.sample-original {
  color: #c0392b;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.sample-arrow {
  color: #999;
}

.sample-modified {
  color: #27ae60;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.sample-reason {
  color: #aaa;
  font-size: 10px;
  margin-left: 4px;
}

.issue-key {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: #f8f8f8;
  padding: 2px 6px;
  border-radius: 3px;
  color: #555;
}

.issue-count {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.severity-high { background: #fbe9e7; color: #d84315; }
.severity-medium { background: #fff3e0; color: #e65100; }
.severity-low { background: #e8f5e9; color: #2e7d32; }

.issue-sample {
  font-size: 12px;
  color: #777;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Report Panel */
.report-panel {
  background: #f8fafe;
  border: 1px solid #d6e4f0;
}

.report-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.report-panel-meta {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  display: block;
}

/* Field health mini bars in report panel */
.field-health-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.field-health-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.field-health-name {
  width: 110px;
  flex-shrink: 0;
  color: #555;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-health-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.field-health-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.field-health-fill.pct-good { background: #27ae60; }
.field-health-fill.pct-medium { background: #e67e22; }
.field-health-fill.pct-poor { background: #e74c3c; }

.field-health-pct {
  width: 32px;
  text-align: right;
  color: #666;
  font-size: 11px;
  font-weight: 600;
}

.report-detail-section {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.report-detail-heading {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 18px 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.report-detail-heading:first-child {
  margin-top: 0;
}

.report-detail-table {
  font-size: 13px;
}
</style>