// src/api/institutions.js
import api from './base.js'

export const institutionsApi = {
    // 获取所有机构列表
    getInstitutions(params = {}) {
        return api.get('/institutions', { params })
    },

    // 获取特定机构详细信息 (基础统计)
    getInstitutionDetail(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}`)
    },

    // 获取机构完整详情 (包含联系信息、地址、社交媒体等)
    getInstitutionDetailV2(institutionCode) {
        return api.get(`/institutions/v2/${encodeURIComponent(institutionCode)}`)
    },

    // 获取所有机构列表 (v2 - 包含详细信息)
    getInstitutionsV2(params = {}) {
        return api.get('/institutions/v2', { params })
    },

    // 获取机构的记录统计
    getInstitutionStats(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/stats`)
    },

    // 获取机构的物种列表 (with record counts)
    getInstitutionSpecies(institutionCode, params = {}) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/species`, { params })
    },

    // 获取机构记录 (for map and table)
    getInstitutionRecordsV2(institutionCode, params = {}) {
        return api.get(`/records/institution/${encodeURIComponent(institutionCode)}`, { params })
    },

    // 获取机构地图点数据 (heatmap)
    getInstitutionMapPoints(institutionCode, params = {}, config = {}) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/map-points`, { params, ...config })
    },

    // 获取机构的记录列表 - 更新为使用新的详细端点
    getInstitutionRecords(institutionCode, params = {}) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/records`, { params })
    },

    // 获取机构记录的汇总信息
    getInstitutionRecordsSummary(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/records/summary`)
    },

    // 获取机构记录的过滤器选项
    getInstitutionRecordsFilters(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/records/filters`)
    },

    // 导出机构记录数据
    exportInstitutionRecords(institutionCode, params = {}) {
        const queryParams = new URLSearchParams(params)
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/records/export?${queryParams}`, {
            responseType: 'blob' // 用于文件下载
        })
    },

    // 获取机构的地理分布数据
    getInstitutionGeography(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/geography`)
    },

    // 获取机构在各国的分布情况
    getInstitutionCountries(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/countries`)
    },

    // 获取机构统计概览
    getInstitutionsStats() {
        return api.get('/institution/stats')
    },

    // 按地区获取机构
    getInstitutionsByRegion(region) {
        return api.get(`/institutions/region/${encodeURIComponent(region)}`)
    },

    // 搜索机构
    searchInstitutions(query, params = {}) {
        return api.get('/institutions/search', {
            params: { q: query, ...params }
        })
    },

    // 获取机构协作网络数据
    getCollaborationNetwork() {
        return api.get('/institutions/collaboration-network')
    },

    // 获取数据质量评估
    getDataQualityAssessment(institutionCode = null) {
        const url = institutionCode
            ? `/institutions/${encodeURIComponent(institutionCode)}/quality`
            : '/institutions/quality'
        return api.get(url)
    }
}