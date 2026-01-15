<!-- TimelineDiffViewer.vue -->
<template>
  <div class="timeline-diff-card">
    <div class="timeline-content">
      <div v-for="(record, index) in historyData" :key="record.timestamp" class="timeline-item">
        <div class="timeline-line"></div>
        <div class="timeline-point-content">
          <div
              class="timestamp-header"
              @click="toggleExpand(index)"
          >
            <div class="timeline-point"></div>
            <div class="timestamp-text">
              <el-icon><Clock /></el-icon>
              {{ record.timestamp }}
              <el-icon class="expand-icon">
                <CaretTop v-if="expandedIndex === index" />
                <CaretBottom v-else />
              </el-icon>
            </div>
          </div>

          <div v-if="expandedIndex === index" class="diff-content">
            <template v-for="key in getAllKeys(record.oldData)" :key="key">
              <div class="diff-item">
                <div class="diff-key">{{ key }}</div>
                <div class="diff-values">
                  <div
                      :class="[
                      'value-cell',
                      isDifferent(record.oldData[key], record.newData[key]) ? 'old-value' : ''
                    ]"
                  >
                    {{ formatValue(record.oldData[key]) }}
                  </div>
                  <div class="arrow">
                    {{ isDifferent(record.oldData[key], record.newData[key]) ? '→' : '' }}
                  </div>
                  <div
                      :class="[
                      'value-cell',
                      isDifferent(record.oldData[key], record.newData[key]) ? 'new-value' : ''
                    ]"
                  >
                    {{ formatValue(record.newData[key]) }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Clock, CaretTop, CaretBottom } from '@element-plus/icons-vue'

// 三个时间点的历史记录
const historyData = ref([
  {
    timestamp: '2024-03-08 15:30:00',
    oldData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 5,
      "ScientificName": "Poecilosoma erythrogastrum",
      "Family": "Percidae",
      "Country": "United States of America",
      "StateProvince": "Missouri",
      "County": "Lawrence",
      "Locality": "Arkansas River, Trib. To Spring River at Farm Road 2210 LC approx. 0.25mi. North of Verona",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    },
    newData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 5,
      "ScientificName": "Etheostoma caeruleum",
      "Family": "Percidae",
      "Country": "USA",
      "StateProvince": "Missouri",
      "County": "Lawrence",
      "Locality": "Arkansas River, Trib. To Spring River at Farm Road 2210 LC approx. 0.25mi. North of Verona",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    }
  },
  {
    timestamp: '2024-03-07 14:20:00',
    oldData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 3,
      "ScientificName": "Poecilosoma erythrogastrum",
      "Family": "Percidae",
      "Country": "United States of America",
      "StateProvince": "Missouri",
      "County": "Lawrence",
      "Locality": "Spring River",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    },
    newData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 5,
      "ScientificName": "Poecilosoma erythrogastrum",
      "Family": "Percidae",
      "Country": "United States of America",
      "StateProvince": "Missouri",
      "County": "Lawrence",
      "Locality": "Arkansas River, Trib. To Spring River at Farm Road 2210 LC approx. 0.25mi. North of Verona",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    }
  },
  {
    timestamp: '2024-03-06 09:15:00',
    oldData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 3,
      "ScientificName": "Poecilosoma erythrogastrum",
      "Family": "Percidae",
      "Country": "United States of America",
      "StateProvince": "Missouri",
      "County": "",
      "Locality": "Spring River",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    },
    newData: {
      "CollectionID": 19,
      "InstitutionCode": "TU",
      "CollectionCode": "Fish",
      "CatalogNumber": "191346",
      "IndividualCount": 3,
      "ScientificName": "Poecilosoma erythrogastrum",
      "Family": "Percidae",
      "Country": "United States of America",
      "StateProvince": "Missouri",
      "County": "Lawrence",
      "Locality": "Spring River",
      "BasisOfRecord": "PreservedSpecimen",
      "ContinentOcean": "North America"
    }
  }
])

const expandedIndex = ref(null)

const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const isDifferent = (oldVal, newVal) => {
  return JSON.stringify(oldVal) !== JSON.stringify(newVal)
}

const formatValue = (value) => {
  if (value === null || value === "") {
    return "-"
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const getAllKeys = (obj) => {
  return Object.keys(obj)
}
</script>

<style scoped>
.timeline-diff-card {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.timeline-content {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #e4e7ed;
}

.timeline-point-content {
  margin-left: 24px;
}

.timestamp-header {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
}

.timeline-point {
  position: absolute;
  left: -28px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
  transform: translateX(-50%);
}

.timestamp-text {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.timestamp-text .el-icon {
  margin-right: 8px;
}

.expand-icon {
  margin-left: 8px;
}

.diff-content {
  margin-top: 16px;
}

.diff-item {
  margin-bottom: 12px;
}

.diff-key {
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
}

.diff-values {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.value-cell {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  min-height: 36px;
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
}

.old-value {
  background-color: rgba(245, 108, 108, 0.1);
}

.new-value {
  background-color: rgba(103, 194, 58, 0.1);
}

.arrow {
  color: #909399;
  width: 20px;
  text-align: center;
}
</style>