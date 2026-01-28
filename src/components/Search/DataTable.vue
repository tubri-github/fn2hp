<template>
  <div class="data-table-container">
    <!-- Table Header with Column Selector -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <span class="result-count">{{ total }} records</span>
      </div>
      <div class="toolbar-right">
        <!-- Column Selector Button -->
        <el-popover
          placement="bottom-end"
          :width="320"
          trigger="click"
          popper-class="column-selector-popover"
        >
          <template #reference>
            <el-button type="default" size="small" class="column-btn">
              <el-icon><Setting /></el-icon>
              <span>Columns</span>
              <el-badge :value="visibleColumnCount" :max="99" class="column-badge" />
            </el-button>
          </template>

          <div class="column-selector">
            <div class="selector-header">
              <span class="selector-title">Customize Columns</span>
              <div class="selector-actions">
                <el-button link size="small" @click="selectAllColumns">Select All</el-button>
                <el-button link size="small" @click="resetColumns">Reset</el-button>
              </div>
            </div>

            <el-input
              v-model="columnSearchText"
              placeholder="Search columns..."
              size="small"
              clearable
              class="column-search"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="column-list">
              <el-checkbox-group v-model="selectedColumns">
                <div
                  v-for="field in filteredFields"
                  :key="field.prop"
                  class="column-item"
                  :class="{ 'is-recommended': isRecommendedColumn(field.prop) }"
                >
                  <el-checkbox :label="field.prop" class="column-checkbox">
                    <span class="column-name">{{ field.label }}</span>
                    <el-tag
                      v-if="isRecommendedColumn(field.prop)"
                      size="small"
                      type="info"
                      class="recommended-tag"
                    >
                      Recommended
                    </el-tag>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <div class="selector-footer">
              <span class="selected-count">{{ selectedColumns.length }} of {{ fields.length }} selected</span>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- Data Table -->
    <el-table
      :data="rows"
      border
      stripe
      style="width: 100%"
      class="custom-table"
      @row-click="onRowClick"
    >
      <!-- History Column (always visible) -->
      <el-table-column label="" width="70" fixed="left" class-name="history-column">
        <template #default="scope">
          <el-tooltip
            content="View modification history"
            placement="top"
            :show-after="400"
          >
            <span class="history-link" @click.stop="showPopup(scope.row)">
              History
            </span>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- Dynamic Columns based on selection -->
      <template v-for="field in visibleFields" :key="field.prop">
        <el-table-column
          :prop="field.prop"
          :label="field.label"
          :min-width="getColumnWidth(field.prop)"
          :sortable="isSortableColumn(field.prop)"
        >
          <template #default="scope">
            <!-- Linkable fields -->
            <a
              v-if="isLinkableField(field.prop)"
              :href="getFieldLink(field.prop, scope.row[field.prop])"
              target="_blank"
              class="field-link"
              @click.stop
            >
              {{ scope.row[field.prop] }}
            </a>
            <!-- Regular fields -->
            <span v-else>{{ formatCellValue(field.prop, scope.row[field.prop]) }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- Timeline Dialog -->
    <el-dialog
      v-model="dialogVisible"
      width="80%"
      title="Dataset Version Control Timeline: Original-FN2 Diff Comparison (Mock Data)"
      append-to-body
    >
      <TimeLineDiffViewer />
    </el-dialog>

    <!-- Pagination -->
    <el-pagination
      @current-change="onPageChange"
      :current-page="page + 1"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next, jumper"
      style="margin-top: 20px;"
    />
  </div>
</template>

<script>
import TimeLineDiffViewer from "@/components/Search/TimeLineDiffViewer.vue";
import { Setting, Search } from "@element-plus/icons-vue";

// Default columns to show (recommended)
const DEFAULT_COLUMNS = [
  'ScientificName',
  'Family',
  'InstitutionCode',
  'CatalogNumber',
  'Country',
  'StateProvince',
  'YearCollected'
];

// Recommended columns (highlighted in selector)
const RECOMMENDED_COLUMNS = [
  'ScientificName',
  'Family',
  'Genus',
  'InstitutionCode',
  'CollectionCode',
  'CatalogNumber',
  'Country',
  'StateProvince',
  'County',
  'Locality',
  'YearCollected',
  'Latitude',
  'Longitude'
];

const STORAGE_KEY = 'fishnet2_table_columns';

export default {
  name: "DataTable",
  props: {
    rows: Array,
    fields: Array,
    page: Number,
    pageSize: Number,
    total: Number,
  },
  components: {
    TimeLineDiffViewer,
    Setting,
    Search
  },
  emits: ["changePage", "row-click"],
  data() {
    return {
      dialogVisible: false,
      selectedRow: null,
      fn2hpBaseUrl: 'http://localhost:5173',
      linkableFields: ['ScientificName', 'ValidName', 'Family', 'InstitutionCode', 'Genus'],
      sortableFields: ['ScientificName', 'Family', 'Genus', 'Country', 'YearCollected', 'InstitutionCode'],
      selectedColumns: [],
      columnSearchText: '',
      initialized: false
    };
  },
  computed: {
    // Filter fields based on search text
    filteredFields() {
      if (!this.columnSearchText) {
        return this.fields;
      }
      const search = this.columnSearchText.toLowerCase();
      return this.fields.filter(field =>
        field.label.toLowerCase().includes(search) ||
        field.prop.toLowerCase().includes(search)
      );
    },
    // Get only visible fields based on selection
    visibleFields() {
      if (this.selectedColumns.length === 0) {
        return this.fields;
      }
      return this.fields.filter(field => this.selectedColumns.includes(field.prop));
    },
    // Count of visible columns
    visibleColumnCount() {
      return this.selectedColumns.length || this.fields.length;
    }
  },
  watch: {
    // Watch for fields changes to initialize selected columns
    fields: {
      handler(newFields) {
        if (newFields && newFields.length > 0 && !this.initialized) {
          this.initializeColumns();
        }
      },
      immediate: true
    },
    // Save column selection to localStorage when it changes
    selectedColumns: {
      handler(newColumns) {
        if (this.initialized && newColumns.length > 0) {
          this.saveColumnsToStorage(newColumns);
        }
      },
      deep: true
    }
  },
  methods: {
    // Initialize columns from localStorage or defaults
    initializeColumns() {
      const saved = this.loadColumnsFromStorage();
      if (saved && saved.length > 0) {
        // Filter saved columns to only include currently available fields
        const availableProps = this.fields.map(f => f.prop);
        this.selectedColumns = saved.filter(col => availableProps.includes(col));
      } else {
        // Use default columns that exist in current fields
        const availableProps = this.fields.map(f => f.prop);
        this.selectedColumns = DEFAULT_COLUMNS.filter(col => availableProps.includes(col));
      }
      this.initialized = true;
    },
    // Load from localStorage
    loadColumnsFromStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.warn('Failed to load column settings:', e);
        return null;
      }
    },
    // Save to localStorage
    saveColumnsToStorage(columns) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
      } catch (e) {
        console.warn('Failed to save column settings:', e);
      }
    },
    // Select all columns
    selectAllColumns() {
      this.selectedColumns = this.fields.map(f => f.prop);
    },
    // Reset to default columns
    resetColumns() {
      const availableProps = this.fields.map(f => f.prop);
      this.selectedColumns = DEFAULT_COLUMNS.filter(col => availableProps.includes(col));
      // If no default columns match, show all
      if (this.selectedColumns.length === 0) {
        this.selectedColumns = availableProps;
      }
    },
    // Check if column is recommended
    isRecommendedColumn(prop) {
      return RECOMMENDED_COLUMNS.includes(prop);
    },
    // Check if column is sortable
    isSortableColumn(prop) {
      return this.sortableFields.includes(prop);
    },
    showPopup(row) {
      this.selectedRow = row;
      this.dialogVisible = true;
    },
    onPageChange(newPage) {
      this.$emit("changePage", newPage - 1);
    },
    onRowClick(row) {
      this.$emit("row-click", row);
    },
    // Check if field should be linkable
    isLinkableField(fieldProp) {
      return this.linkableFields.includes(fieldProp);
    },
    // Generate link for field
    getFieldLink(fieldProp, value) {
      if (!value) return '#';

      const encodedValue = encodeURIComponent(value);

      switch (fieldProp) {
        case 'ScientificName':
        case 'ValidName':
          return `${this.fn2hpBaseUrl}/browse/species/${encodedValue}`;
        case 'Family':
          return `${this.fn2hpBaseUrl}/browse/families/${encodedValue}`;
        case 'Genus':
          return `${this.fn2hpBaseUrl}/browse/genera/${encodedValue}`;
        case 'InstitutionCode':
          return `${this.fn2hpBaseUrl}/browse/institutions/${encodedValue}`;
        default:
          return '#';
      }
    },
    // Format cell value for display
    formatCellValue(prop, value) {
      if (value === null || value === undefined) {
        return '-';
      }
      // Format coordinates
      if ((prop === 'Latitude' || prop === 'Longitude') && typeof value === 'number') {
        return value.toFixed(4);
      }
      return value;
    },
    // Get column width based on field type
    getColumnWidth(fieldProp) {
      const widths = {
        'ScientificName': '180',
        'Family': '120',
        'Genus': '100',
        'InstitutionCode': '100',
        'CollectionCode': '100',
        'CatalogNumber': '120',
        'Country': '100',
        'StateProvince': '120',
        'County': '100',
        'Locality': '200',
        'YearCollected': '80',
        'Latitude': '90',
        'Longitude': '90'
      };
      return widths[fieldProp] || '100';
    }
  },
};
</script>

<style scoped>
.data-table-container {
  width: 100%;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-count {
  font-size: 13px;
  color: #666;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.column-btn .el-icon {
  font-size: 14px;
}

.column-badge {
  margin-left: 4px;
}

.column-badge :deep(.el-badge__content) {
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
}

/* Column Selector Styles */
.column-selector {
  max-height: 450px;
  display: flex;
  flex-direction: column;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.selector-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.selector-actions {
  display: flex;
  gap: 8px;
}

.column-search {
  margin-bottom: 12px;
}

.column-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  padding-right: 4px;
}

.column-item {
  padding: 8px 10px;
  border-radius: 4px;
  transition: background-color 0.15s;
  margin-bottom: 2px;
}

.column-item:hover {
  background-color: #f5f7fa;
}

.column-item.is-recommended {
  background-color: #f0f9ff;
}

.column-item.is-recommended:hover {
  background-color: #e6f4ff;
}

.column-checkbox {
  width: 100%;
  display: flex !important;
  align-items: center;
}

.column-checkbox :deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 8px;
}

.column-name {
  font-size: 13px;
  color: #303133;
}

.recommended-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.selector-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  margin-top: 12px;
}

.selected-count {
  font-size: 12px;
  color: #909399;
}

/* Table Styles */
.custom-table {
  font-size: 12px;
  white-space: nowrap;
}

/* History Column Styles */
.history-link {
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.history-link:hover {
  color: #409eff;
}

.field-link {
  color: #3498db;
  text-decoration: none;
  transition: color 0.2s;
}

.field-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* Scrollbar styles */
.column-list::-webkit-scrollbar {
  width: 6px;
}

.column-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.column-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.column-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>

<style>
/* Global styles for popover */
.column-selector-popover {
  padding: 16px !important;
}
</style>
