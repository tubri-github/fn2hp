// src/api/institutions.js
import api from './base.js'

export const institutionsApi = {
    // 获取所有机构列表
    getInstitutions(params = {}) {
        return api.get('/institutions', { params })
    },

    // 获取特定机构详细信息
    getInstitutionDetail(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}`)
    },

    // 获取机构的记录统计
    getInstitutionStats(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/stats`)
    },

    // 获取机构的物种列表
    getInstitutionSpecies(institutionCode, params = {}) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/species`, { params })
    },

    // 获取机构的记录列表
    getInstitutionRecords(institutionCode, params = {}) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/records`, { params })
    },

    // 获取机构的地理分布数据
    getInstitutionGeography(institutionCode) {
        return api.get(`/institutions/${encodeURIComponent(institutionCode)}/geography`)
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