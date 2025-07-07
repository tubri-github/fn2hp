// src/api/taxonomy.js
import api from './base.js'

export const taxonomyApi = {
    // ========== 你原有的方法 ==========
    // 获取所有科的列表
    getFamilies(params = {}) {
        return api.get('/families', { params })
    },

    // 获取特定科的详细信息
    getFamilyDetail(familyName) {
        return api.get(`/families/${encodeURIComponent(familyName)}`)
    },

    // 获取科下的所有属
    getFamilyGenera(familyName, params = {}) {
        return api.get(`/families/${encodeURIComponent(familyName)}/genera`, { params })
    },

    // 获取科下的所有物种
    getFamilySpecies(familyName, params = {}) {
        return api.get(`/families/${encodeURIComponent(familyName)}/species`, { params })
    },

    // 获取所有属的列表
    getGenera(params = {}) {
        return api.get('/genera', { params })
    },

    // 获取特定属的详细信息
    getGenusDetail(genusName) {
        return api.get(`/genera/${encodeURIComponent(genusName)}`)
    },

    // 获取属下的所有物种
    getGenusSpecies(genusName, params = {}) {
        return api.get(`/genera/${encodeURIComponent(genusName)}/species`, { params })
    },

    // 获取所有物种的列表
    getSpecies(params = {}) {
        return api.get('/species', { params })
    },

    // 获取特定物种的详细信息
    getSpeciesDetail(scientificName) {
        return api.get(`/species/${encodeURIComponent(scientificName)}`)
    },

    // 获取分类统计信息
    getTaxonomyStats() {
        return api.get('/taxonomy/stats')
    },

    // 搜索分类单元
    searchTaxa(query, params = {}) {
        return api.get('/taxonomy/search', {
            params: { q: query, ...params }
        })
    },

    // 获取分类层级信息
    getTaxonomyHierarchy(taxonType, taxonName) {
        return api.get(`/taxonomy/hierarchy/${taxonType}/${encodeURIComponent(taxonName)}`)
    },

    // 获取目录（Orders）
    getOrders() {
        return api.get('/orders')
    },

    // 根据目获取科
    getFamiliesByOrder(orderName) {
        return api.get(`/orders/${encodeURIComponent(orderName)}/families`)
    },

    // ========== 新增的 TaxonPage 相关方法 ==========

    // 获取分类单元的子级数据（统一接口）
    getFamilyChildren(familyName, params = {}) {
        return api.get(`/families/${encodeURIComponent(familyName)}/children`, { params })
    },

    getGenusChildren(genusName, params = {}) {
        return api.get(`/genera/${encodeURIComponent(genusName)}/children`, { params })
    },

    // 获取分类单元的多样性数据
    getTaxonDiversity(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/diversity`)
    },

    // 获取分类单元的地理分布数据
    getTaxonGeographic(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/geographic`)
    },

    // 获取分类单元的时间模式数据
    getTaxonTemporal(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/temporal`)
    },

    // 获取分类单元的机构数据
    getTaxonInstitutions(taxonType, taxonName, params = {}) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/institutions`, { params })
    },

    // 获取分类单元的热门物种
    getTopSpecies(taxonType, taxonName, limit = 8) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/top-species`, {
            params: { limit }
        })
    },

    // 获取新的分类层级信息（与原有方法共存）
    getTaxonHierarchy(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/hierarchy`)
    },

    // 新增：获取机构覆盖度分析
    getTaxonInstitutionCoverage(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/institution-coverage`)
    }
}