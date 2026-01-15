<template>
  <div class="search-history">
    <!-- Toggle Button -->
    <button class="history-toggle" @click="showPanel = !showPanel">
      <span class="toggle-icon">{{ showPanel ? '▼' : '▶' }}</span>
      <span>History</span>
      <span class="badge" v-if="totalCount > 0">{{ totalCount }}</span>
    </button>

    <!-- Panel -->
    <div v-show="showPanel" class="history-panel">
      <!-- Tabs -->
      <div class="panel-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Recent ({{ searchHistory.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'saved' }"
          @click="activeTab = 'saved'"
        >
          Saved ({{ savedQueries.length }})
        </button>
      </div>

      <!-- History Tab -->
      <div v-show="activeTab === 'history'" class="tab-content">
        <div v-if="searchHistory.length === 0" class="empty-state">
          No recent searches
        </div>
        <div v-else class="query-list">
          <div
            v-for="(item, index) in searchHistory"
            :key="'h-' + index"
            class="query-item"
            :title="formatQueryFull(item)"
          >
            <div class="query-main" @click="$emit('load', item)">
              <div class="query-type">{{ item.type === 'simple' ? 'Simple' : 'Advanced' }}</div>
              <div class="query-text">{{ formatQuery(item) }}</div>
              <div class="query-time">{{ formatTime(item.timestamp) }}</div>
            </div>
            <div class="query-actions">
              <button class="action-btn save-btn" @click="saveQuery(item)" title="Save">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <button class="action-btn copy-btn" @click="copyLink(item)" title="Copy Link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
              <button class="action-btn delete-btn" @click="removeHistory(index)" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <button v-if="searchHistory.length > 0" class="clear-btn" @click="clearHistory">
          Clear History
        </button>
      </div>

      <!-- Saved Tab -->
      <div v-show="activeTab === 'saved'" class="tab-content">
        <div v-if="savedQueries.length === 0" class="empty-state">
          No saved queries. Click Save to save a search.
        </div>
        <div v-else class="query-list">
          <div
            v-for="(item, index) in savedQueries"
            :key="'s-' + index"
            class="query-item saved"
            :title="formatQueryFull(item)"
          >
            <div class="query-main" @click="$emit('load', item)">
              <div class="query-name" v-if="item.name">{{ item.name }}</div>
              <div class="query-type">{{ item.type === 'simple' ? 'Simple' : 'Advanced' }}</div>
              <div class="query-text">{{ formatQuery(item) }}</div>
            </div>
            <div class="query-actions">
              <button class="action-btn copy-btn" @click="copyLink(item)" title="Copy Link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
              <button class="action-btn delete-btn" @click="removeSaved(index)" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Link Display -->
      <div v-if="copiedLink" class="link-copied">
        Link copied to clipboard!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits, defineExpose } from 'vue';

const emit = defineEmits(['load']);

const showPanel = ref(false);
const activeTab = ref('history');
const searchHistory = ref([]);
const savedQueries = ref([]);
const copiedLink = ref(false);

const HISTORY_KEY = 'fn2_search_history';
const SAVED_KEY = 'fn2_saved_queries';
const MAX_HISTORY = 20;

const totalCount = computed(() => searchHistory.value.length + savedQueries.value.length);

// Load from localStorage
onMounted(() => {
  const history = localStorage.getItem(HISTORY_KEY);
  const saved = localStorage.getItem(SAVED_KEY);

  if (history) {
    try {
      searchHistory.value = JSON.parse(history);
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  }

  if (saved) {
    try {
      savedQueries.value = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved queries:', e);
    }
  }

  // Check URL for shared search
  loadFromURL();
});

// Save to localStorage
const saveToStorage = () => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value));
  localStorage.setItem(SAVED_KEY, JSON.stringify(savedQueries.value));
};

// Add to history
const addToHistory = (query) => {
  const item = {
    ...query,
    timestamp: Date.now()
  };

  // Remove duplicate
  searchHistory.value = searchHistory.value.filter(h =>
    JSON.stringify({ type: h.type, term: h.term, conditions: h.conditions }) !==
    JSON.stringify({ type: item.type, term: item.term, conditions: item.conditions })
  );

  // Add to front
  searchHistory.value.unshift(item);

  // Limit size
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY);
  }

  saveToStorage();
};

// Save query
const saveQuery = (item) => {
  const name = prompt('Enter a name for this search (optional):');
  const saved = {
    ...item,
    name: name || '',
    savedAt: Date.now()
  };

  savedQueries.value.unshift(saved);
  saveToStorage();
};

// Remove from history
const removeHistory = (index) => {
  searchHistory.value.splice(index, 1);
  saveToStorage();
};

// Remove from saved
const removeSaved = (index) => {
  savedQueries.value.splice(index, 1);
  saveToStorage();
};

// Clear history
const clearHistory = () => {
  if (confirm('Clear all search history?')) {
    searchHistory.value = [];
    saveToStorage();
  }
};

// Format query for display (truncated)
const formatQuery = (item) => {
  if (item.type === 'simple') {
    const text = `"${item.term}"`;
    return text.length > 40 ? text.slice(0, 40) + '...' : text;
  } else {
    // Advanced search
    if (!item.conditions || item.conditions.length === 0) return '(empty)';
    const full = item.conditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(' AND ');
    return full.length > 50 ? full.slice(0, 50) + '...' : full;
  }
};

// Format query full (for tooltip)
const formatQueryFull = (item) => {
  if (item.type === 'simple') {
    return `Simple Search: "${item.term}"`;
  } else {
    // Advanced search
    if (!item.conditions || item.conditions.length === 0) return 'Advanced Search: (empty)';
    const conditions = item.conditions.map(c => {
      let text = `${c.fieldLabel || c.field} ${c.operator} "${c.value}"`;
      if (c.orConditions && c.orConditions.length > 0) {
        const orTexts = c.orConditions.map(or => `OR ${or.operator} "${or.value}"`);
        text += ' ' + orTexts.join(' ');
      }
      return text;
    }).join('\n');
    return `Advanced Search:\n${conditions}`;
  }
};

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

// Generate shareable URL
const generateURL = (item) => {
  const params = new URLSearchParams();

  if (item.type === 'simple') {
    params.set('q', item.term);
  } else {
    params.set('adv', '1');
    params.set('c', JSON.stringify(item.conditions));
  }

  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

// Copy link to clipboard
const copyLink = async (item) => {
  const url = generateURL(item);

  try {
    await navigator.clipboard.writeText(url);
    copiedLink.value = true;
    setTimeout(() => {
      copiedLink.value = false;
    }, 2000);
  } catch (e) {
    // Fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    copiedLink.value = true;
    setTimeout(() => {
      copiedLink.value = false;
    }, 2000);
  }
};

// Load search from URL params
const loadFromURL = () => {
  const params = new URLSearchParams(window.location.search);

  if (params.has('q')) {
    // Simple search
    const term = params.get('q');
    emit('load', { type: 'simple', term });
  } else if (params.has('adv') && params.has('c')) {
    // Advanced search
    try {
      const conditions = JSON.parse(params.get('c'));
      emit('load', { type: 'advanced', conditions });
    } catch (e) {
      console.error('Failed to parse URL conditions:', e);
    }
  }
};

// Expose methods for parent
defineExpose({
  addToHistory
});
</script>

<style scoped>
.search-history {
  margin-bottom: 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.history-toggle:hover {
  background: #f8f9fa;
}

.toggle-icon {
  font-size: 10px;
  color: #3498db;
}

.badge {
  background: #3498db;
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.history-panel {
  border-top: 1px solid #e9ecef;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f5f5f5;
}

.tab-btn.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  margin-bottom: -1px;
}

.tab-content {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.query-list {
  padding: 8px;
}

.query-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.query-item:hover {
  background: #e3f2fd;
}

.query-item.saved {
  background: #fff8e1;
}

.query-item.saved:hover {
  background: #ffecb3;
}

.query-main {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.query-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.query-type {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.query-text {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 4px 0;
}

.query-time {
  font-size: 11px;
  color: #999;
}

.query-actions {
  display: flex;
  gap: 4px;
  margin-left: 10px;
}

.action-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  color: #999;
}

.action-btn svg {
  flex-shrink: 0;
}

.save-btn:hover {
  background: #fef9e7;
  color: #d4ac0d;
}

.copy-btn:hover {
  background: #eaf2f8;
  color: #5dade2;
}

.delete-btn:hover {
  background: #fdedec;
  color: #e74c3c;
}

.clear-btn {
  display: block;
  width: calc(100% - 16px);
  margin: 8px;
  padding: 8px;
  border: 1px solid #dc3545;
  background: transparent;
  color: #dc3545;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.link-copied {
  padding: 10px;
  background: #d4edda;
  color: #155724;
  text-align: center;
  font-size: 13px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
