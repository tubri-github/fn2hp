<template>
  <el-dialog
    v-model="dialogVisible"
    title="Flag Record"
    width="520px"
    destroy-on-close
    @close="onClose"
  >
    <div v-if="record" class="flag-form">
      <!-- Record Summary -->
      <div class="record-summary">
        <div class="summary-item" v-if="record.ScientificName">
          <span class="summary-label">Scientific Name:</span>
          <span class="summary-value">{{ record.ScientificName }}</span>
        </div>
        <div class="summary-item" v-if="record.CatalogNumber">
          <span class="summary-label">Catalog Number:</span>
          <span class="summary-value">{{ record.CatalogNumber }}</span>
        </div>
        <div class="summary-item" v-if="record.InstitutionCode">
          <span class="summary-label">Institution:</span>
          <span class="summary-value">{{ record.InstitutionCode }}</span>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-section">
        <label class="message-label">Message to Data Provider</label>
        <el-input
          v-model="message"
          type="textarea"
          :rows="4"
          placeholder="Describe the issue with this record..."
          maxlength="2000"
          show-word-limit
        />
      </div>

      <!-- Auth Warning -->
      <el-alert
        v-if="submitError"
        :title="submitError"
        type="error"
        :closable="false"
        style="margin-top: 12px;"
      />

      <el-alert
        v-if="submitSuccess"
        title="Flag submitted successfully!"
        type="success"
        :closable="false"
        style="margin-top: 12px;"
      />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button
        type="primary"
        :disabled="!message.trim() || isSubmitting || submitSuccess"
        :loading="isSubmitting"
        @click="submitFlag"
      >
        Submit Flag
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/utils/auth.js'

const { isAuthenticated, redirectToLogin } = useAuth()

const props = defineProps({
  visible: Boolean,
  record: Object
})

const emit = defineEmits(['update:visible', 'submitted'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const message = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const submitFlag = async () => {
  if (!message.value.trim()) return

  if (!isAuthenticated.value) {
    submitError.value = 'Please log in to flag records'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  submitSuccess.value = false

  try {
    const response = await fetch(`${API_BASE_URL}/flags/record`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        es_document_id: props.record?.id?.toString() || null,
        catalog_number: props.record?.CatalogNumber?.toString() || null,
        institution_code: props.record?.InstitutionCode || '',
        scientific_name: props.record?.ScientificName || null,
        message: message.value
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.detail || `HTTP ${response.status}`)
    }

    submitSuccess.value = true
    emit('submitted')

    setTimeout(() => {
      dialogVisible.value = false
    }, 1500)

  } catch (error) {
    submitError.value = error.message || 'Failed to submit flag'
  } finally {
    isSubmitting.value = false
  }
}

const onClose = () => {
  message.value = ''
  submitError.value = ''
  submitSuccess.value = false
}
</script>

<style scoped>
.flag-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-summary {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.summary-label {
  font-weight: 600;
  color: #606266;
  min-width: 130px;
}

.summary-value {
  color: #303133;
}

.message-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
