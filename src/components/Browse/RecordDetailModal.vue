<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Record Details</h2>
        <button class="close-button" @click="$emit('close')" aria-label="Close">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="record-info-grid">
          <!-- Specimen Information -->
          <div class="info-section">
            <h3>Specimen Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">catalogNumber:</span>
                <span class="value">{{ record.catalogNumber || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">scientificName:</span>
                <span class="value scientific-name">{{ record.scientificName || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">family:</span>
                <span class="value">{{ record.family || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">basisOfRecord:</span>
                <span class="value">{{ record.basisOfRecord || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">collectionCode:</span>
                <span class="value">{{ record.collectionCode || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Collection Information -->
          <div class="info-section">
            <h3>Collection Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">recordedBy:</span>
                <span class="value">{{ record.recordedBy || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">eventDate:</span>
                <span class="value">{{ formatDate(record.eventDate) }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">year:</span>
                <span class="value">{{ record.year || getYearFromDate(record.eventDate) || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">month:</span>
                <span class="value">{{ record.month || getMonthFromDate(record.eventDate) || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">day:</span>
                <span class="value">{{ record.day || getDayFromDate(record.eventDate) || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Geographic Information -->
          <div class="info-section">
            <h3>Geographic Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">country:</span>
                <span class="value">{{ record.country || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">stateProvince:</span>
                <span class="value">{{ record.stateProvince || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">locality:</span>
                <span class="value">{{ record.locality || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">decimalLatitude:</span>
                <span class="value">{{ record.decimalLatitude || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">decimalLongitude:</span>
                <span class="value">{{ record.decimalLongitude || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">coordinateUncertaintyInMeters:</span>
                <span class="value">{{ record.coordinateUncertaintyInMeters || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Institution Information -->
          <div class="info-section">
            <h3>Institution Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">institutionCode:</span>
                <span class="value">
                  <router-link
                      :to="{ name: 'InstitutionDetail', params: { institutionCode: record.institutionCode } }"
                      class="institution-link"
                  >
                    {{ record.institutionCode || '—' }}
                  </router-link>
                </span>
              </div>
              <div class="info-item">
                <span class="dc-field">ownerInstitutionCode:</span>
                <span class="value">{{ record.ownerInstitutionCode || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">datasetName:</span>
                <span class="value">{{ record.datasetName || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Identification Information -->
          <div class="info-section">
            <h3>Identification Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">identifiedBy:</span>
                <span class="value">{{ record.identifiedBy || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">dateIdentified:</span>
                <span class="value">{{ formatDate(record.dateIdentified) }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">identificationRemarks:</span>
                <span class="value">{{ record.identificationRemarks || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="info-section">
            <h3>Additional Information</h3>
            <div class="info-items">
              <div class="info-item">
                <span class="dc-field">occurrenceRemarks:</span>
                <span class="value">{{ record.occurrenceRemarks || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">habitat:</span>
                <span class="value">{{ record.habitat || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">associatedMedia:</span>
                <span class="value">{{ record.associatedMedia || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="dc-field">references:</span>
                <span class="value">
                  <a v-if="record.references" :href="record.references" target="_blank" rel="noopener">
                    {{ record.references }}
                  </a>
                  <span v-else>—</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <div v-if="record.decimalLatitude && record.decimalLongitude" class="map-section">
          <h3>Location</h3>
          <div class="map-placeholder">
            <p>Interactive map showing location:</p>
            <p><strong>{{ record.decimalLatitude }}, {{ record.decimalLongitude }}</strong></p>
            <p class="map-note">Map integration coming soon...</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="exportRecord" class="export-button">
          <span class="icon">📊</span>
          Export Record
        </button>
        <button @click="viewOnMap" class="map-button" :disabled="!hasCoordinates">
          <span class="icon">🗺️</span>
          View on Map
        </button>
        <button @click="$emit('close')" class="close-action-button">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// Computed properties
const hasCoordinates = computed(() => {
  return props.record.decimalLatitude && props.record.decimalLongitude
})

// Methods
const formatDate = (date) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return date
  }
}

const getYearFromDate = (date) => {
  if (!date) return null
  try {
    return new Date(date).getFullYear()
  } catch {
    return null
  }
}

const getMonthFromDate = (date) => {
  if (!date) return null
  try {
    return new Date(date).getMonth() + 1
  } catch {
    return null
  }
}

const getDayFromDate = (date) => {
  if (!date) return null
  try {
    return new Date(date).getDate()
  } catch {
    return null
  }
}

const exportRecord = () => {
  // Implement record export functionality
  console.log('Exporting record:', props.record)
}

const viewOnMap = () => {
  if (hasCoordinates.value) {
    // Implement map view functionality
    console.log('View on map:', props.record.decimalLatitude, props.record.decimalLongitude)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
}

.record-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  font-weight: normal;
  white-space: nowrap;
}

.value {
  color: #2c3e50;
  word-break: break-word;
}

.scientific-name {
  font-style: italic;
  font-weight: 500;
}

.institution-link {
  color: #3498db;
  text-decoration: none;
}

.institution-link:hover {
  text-decoration: underline;
}

.value a {
  color: #3498db;
  text-decoration: none;
}

.value a:hover {
  text-decoration: underline;
}

/* Map Section */
.map-section {
  border-top: 1px solid #eee;
  padding-top: 25px;
}

.map-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.map-placeholder {
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  color: #666;
}

.map-placeholder p {
  margin: 5px 0;
}

.map-note {
  font-style: italic;
  font-size: 14px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.export-button, .map-button, .close-action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.export-button {
  background: #27ae60;
  color: white;
}

.export-button:hover {
  background: #229954;
}

.map-button {
  background: #3498db;
  color: white;
}

.map-button:hover:not(:disabled) {
  background: #2980b9;
}

.map-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.close-action-button {
  background: #ecf0f1;
  color: #2c3e50;
}

.close-action-button:hover {
  background: #d5dbdb;
}

.icon {
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 15px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .record-info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .modal-footer {
    padding: 15px 20px;
    flex-wrap: wrap;
  }

  .export-button, .map-button, .close-action-button {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 18px;
  }

  .info-section h3 {
    font-size: 14px;
  }

  .dc-field {
    font-size: 11px;
  }

  .value {
    font-size: 14px;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>