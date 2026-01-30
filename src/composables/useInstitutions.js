// src/composables/useInstitutions.js
import { ref, reactive, computed } from 'vue'
import { institutionsApi } from '@/api/institutions.js'

export function useInstitutions() {
    const loading = ref(false)
    const error = ref(null)

    // 机构数据状态
    const institutions = ref([])
    const currentInstitution = ref(null)
    const institutionStats = ref({})
    const collaborationNetwork = ref({})
    const qualityAssessment = ref({})

    // 分页和筛选状态
    const pagination = reactive({
        page: 1,
        perPage: 25,
        total: 0
    })

    const filters = reactive({
        search: '',
        region: '',
        recordCount: '',
        institutionType: '',
        sortBy: 'records_desc'
    })

    // 计算属性
    const hasData = computed(() => institutions.value.length > 0)

    const filteredInstitutions = computed(() => {
        if (!filters.search) return institutions.value
        return institutions.value.filter(institution =>
            institution.institutionCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
            institution.institutionName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            institution.country?.toLowerCase().includes(filters.search.toLowerCase())
        )
    })

    const topInstitutions = computed(() => {
        return institutions.value
            .slice()
            .sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0))
            .slice(0, 5)
    })

    // 数据转换函数
    const transformInstitutionData = (rawData) => {
        return rawData.map(item => ({
            institutionCode: item.institutionCode,
            institutionName: item.institutionName || `${item.institutionCode} Institution`,
            ownerInstitutionCode: item.ownerInstitutionCode,
            country: item.country,
            region: item.region || 'Other',
            institutionType: item.institutionType || 'research',
            locality: item.locality,
            stateProvince: item.stateProvince,
            recordCount: item.recordCount || 0,
            speciesCount: item.speciesCount || 0,
            familiesCount: item.familiesCount || 0,
            countriesCount: item.countriesCount || 0,
            geoReferencingQuality: item.geoReferencingQuality || 0,
            dateQuality: item.dateQuality || 0,
            taxonomicQuality: item.taxonomicQuality || 0,
            overallQuality: item.overallQuality || 0,
            collectionCodes: item.collectionCodes || [],
            lastUpdated: item.lastUpdated,
            contactInfo: item.contactInfo || null
        }))
    }

    // 数据转换函数 (v2 - 包含详细信息)
    const transformInstitutionDataV2 = (rawData) => {
        return rawData.map(item => ({
            institutionCode: item.institutionCode,
            institutionName: item.institutionName || `${item.institutionCode} Institution`,
            officialName: item.officialName,
            alternateName: item.alternateName,
            ownerInstitutionCode: item.ownerInstitutionCode,
            country: item.country,
            statsCountry: item.statsCountry,
            region: item.region || 'Other',
            institutionType: item.institutionType || 'research',
            // Location details
            address: item.address,
            city: item.city,
            state: item.state,
            zip: item.zip,
            latitude: item.latitude,
            longitude: item.longitude,
            // Contact info
            phone: item.phone,
            email: item.email,
            website: item.website,
            // Social media
            twitter: item.twitter,
            facebook: item.facebook,
            instagram: item.instagram,
            // Stats
            recordCount: item.recordCount || 0,
            speciesCount: item.speciesCount || 0,
            familiesCount: item.familiesCount || 0,
            countriesCount: item.countriesCount || 0,
            geoReferencingQuality: item.geoReferencingQuality || 0,
            dateQuality: item.dateQuality || 0,
            taxonomicQuality: item.taxonomicQuality || 0,
            overallQuality: item.overallQuality || 0,
            // Collection info
            environment: item.environment,
            specimensAmount: item.specimensAmount,
            dataUrl: item.dataUrl,
            source: item.source,
            lastUpdated: item.lastUpdated,
            firstRecord: item.firstRecord,
            latestRecord: item.latestRecord
        }))
    }

    // 获取所有机构
    const fetchInstitutions = async (params = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await institutionsApi.getInstitutions({
                page: pagination.page,
                per_page: pagination.perPage,
                ...filters,
                ...params
            })

            institutions.value = transformInstitutionData(response.data || [])
            pagination.total = response.data.total || institutions.value.length

            console.log('Fetched institutions:', institutions.value.length)
            return response.data
        } catch (err) {
            error.value = err.message || 'Failed to fetch institutions'
            console.error('Error fetching institutions:', err)

            institutions.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取所有机构 (v2 - 包含详细信息)
    const fetchInstitutionsV2 = async (params = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await institutionsApi.getInstitutionsV2({
                page: pagination.page,
                per_page: pagination.perPage,
                ...filters,
                ...params
            })

            institutions.value = transformInstitutionDataV2(response.data || [])
            pagination.total = response.total || institutions.value.length

            console.log('Fetched institutions v2:', institutions.value.length)
            return response.data
        } catch (err) {
            error.value = err.message || 'Failed to fetch institutions'
            console.error('Error fetching institutions v2:', err)

            institutions.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取机构详情 (基础)
    const fetchInstitutionDetail = async (institutionCode) => {
        loading.value = true
        error.value = null

        try {
            const response = await institutionsApi.getInstitutionDetail(institutionCode)
            currentInstitution.value = response

            console.log('Fetched institution detail:', currentInstitution.value)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch institution detail'
            console.error('Error fetching institution detail:', err)
            currentInstitution.value = null
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取机构完整详情 (v2 - 包含联系信息、地址等)
    const fetchInstitutionDetailV2 = async (institutionCode) => {
        loading.value = true
        error.value = null

        try {
            const response = await institutionsApi.getInstitutionDetailV2(institutionCode)
            currentInstitution.value = response

            console.log('Fetched institution detail v2:', currentInstitution.value)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch institution detail'
            console.error('Error fetching institution detail v2:', err)
            currentInstitution.value = null
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取机构统计
    const fetchInstitutionStats = async (institutionCode = null) => {
        try {
            const response = institutionCode
                ? await institutionsApi.getInstitutionStats(institutionCode)
                : await institutionsApi.getInstitutionsStats()

            if (institutionCode) {
                // 特定机构的统计
                console.log(`Institution ${institutionCode} stats:`, response)
                return response
            } else {
                // 全局机构统计
                institutionStats.value = response
                console.log('Global institution stats:', institutionStats)
                return response
            }
        } catch (err) {
            console.error('Error fetching institution stats:', err)
            if (!institutionCode) {
                // 设置默认值
                institutionStats.value = {
                    totalInstitutions: 0,
                    totalCollectionCodes: 0,
                    totalRecords: 0,
                    totalCountries: 0,
                    avgGeoreferenced: 0,
                    avgDateQuality: 0,
                    majorContributors: 0,
                    activeContributors: 0,
                    researchCollections: 0,
                    highQualityData: 0
                }
            }
            throw err
        }
    }

    // 获取机构物种列表
    const fetchInstitutionSpecies = async (institutionCode, params = {}) => {
        try {
            const response = await institutionsApi.getInstitutionSpecies(institutionCode, {
                page: 1,
                per_page: 100,
                ...params
            })

            console.log(`Institution ${institutionCode} species:`, response.data)
            return response
        } catch (err) {
            console.error('Error fetching institution species:', err)
            throw err
        }
    }

    // 获取机构记录（用于地图）
    const fetchInstitutionRecordsV2 = async (institutionCode, params = {}) => {
        try {
            const response = await institutionsApi.getInstitutionRecordsV2(institutionCode, {
                page: 1,
                per_page: 1000,
                ...params
            })

            console.log(`Institution ${institutionCode} records v2:`, response.data?.length || 0)
            return response
        } catch (err) {
            console.error('Error fetching institution records v2:', err)
            throw err
        }
    }

    // 获取机构记录
    const fetchInstitutionRecords = async (institutionCode, params = {}) => {
        try {
            const response = await institutionsApi.getInstitutionRecords(institutionCode, {
                page: 1,
                per_page: 100,
                ...params
            })

            console.log(`Institution ${institutionCode} records:`, response.data)
            return response.data
        } catch (err) {
            console.error('Error fetching institution records:', err)
            throw err
        }
    }

    // 获取机构地理分布
    const fetchInstitutionGeography = async (institutionCode) => {
        try {
            const response = await institutionsApi.getInstitutionGeography(institutionCode)
            console.log(`Institution ${institutionCode} geography:`, response.data)
            return response.data
        } catch (err) {
            console.error('Error fetching institution geography:', err)
            throw err
        }
    }

    // 搜索机构
    const searchInstitutions = async (query, searchFilters = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await institutionsApi.searchInstitutions(query, {
                ...filters,
                ...searchFilters
            })

            console.log('Institution search results:', response.data)
            return response.data
        } catch (err) {
            error.value = err.message || 'Search failed'
            console.error('Error searching institutions:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取协作网络数据
    const fetchCollaborationNetwork = async () => {
        try {
            const response = await institutionsApi.getCollaborationNetwork()
            collaborationNetwork.value = response.data
            console.log('Collaboration network:', collaborationNetwork.value)
            return response.data
        } catch (err) {
            console.error('Error fetching collaboration network:', err)
            collaborationNetwork.value = {}
            throw err
        }
    }

    // 获取数据质量评估
    const fetchDataQualityAssessment = async (institutionCode = null) => {
        try {
            const response = await institutionsApi.getDataQualityAssessment(institutionCode)
            qualityAssessment.value = response.data
            console.log('Data quality assessment:', qualityAssessment.value)
            return response.data
        } catch (err) {
            console.error('Error fetching data quality assessment:', err)
            qualityAssessment.value = {}
            throw err
        }
    }

    // 更新筛选条件
    const updateFilters = (newFilters) => {
        Object.assign(filters, newFilters)
        pagination.page = 1 // 重置到第一页
    }

    // 更新分页
    const updatePagination = (newPagination) => {
        Object.assign(pagination, newPagination)
    }

    // 重置状态
    const reset = () => {
        institutions.value = []
        currentInstitution.value = null
        institutionStats.value = {}
        collaborationNetwork.value = {}
        qualityAssessment.value = {}
        error.value = null

        // 重置分页
        pagination.page = 1
        pagination.total = 0

        // 重置筛选
        Object.keys(filters).forEach(key => {
            if (key === 'sortBy') {
                filters[key] = 'records_desc'
            } else {
                filters[key] = ''
            }
        })
    }

    return {
        // 状态
        loading,
        error,
        institutions,
        currentInstitution,
        institutionStats,
        collaborationNetwork,
        qualityAssessment,
        pagination,
        filters,

        // 计算属性
        hasData,
        filteredInstitutions,
        topInstitutions,

        // 方法
        fetchInstitutions,
        fetchInstitutionsV2,
        fetchInstitutionDetail,
        fetchInstitutionDetailV2,
        fetchInstitutionStats,
        fetchInstitutionSpecies,
        fetchInstitutionRecords,
        fetchInstitutionRecordsV2,
        fetchInstitutionGeography,
        searchInstitutions,
        fetchCollaborationNetwork,
        fetchDataQualityAssessment,
        updateFilters,
        updatePagination,
        reset
    }
}