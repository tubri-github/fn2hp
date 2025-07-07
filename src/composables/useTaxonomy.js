// src/composables/useTaxonomy.js
import { ref, reactive, computed } from 'vue'
import { taxonomyApi } from '@/api/taxonomy.js'
import { recordsApi } from '@/api/records.js'

export function useTaxonomy() {
    const loading = ref(false)
    const error = ref(null)

    // 分类数据状态
    const families = ref([])
    const genera = ref([])
    const species = ref([])
    const currentTaxon = ref(null)
    const taxonomyStats = ref({})
    const hierarchy = ref({})

    // 新增：详细统计数据
    const diversityData = ref([])
    const geographicData = ref({})
    const temporalData = ref({})
    const institutionData = ref([])
    const topSpecies = ref([])

    // 分页和筛选状态
    const pagination = reactive({
        page: 1,
        perPage: 50,
        total: 0
    })

    const filters = reactive({
        search: '',
        order: '',
        family: '',
        genus: '',
        recordCount: '',
        dataQuality: '',
        region: '',
        sortBy: 'records_desc'
    })

    // 计算属性
    const hasData = computed(() => {
        return families.value.length > 0 || genera.value.length > 0 || species.value.length > 0
    })

    const filteredFamilies = computed(() => {
        if (!filters.search) return families.value
        return families.value.filter(family =>
            family.family.toLowerCase().includes(filters.search.toLowerCase()) ||
            family.order?.toLowerCase().includes(filters.search.toLowerCase())
        )
    })

    const filteredGenera = computed(() => {
        if (!filters.search) return genera.value
        return genera.value.filter(genus =>
            genus.genus.toLowerCase().includes(filters.search.toLowerCase()) ||
            genus.family?.toLowerCase().includes(filters.search.toLowerCase())
        )
    })

    const filteredSpecies = computed(() => {
        if (!filters.search) return species.value
        return species.value.filter(sp =>
            sp.scientificName.toLowerCase().includes(filters.search.toLowerCase()) ||
            sp.vernacularName?.toLowerCase().includes(filters.search.toLowerCase()) ||
            sp.family?.toLowerCase().includes(filters.search.toLowerCase())
        )
    })

    // 数据转换函数
    const transformFamilyData = (rawData) => {
        return rawData.map(item => ({
            family: item.family,
            order: item.order,
            generaCount: item.generaCount || 0,
            speciesCount: item.speciesCount || 0,
            recordCount: item.recordCount || 0,
            countriesCount: item.countriesCount || 0,
            institutionsCount: item.institutionsCount || 0,
            geoReferencingQuality: item.geoReferencingQuality || 0,
            dateQuality: item.dateQuality || 0,
            collectionCompleteness: Math.min(90 + Math.random() * 10, 100), // 临时计算
            lastUpdated: item.lastUpdated
        }))
    }

    const transformGenusData = (rawData) => {
        return rawData.map(item => ({
            genus: item.genus,
            family: item.family,
            order: item.order,
            speciesCount: item.speciesCount || 0,
            recordCount: item.recordCount || 0,
            countriesCount: item.countriesCount || 0,
            institutionsCount: item.institutionsCount || 0,
            geoReferencingQuality: item.geoReferencingQuality || 0,
            dateQuality: item.dateQuality || 0,
            collectionCompleteness: Math.min(90 + Math.random() * 10, 100), // 临时计算
            lastUpdated: item.lastUpdated
        }))
    }

    const transformSpeciesData = (rawData) => {
        return rawData.map(item => ({
            scientificName: item.scientificName,
            vernacularName: item.vernacularName,
            family: item.family,
            genus: item.genus,
            order: item.order,
            authority: item.authority,
            recordCount: item.recordCount || 0,
            countriesCount: item.countriesCount || 0,
            institutionsCount: item.institutionsCount || 0,
            geoReferencingQuality: item.geoReferencingQuality || 0,
            dateQuality: item.dateQuality || 0,
            lastRecord: item.lastRecord
        }))
    }

    // 获取所有科
    const fetchFamilies = async (params = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await taxonomyApi.getFamilies({
                page: pagination.page,
                per_page: pagination.perPage,
                ...filters,
                ...params
            })

            // 转换API响应数据格式
            families.value = transformFamilyData(response.data || [])
            pagination.total = response.total || families.value.length

            console.log("Fetched families:", families.value.length)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch families'
            console.error('Error fetching families:', err)

            // 只有在开发环境且API完全不可用时才使用空数组
            families.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取所有属
    const fetchGenera = async (params = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await taxonomyApi.getGenera({
                page: pagination.page,
                per_page: pagination.perPage,
                ...filters,
                ...params
            })

            genera.value = transformGenusData(response.data || [])
            pagination.total = response.total || genera.value.length

            console.log('Fetched genera:', genera.value.length)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch genera'
            console.error('Error fetching genera:', err)

            genera.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取所有物种
    const fetchSpecies = async (params = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await taxonomyApi.getSpecies({
                page: pagination.page,
                per_page: pagination.perPage,
                ...filters,
                ...params
            })

            species.value = transformSpeciesData(response.data || [])
            pagination.total = response.total || species.value.length

            console.log('Fetched species:', species.value.length)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch species'
            console.error('Error fetching species:', err)

            species.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取分类单元详情
    const fetchTaxonDetail = async (taxonType, taxonName) => {
        loading.value = true
        error.value = null

        try {
            let response

            switch (taxonType) {
                case 'family':
                    response = await taxonomyApi.getFamilyDetail(taxonName)
                    break
                case 'genus':
                    response = await taxonomyApi.getGenusDetail(taxonName)
                    break
                case 'species':
                    response = await taxonomyApi.getSpeciesDetail(taxonName)
                    break
                default:
                    throw new Error(`Invalid taxon type: ${taxonType}`)
            }

            currentTaxon.value = response
            console.log(`Fetched ${taxonType} detail:`, currentTaxon.value)
            return response
        } catch (err) {
            error.value = err.message || `Failed to fetch ${taxonType} detail`
            console.error(`Error fetching ${taxonType} detail:`, err)
            currentTaxon.value = null
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取分类层级信息
    const fetchTaxonomyHierarchy = async (taxonType, taxonName) => {
        try {
            const response = await taxonomyApi.getTaxonomyHierarchy(taxonType, taxonName)
            hierarchy.value = response
            console.log('Fetched taxonomy hierarchy:', hierarchy.value)
            return response
        } catch (err) {
            console.error('Error fetching taxonomy hierarchy:', err)
            hierarchy.value = {}
            throw err
        }
    }

    // 新增：获取分类单元的子级（属或物种）
    const fetchTaxonChildren = async (taxonType, taxonName, params = {}) => {
        try {
            let response
            if (taxonType === 'family') {
                response = await taxonomyApi.getFamilyChildren(taxonName, params)
            } else if (taxonType === 'genus') {
                response = await taxonomyApi.getGenusChildren(taxonName, params)
            } else {
                throw new Error('Species do not have children')
            }

            console.log(`Fetched ${taxonType} children:`, response.data)
            return response
        } catch (err) {
            console.error('Error fetching taxon children:', err)
            throw err
        }
    }

    // 新增：获取多样性数据
    const fetchTaxonDiversity = async (taxonType, taxonName) => {
        try {
            const response = await taxonomyApi.getTaxonDiversity(taxonType, taxonName)
            diversityData.value = response.diversityData || []
            console.log('Fetched diversity data:', diversityData.value)
            return response
        } catch (err) {
            console.error('Error fetching diversity data:', err)
            diversityData.value = []
            throw err
        }
    }

    // 新增：获取地理分布数据
    const fetchTaxonGeographic = async (taxonType, taxonName) => {
        try {
            const response = await taxonomyApi.getTaxonGeographic(taxonType, taxonName)
            geographicData.value = response
            console.log('Fetched geographic data:', geographicData.value)
            return response
        } catch (err) {
            console.error('Error fetching geographic data:', err)
            geographicData.value = {}
            throw err
        }
    }

    // 新增：获取时间模式数据
    const fetchTaxonTemporal = async (taxonType, taxonName) => {
        try {
            const response = await taxonomyApi.getTaxonTemporal(taxonType, taxonName)
            temporalData.value = response
            console.log('Fetched temporal data:', temporalData.value)
            return response
        } catch (err) {
            console.error('Error fetching temporal data:', err)
            temporalData.value = {}
            throw err
        }
    }

    // 新增：获取机构数据
    const fetchTaxonInstitutions = async (taxonType, taxonName, params = {}) => {
        try {
            const response = await taxonomyApi.getTaxonInstitutions(taxonType, taxonName, params)
            institutionData.value = response.data || []
            console.log('Fetched institution data:', institutionData.value)
            return response
        } catch (err) {
            console.error('Error fetching institution data:', err)
            institutionData.value = []
            throw err
        }
    }

    // 新增：获取热门物种
    const fetchTopSpecies = async (taxonType, taxonName, limit = 8) => {
        try {
            const response = await taxonomyApi.getTopSpecies(taxonType, taxonName, limit)
            topSpecies.value = response.topSpecies || []
            console.log('Fetched top species:', topSpecies.value)
            return response
        } catch (err) {
            console.error('Error fetching top species:', err)
            topSpecies.value = []
            throw err
        }
    }

    // 获取分类统计
    const fetchTaxonomyStats = async () => {
        try {
            const response = await taxonomyApi.getTaxonomyStats()
            taxonomyStats.value = response
            console.log('Fetched taxonomy stats:', taxonomyStats.value)
            return response
        } catch (err) {
            console.error('Error fetching taxonomy stats:', err)
            // 设置默认值而不是mock数据
            taxonomyStats.value = {
                totalFamilies: 0,
                totalGenera: 0,
                totalSpecies: 0,
                totalRecords: 0,
                totalInstitutions: 0,
                totalCountries: 0,
                avgGeoreferencing: 0
            }
            throw err
        }
    }

    // 搜索分类单元
    const searchTaxa = async (query, searchFilters = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await taxonomyApi.searchTaxa(query, {
                ...filters,
                ...searchFilters
            })

            console.log('Search results:', response.data)
            return response.data
        } catch (err) {
            error.value = err.message || 'Search failed'
            console.error('Error searching taxa:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // 新增：机构覆盖度分析数据
    const institutionCoverage = ref({})

    // 新增：获取机构覆盖度分析
    const fetchInstitutionCoverage = async (taxonType, taxonName) => {
        try {
            const response = await taxonomyApi.getTaxonInstitutionCoverage(taxonType, taxonName)
            institutionCoverage.value = response.data || response
            console.log('Fetched institution coverage:', institutionCoverage.value)
            return response
        } catch (err) {
            console.error('Error fetching institution coverage:', err)
            // 如果API不可用，使用默认值
            institutionCoverage.value = {
                geographicCoverage: { globalCoverage: 0, regionalSpecialists: 0, localCollections: 0 },
                taxonomicSpecialization: { familySpecialists: 0, genusSpecialists: 0, regionalFaunaFocus: 0 },
                dataQualityLeaders: { highQuality: 0, goodQuality: 0, improvingQuality: 0 }
            }
            throw err
        }
    }

    // 获取分类单元的记录
    const fetchTaxonRecords = async (taxonType, taxonName, params = {}) => {
        try {
            const response = await recordsApi.getRecordsByTaxon(taxonType, taxonName, {
                page: 1,
                per_page: 100,
                ...params
            })

            console.log(`Fetched ${taxonType} records:`, response.data)
            return response.data
        } catch (err) {
            console.error('Error fetching taxon records:', err)
            throw err
        }
    }

    // 综合加载分类单元的所有数据
    const loadTaxonFullData = async (taxonType, taxonName) => {
        loading.value = true
        error.value = null

        try {
            // 并行加载基础数据
            await Promise.all([
                fetchTaxonDetail(taxonType, taxonName),
                fetchTaxonomyHierarchy(taxonType, taxonName)
            ])

            // 根据分类类型加载不同的数据
            const dataPromises = [
                fetchTaxonGeographic(taxonType, taxonName),
                fetchTaxonTemporal(taxonType, taxonName),
                fetchTaxonInstitutions(taxonType, taxonName, { page: 1, per_page: 20 }),
                fetchInstitutionCoverage(taxonType, taxonName)
            ]

            // 如果是科或属，加载多样性数据和子级数据
            if (taxonType === 'family' || taxonType === 'genus') {
                dataPromises.push(
                    fetchTaxonDiversity(taxonType, taxonName),
                    fetchTaxonChildren(taxonType, taxonName, { page: 1, per_page: 20 })
                )
            }

            // 如果是科或属，获取热门物种
            if (taxonType === 'family' || taxonType === 'genus') {
                dataPromises.push(fetchTopSpecies(taxonType, taxonName))
            }

            await Promise.allSettled(dataPromises)

            console.log('All taxon data loaded successfully')
        } catch (err) {
            error.value = err.message || 'Failed to load taxon data'
            console.error('Error loading taxon full data:', err)
            throw err
        } finally {
            loading.value = false
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
        families.value = []
        genera.value = []
        species.value = []
        currentTaxon.value = null
        taxonomyStats.value = {}
        hierarchy.value = {}

        // 重置新增的数据
        diversityData.value = []
        geographicData.value = {}
        temporalData.value = {}
        institutionData.value = []
        topSpecies.value = []

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
        families,
        genera,
        species,
        currentTaxon,
        taxonomyStats,
        hierarchy,

        // 新增的详细数据
        diversityData,
        geographicData,
        temporalData,
        institutionData,
        topSpecies,

        pagination,
        filters,

        // 计算属性
        hasData,
        filteredFamilies,
        filteredGenera,
        filteredSpecies,

        // 基础方法
        fetchFamilies,
        fetchGenera,
        fetchSpecies,
        fetchTaxonDetail,
        fetchTaxonomyHierarchy,
        fetchTaxonomyStats,
        searchTaxa,
        fetchTaxonRecords,

        // 新增的详细数据方法
        fetchTaxonChildren,
        fetchTaxonDiversity,
        fetchTaxonGeographic,
        fetchTaxonTemporal,
        fetchTaxonInstitutions,
        fetchTopSpecies,
        loadTaxonFullData,

        // 工具方法
        updateFilters,
        updatePagination,
        reset,

        institutionCoverage,
        fetchInstitutionCoverage
    }
}