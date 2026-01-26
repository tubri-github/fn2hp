// src/api/records.js
import api from './base.js'

export const recordsApi = {
    // 获取记录列表
    getRecords(params = {}) {
        return api.get('/records', { params })
    },

    // 获取特定记录详细信息
    getRecordDetail(recordId) {
        return api.get(`/records/${recordId}`)
    },

    // 按分类单元获取记录
    getRecordsByTaxon(taxonType, taxonName, params = {}) {
        return api.get(`/records/taxon/${taxonType}/${encodeURIComponent(taxonName)}`, { params })
    },

    // 按机构获取记录
    getRecordsByInstitution(institutionCode, params = {}) {
        return api.get(`/records/institution/${encodeURIComponent(institutionCode)}`, { params })
    },

    // 获取记录统计信息
    getRecordsStats(params = {}) {
        return api.get('/records/stats', { params })
    },

    // 搜索记录
    searchRecords(query, params = {}) {
        return api.get('/records/search', {
            params: { q: query, ...params }
        })
    },

    // 获取聚合地图点（支持 precision + viewport bounds）
    getMapPoints(taxonType, taxonName, params = {}) {
        return api.get(`/records/taxon/${taxonType}/${encodeURIComponent(taxonName)}/map-points`, { params })
    },

    // 获取地理分布数据
    getGeographicDistribution(params = {}) {
        return api.get('/records/geography', { params })
    },

    // 获取时间分布数据
    getTemporalDistribution(params = {}) {
        return api.get('/records/temporal', { params })
    },

    // 导出记录数据
    exportRecords(params = {}, format = 'csv') {
        return api.get('/records/export', {
            params: { ...params, format },
            responseType: 'blob'
        })
    },

    // 批量获取记录质量信息
    getRecordsQuality(recordIds) {
        return api.post('/records/quality', { recordIds })
    },

    // 获取Darwin Core字段统计
    getDarwinCoreStats(params = {}) {
        return api.get('/records/darwin-core-stats', { params })
    }
}