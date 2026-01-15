<template>
  <el-dialog
    v-model="visible"
    title="Record Details"
    width="75%"
    destroy-on-close
    class="record-dialog"
  >
    <div class="record-detail" v-if="record">
      <!-- Darwin Core Taxonomy Section -->
      <div class="detail-section">
        <h3 class="section-title">Taxonomy</h3>
        <div class="darwin-core-fields">
          <div class="dc-field" v-for="field in taxonomyFields" :key="field.key">
            <div class="dc-label">{{ field.label }}</div>
            <div class="dc-value" :class="{ italic: field.italic }">
              {{ record[field.key] || '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Occurrence Section -->
      <div class="detail-section">
        <h3 class="section-title">Occurrence</h3>
        <div class="darwin-core-fields">
          <div class="dc-field" v-for="field in occurrenceFields" :key="field.key">
            <div class="dc-label">{{ field.label }}</div>
            <div class="dc-value">{{ record[field.key] || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Location Section -->
      <div class="detail-section">
        <h3 class="section-title">Location</h3>
        <div class="darwin-core-fields">
          <div class="dc-field" v-for="field in locationFields" :key="field.key">
            <div class="dc-label">{{ field.label }}</div>
            <div class="dc-value">{{ record[field.key] || '-' }}</div>
          </div>
        </div>
        <!-- Coordinates display -->
        <div v-if="hasCoordinates" class="coordinates-display">
          <div class="coord-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span class="coord-text">{{ record.DecimalLatitude }}, {{ record.DecimalLongitude }}</span>
        </div>
      </div>

      <!-- Collection Section -->
      <div class="detail-section">
        <h3 class="section-title">Collection</h3>
        <div class="darwin-core-fields">
          <div class="dc-field" v-for="field in collectionFields" :key="field.key">
            <div class="dc-label">{{ field.label }}</div>
            <div class="dc-value">{{ record[field.key] || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Data Quality Section -->
      <div class="detail-section">
        <h3 class="section-title">Data Quality</h3>
        <div class="quality-indicators">
          <div class="quality-item" :class="hasCoordinates ? 'quality-good' : 'quality-poor'">
            <span class="quality-label">Georeferenced</span>
            <span class="quality-status">{{ hasCoordinates ? 'Yes' : 'No' }}</span>
          </div>
          <div class="quality-item" :class="record.EventDate ? 'quality-good' : 'quality-poor'">
            <span class="quality-label">Date Recorded</span>
            <span class="quality-status">{{ record.EventDate ? 'Yes' : 'No' }}</span>
          </div>
          <div class="quality-item" :class="record.RecordedBy ? 'quality-good' : 'quality-poor'">
            <span class="quality-label">Collector Info</span>
            <span class="quality-status">{{ record.RecordedBy ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="visible = false">Close</button>
        <button class="btn btn-primary" @click="exportRecord">
          Export as DwC
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const taxonomyFields = [
  { key: 'Kingdom', label: 'kingdom' },
  { key: 'Phylum', label: 'phylum' },
  { key: 'Class', label: 'class' },
  { key: 'Order', label: 'order' },
  { key: 'Family', label: 'family' },
  { key: 'Genus', label: 'genus' },
  { key: 'ScientificName', label: 'scientificName', italic: true },
  { key: 'VernacularName', label: 'vernacularName' }
];

const occurrenceFields = [
  { key: 'CatalogNumber', label: 'catalogNumber' },
  { key: 'OccurrenceID', label: 'occurrenceID' },
  { key: 'RecordedBy', label: 'recordedBy' },
  { key: 'IndividualCount', label: 'individualCount' },
  { key: 'Sex', label: 'sex' },
  { key: 'LifeStage', label: 'lifeStage' }
];

const locationFields = [
  { key: 'Country', label: 'country' },
  { key: 'StateProvince', label: 'stateProvince' },
  { key: 'County', label: 'county' },
  { key: 'Locality', label: 'locality' },
  { key: 'DecimalLatitude', label: 'decimalLatitude' },
  { key: 'DecimalLongitude', label: 'decimalLongitude' },
  { key: 'CoordinateUncertaintyInMeters', label: 'coordinateUncertainty' }
];

const collectionFields = [
  { key: 'InstitutionCode', label: 'institutionCode' },
  { key: 'CollectionCode', label: 'collectionCode' },
  { key: 'EventDate', label: 'eventDate' },
  { key: 'BasisOfRecord', label: 'basisOfRecord' }
];

const hasCoordinates = computed(() => {
  return props.record?.DecimalLatitude && props.record?.DecimalLongitude;
});

const exportRecord = () => {
  console.log('Exporting record:', props.record);
  ElMessage.success('Record exported (demo)');
};
</script>

<style scoped>
.record-detail {
  max-height: 65vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #3498db;
  display: inline-block;
}

.darwin-core-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.dc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dc-label {
  font-size: 11px;
  color: #999;
  font-family: 'Courier New', monospace;
  text-transform: lowercase;
}

.dc-value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.dc-value.italic {
  font-style: italic;
}

.coordinates-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1565c0;
}

.coord-icon {
  display: flex;
  align-items: center;
}

.coord-text {
  font-size: 14px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

.quality-indicators {
  display: flex;
  gap: 16px;
}

.quality-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px;
  border-radius: 6px;
  min-width: 120px;
}

.quality-good {
  background: #e8f5e9;
}

.quality-good .quality-status {
  color: #2e7d32;
}

.quality-poor {
  background: #fafafa;
}

.quality-poor .quality-status {
  color: #999;
}

.quality-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quality-status {
  font-size: 14px;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}
</style>

<style>
/* Global dialog styles */
.record-dialog .el-dialog__header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 15px;
}

.record-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.record-dialog .el-dialog__body {
  padding: 20px 24px;
}

.record-dialog .el-dialog__footer {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}
</style>
