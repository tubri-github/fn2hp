// src/composables/useTaxonomy.js
import { ref, reactive, computed } from 'vue'
import { taxonomyApi } from '@/api/taxonomy.js'
import { recordsApi } from '@/api/records.js'

export function useTaxonomy() {
    // ========== 基础状态 ==========
    const loading = ref(false)
    const error = ref(null)

    // 分类数据状态
    const families = ref([])
    const genera = ref([])
    const species = ref([])
    const currentTaxon = ref(null)
    const taxonomyStats = ref({})
    const hierarchy = ref({})

    // 详细统计数据
    const diversityData = ref([])
    const geographicData = ref({})
    const temporalData = ref({})
    const institutionData = ref([])
    const topSpecies = ref([])
    const institutionCoverage = ref({})

    // 可视化专用数据
    const mapData = ref([])
    const timelineData = ref([])
    const loadingMapData = ref(false)
    const loadingTimelineData = ref(false)

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

    // ========== 计算属性 ==========
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

    // 可视化数据计算属性
    const getTimelineChartData = computed(() => {
        if (!temporalData.value.yearlyTrend) return []

        return temporalData.value.yearlyTrend.map(item => ({
            year: item.year,
            records: item.records
        })).sort((a, b) => a.year - b.year)
    })

    const getMapVisualizationData = computed(() => {
        if (mapData.value.length > 0) {
            return mapData.value
        }

        // 如果没有专门的地图数据，从机构数据转换
        if (institutionData.value.length > 0) {
            return transformInstitutionsToMapData(institutionData.value)
        }

        return []
    })

    // ========== 数据转换函数 ==========
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

    const transformInstitutionsToMapData = (institutions) => {
        const countryCoords = {
            'United States': { lat: 39.8283, lng: -98.5795 },
            'USA': { lat: 39.8283, lng: -98.5795 },
            'US': { lat: 39.8283, lng: -98.5795 },
            'United Kingdom': { lat: 55.3781, lng: -3.4360 },
            'UK': { lat: 55.3781, lng: -3.4360 },
            'Canada': { lat: 56.1304, lng: -106.3468 },
            'Australia': { lat: -25.2744, lng: 133.7751 },
            'Germany': { lat: 51.1657, lng: 10.4515 },
            'France': { lat: 46.2276, lng: 2.2137 },
            'Japan': { lat: 36.2048, lng: 138.2529 },
            'Brazil': { lat: -14.2350, lng: -51.9253 },
            'China': { lat: 35.8617, lng: 104.1954 },
            'India': { lat: 20.5937, lng: 78.9629 }
        }

        return institutions.map(inst => {
            const coords = countryCoords[inst.country || 'United States'] || countryCoords['United States']
            return {
                institutionCode: inst.code,
                institutionName: inst.name,
                lat: coords.lat + (Math.random() - 0.5) * 2, // 添加小的随机偏移
                lng: coords.lng + (Math.random() - 0.5) * 2,
                recordCount: inst.recordCount || 0,
                country: inst.country || 'Unknown'
            }
        }).filter(item => item.lat && item.lng)
    }

    // ========== 基础数据获取方法 ==========
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

            families.value = transformFamilyData(response.data || [])
            pagination.total = response.total || families.value.length

            console.log("Fetched families:", families.value.length)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch families'
            console.error('Error fetching families:', err)
            families.value = []
            pagination.total = 0
            throw err
        } finally {
            loading.value = false
        }
    }

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

    // ========== 分类单元详情方法 ==========
    const fetchTaxonDetail = async (taxonType, taxonName) => {
        loading.value = true
        error.value = null

        try {
            // 对于species类型，需要提取specificepithet（种加词）
            let apiTaxonName = taxonName
            if (taxonType === 'species') {
                const parts = taxonName.trim().split(' ')
                if (parts.length >= 2) {
                    apiTaxonName = parts[1]
                    console.log(`Converting species name "${taxonName}" to specificepithet "${apiTaxonName}" for detail`)
                }
            }
            
            let response
            switch (taxonType) {
                case 'family':
                    response = await taxonomyApi.getFamilyDetail(apiTaxonName)
                    break
                case 'genus':
                    response = await taxonomyApi.getGenusDetail(apiTaxonName)
                    break
                case 'species':
                    response = await taxonomyApi.getSpeciesDetail(apiTaxonName)
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

    // ========== 详细数据方法 ==========
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

    const fetchTaxonGeographic = async (taxonType, taxonName) => {
        try {
            // 对于species类型，需要提取specificepithet（种加词）
            let apiTaxonName = taxonName
            if (taxonType === 'species') {
                // 从 "Brycon henni" 提取 "henni"
                const parts = taxonName.trim().split(' ')
                if (parts.length >= 2) {
                    apiTaxonName = parts[1] // 获取种加词
                    console.log(`Converting species name "${taxonName}" to specificepithet "${apiTaxonName}"`)
                }
            }
            
            const response = await taxonomyApi.getTaxonGeographic(taxonType, apiTaxonName)
            geographicData.value = response
            console.log('Fetched geographic data:', geographicData.value)
            return response
        } catch (err) {
            console.error('Error fetching geographic data:', err)
            geographicData.value = {}
            throw err
        }
    }

    const fetchTaxonTemporal = async (taxonType, taxonName) => {
        try {
            // 对于species类型，需要提取specificepithet（种加词）
            let apiTaxonName = taxonName
            if (taxonType === 'species') {
                // 从 "Brycon henni" 提取 "henni"
                const parts = taxonName.trim().split(' ')
                if (parts.length >= 2) {
                    apiTaxonName = parts[1] // 获取种加词
                    console.log(`Converting species name "${taxonName}" to specificepithet "${apiTaxonName}" for temporal data`)
                }
            }
            
            const response = await taxonomyApi.getTaxonTemporal(taxonType, apiTaxonName)
            temporalData.value = response
            console.log('Fetched temporal data:', temporalData.value)
            return response
        } catch (err) {
            console.error('Error fetching temporal data:', err)
            temporalData.value = {}
            throw err
        }
    }

    const fetchTaxonInstitutions = async (taxonType, taxonName, params = {}) => {
        try {
            // 对于species类型，需要提取specificepithet（种加词）
            let apiTaxonName = taxonName
            if (taxonType === 'species') {
                const parts = taxonName.trim().split(' ')
                if (parts.length >= 2) {
                    apiTaxonName = parts[1]
                    console.log(`Converting species name "${taxonName}" to specificepithet "${apiTaxonName}" for institution data`)
                }
            }
            
            const response = await taxonomyApi.getTaxonInstitutions(taxonType, apiTaxonName, params)
            institutionData.value = response.data || []
            console.log('Fetched institution data:', institutionData.value)
            return response
        } catch (err) {
            console.error('Error fetching institution data:', err)
            institutionData.value = []
            throw err
        }
    }

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

    const fetchInstitutionCoverage = async (taxonType, taxonName) => {
        try {
            // 对于species类型，需要提取specificepithet（种加词）
            let apiTaxonName = taxonName
            if (taxonType === 'species') {
                const parts = taxonName.trim().split(' ')
                if (parts.length >= 2) {
                    apiTaxonName = parts[1]
                    console.log(`Converting species name "${taxonName}" to specificepithet "${apiTaxonName}" for institution coverage`)
                }
            }
            
            const response = await taxonomyApi.getTaxonInstitutionCoverage(taxonType, apiTaxonName)
            institutionCoverage.value = response
            console.log('Fetched institution coverage:', institutionCoverage.value)
            return response
        } catch (err) {
            console.error('Error fetching institution coverage:', err)
            institutionCoverage.value = {
                geographicCoverage: { globalCoverage: 0, regionalSpecialists: 0, localCollections: 0 },
                taxonomicSpecialization: { familySpecialists: 0, genusSpecialists: 0, regionalFaunaFocus: 0 },
                dataQualityLeaders: { highQuality: 0, goodQuality: 0, improvingQuality: 0 }
            }
            throw err
        }
    }

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

    // ========== 可视化数据方法 ==========
    const fetchMapData = async (taxonType, taxonName) => {
        loadingMapData.value = true
        try {
            // 优先使用专门的地图API
            if (taxonomyApi.getTaxonMapData) {
                const response = await taxonomyApi.getTaxonMapData(taxonType, taxonName)
                mapData.value = response.mapData || []
            } else {
                // 备用方案：从机构数据转换
                const institutionsResponse = await fetchTaxonInstitutions(taxonType, taxonName, { per_page: 100 })
                mapData.value = transformInstitutionsToMapData(institutionsResponse.data || [])
            }

            console.log('Fetched map data:', mapData.value.length, 'points')
            return mapData.value
        } catch (err) {
            console.error('Error fetching map data:', err)
            mapData.value = []
            throw err
        } finally {
            loadingMapData.value = false
        }
    }

    const fetchTimelineData = async (taxonType, taxonName) => {
        loadingTimelineData.value = true
        try {
            // 从temporal数据中提取时间线数据
            const temporalResponse = await fetchTaxonTemporal(taxonType, taxonName)
            timelineData.value = temporalResponse.yearlyTrend || []

            console.log('Fetched timeline data:', timelineData.value.length, 'data points')
            return timelineData.value
        } catch (err) {
            console.error('Error fetching timeline data:', err)
            timelineData.value = []
            throw err
        } finally {
            loadingTimelineData.value = false
        }
    }

    // ========== 综合加载方法 ==========
    const loadTaxonFullData = async (taxonType, taxonName) => {
        loading.value = true
        error.value = null

        try {
            // 1. 并行加载基础数据
            await Promise.all([
                fetchTaxonDetail(taxonType, taxonName),
                fetchTaxonomyHierarchy(taxonType, taxonName)
            ])

            // 2. 加载详细数据
            const dataPromises = [
                fetchTaxonGeographic(taxonType, taxonName),
                fetchTaxonTemporal(taxonType, taxonName),
                fetchTaxonInstitutions(taxonType, taxonName, { page: 1, per_page: 20 }),
                fetchInstitutionCoverage(taxonType, taxonName)
            ]

            // 3. 根据分类类型加载额外数据
            if (taxonType === 'family' || taxonType === 'genus') {
                dataPromises.push(
                    fetchTaxonDiversity(taxonType, taxonName),
                    fetchTaxonChildren(taxonType, taxonName, { page: 1, per_page: 20 }),
                    fetchTopSpecies(taxonType, taxonName)
                )
            }

            await Promise.allSettled(dataPromises)

            // 4. 在基础数据加载完成后，加载可视化数据
            await Promise.allSettled([
                fetchMapData(taxonType, taxonName),
                fetchTimelineData(taxonType, taxonName)
            ])

            console.log('All taxon data loaded successfully')
        } catch (err) {
            error.value = err.message || 'Failed to load taxon data'
            console.error('Error loading taxon full data:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // ========== 其他方法 ==========
    const fetchTaxonomyStats = async () => {
        try {
            const response = await taxonomyApi.getTaxonomyStats()
            taxonomyStats.value = response
            console.log('Fetched taxonomy stats:', taxonomyStats.value)
            return response
        } catch (err) {
            console.error('Error fetching taxonomy stats:', err)
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

    // ========== 工具方法 ==========
    // 转换taxonName为API期望的格式
    const convertTaxonNameForAPI = (taxonType, taxonName) => {
        if (taxonType === 'species') {
            // 对于species，API期望的是specificepithet（种加词），而不是完整学名
            const parts = taxonName.trim().split(' ')
            if (parts.length >= 2) {
                const specificEpithet = parts[1]
                console.log(`Converting species name "${taxonName}" to specificepithet "${specificEpithet}"`)
                return specificEpithet
            }
        }
        return taxonName
    }

    const updateFilters = (newFilters) => {
        Object.assign(filters, newFilters)
        pagination.page = 1
    }

    const updatePagination = (newPagination) => {
        Object.assign(pagination, newPagination)
    }

    const reset = () => {
        families.value = []
        genera.value = []
        species.value = []
        currentTaxon.value = null
        taxonomyStats.value = {}
        hierarchy.value = {}

        diversityData.value = []
        geographicData.value = {}
        temporalData.value = {}
        institutionData.value = []
        topSpecies.value = []
        institutionCoverage.value = {}

        mapData.value = []
        timelineData.value = []

        error.value = null
        pagination.page = 1
        pagination.total = 0

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

        // 详细数据
        diversityData,
        geographicData,
        temporalData,
        institutionData,
        topSpecies,
        institutionCoverage,

        // 可视化数据
        mapData,
        timelineData,
        loadingMapData,
        loadingTimelineData,

        pagination,
        filters,

        // 计算属性
        hasData,
        filteredFamilies,
        filteredGenera,
        filteredSpecies,
        getTimelineChartData,
        getMapVisualizationData,

        // 基础方法
        fetchFamilies,
        fetchGenera,
        fetchSpecies,
        fetchTaxonDetail,
        fetchTaxonomyHierarchy,
        fetchTaxonomyStats,
        searchTaxa,
        fetchTaxonRecords,

        // 详细数据方法
        fetchTaxonChildren,
        fetchTaxonDiversity,
        fetchTaxonGeographic,
        fetchTaxonTemporal,
        fetchTaxonInstitutions,
        fetchTopSpecies,
        fetchInstitutionCoverage,

        // 可视化数据方法
        fetchMapData,
        fetchTimelineData,

        // 综合方法
        loadTaxonFullData,

        // 工具方法
        convertTaxonNameForAPI,
        updateFilters,
        updatePagination,
        reset
    }
}