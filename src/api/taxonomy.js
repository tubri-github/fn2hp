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

    // 获取机构覆盖度分析
    getTaxonInstitutionCoverage(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/institution-coverage`)
    },

    // ========== 新增：地图和时间线专用API ==========

    // 获取用于地图显示的数据
    getTaxonMapData(taxonType, taxonName) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/map-data`)
    },

    // 获取时间线数据（已包含在temporal中，但可以单独获取年度趋势）
    getTaxonTimelineData(taxonType, taxonName, params = {}) {
        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/temporal`, { params })
            .then(response => {
                // 从temporal响应中提取时间线数据
                return {
                    timelineData: response.yearlyTrend || [],
                    coverage: response.dataCoverage || {},
                    summary: response.summary || {}
                }
            })
    },

    // 获取详细的年度数据（可以用于更精细的时间线控制）
    getTaxonYearlyData(taxonType, taxonName, startYear = null, endYear = null) {
        const params = {}
        if (startYear) params.start_year = startYear
        if (endYear) params.end_year = endYear

        return api.get(`/${taxonType}/${encodeURIComponent(taxonName)}/temporal`, { params })
            .then(response => response.yearlyTrend || [])
    },

    // 获取机构地理分布数据（专门用于WorldMap组件）
    getTaxonInstitutionMapData(taxonType, taxonName) {
        return Promise.all([
            this.getTaxonInstitutions(taxonType, taxonName, { per_page: 100 }),
            this.getTaxonMapData(taxonType, taxonName)
        ]).then(([institutions, mapData]) => {
            // 组合机构数据和地图数据
            const institutionList = institutions.data || []
            const mapDataList = mapData.mapData || []

            // 如果有专门的地图数据就用地图数据，否则转换机构数据
            if (mapDataList.length > 0) {
                return mapDataList
            }

            // 从机构数据转换为地图数据
            return this.transformInstitutionsToMapData(institutionList)
        })
    },

    // 工具方法：将机构数据转换为地图数据格式
    transformInstitutionsToMapData(institutions) {
        // 国家坐标映射
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
            'Russia': { lat: 61.5240, lng: 105.3188 },
            'India': { lat: 20.5937, lng: 78.9629 },
            'Mexico': { lat: 23.6345, lng: -102.5528 },
            'Argentina': { lat: -38.4161, lng: -63.6167 },
            'Spain': { lat: 40.4637, lng: -3.7492 },
            'Italy': { lat: 41.8719, lng: 12.5674 },
            'Sweden': { lat: 60.1282, lng: 18.6435 },
            'Norway': { lat: 60.4720, lng: 8.4689 },
            'South Africa': { lat: -30.5595, lng: 22.9375 }
        }

        // 按国家分组机构
        const countryGroups = {}
        institutions.forEach(inst => {
            const country = inst.country || 'Unknown'
            if (!countryGroups[country]) {
                countryGroups[country] = {
                    institutions: [],
                    totalRecords: 0,
                    totalInstitutions: 0
                }
            }
            countryGroups[country].institutions.push(inst)
            countryGroups[country].totalRecords += inst.recordCount || 0
            countryGroups[country].totalInstitutions += 1
        })

        // 转换为地图数据点
        return Object.entries(countryGroups).map(([country, data]) => {
            const coords = countryCoords[country]
            if (!coords) return null

            return {
                institutionCode: `AGG_${country.toUpperCase().replace(/\s+/g, '_')}`,
                institutionName: `${country} (${data.totalInstitutions} institutions)`,
                lat: coords.lat,
                lng: coords.lng,
                recordCount: data.totalRecords,
                country: country,
                institutionCount: data.totalInstitutions,
                // 添加一些随机偏移避免重叠
                latOffset: (Math.random() - 0.5) * 2,
                lngOffset: (Math.random() - 0.5) * 2
            }
        }).filter(Boolean)
    },

    // 获取分类单元的完整数据集（用于一次性加载所有必要数据）
    getTaxonCompleteData(taxonType, taxonName) {
        return Promise.allSettled([
            this.getTaxonDetail(taxonType, taxonName),
            this.getTaxonHierarchy(taxonType, taxonName),
            this.getTaxonGeographic(taxonType, taxonName),
            this.getTaxonTemporal(taxonType, taxonName),
            this.getTaxonInstitutions(taxonType, taxonName, { per_page: 20 }),
            this.getTaxonInstitutionCoverage(taxonType, taxonName),
            this.getTaxonMapData(taxonType, taxonName)
        ]).then(results => {
            const [
                detailResult,
                hierarchyResult,
                geographicResult,
                temporalResult,
                institutionsResult,
                coverageResult,
                mapDataResult
            ] = results

            return {
                detail: detailResult.status === 'fulfilled' ? detailResult.value : null,
                hierarchy: hierarchyResult.status === 'fulfilled' ? hierarchyResult.value : {},
                geographic: geographicResult.status === 'fulfilled' ? geographicResult.value : {},
                temporal: temporalResult.status === 'fulfilled' ? temporalResult.value : {},
                institutions: institutionsResult.status === 'fulfilled' ? institutionsResult.value : { data: [] },
                coverage: coverageResult.status === 'fulfilled' ? coverageResult.value : {},
                mapData: mapDataResult.status === 'fulfilled' ? mapDataResult.value.mapData || [] : [],
                errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
            }
        })
    },

    // 获取特定分类单元的详细信息（统一方法）
    getTaxonDetail(taxonType, taxonName) {
        switch (taxonType) {
            case 'family':
                return this.getFamilyDetail(taxonName)
            case 'genus':
                return this.getGenusDetail(taxonName)
            case 'species':
                return this.getSpeciesDetail(taxonName)
            default:
                throw new Error(`Invalid taxon type: ${taxonType}`)
        }
    },

    // 批量获取时间线数据（支持多个分类单元比较）
    getBatchTimelineData(taxonList) {
        const promises = taxonList.map(({ taxonType, taxonName }) =>
            this.getTaxonTimelineData(taxonType, taxonName)
                .then(data => ({ taxonType, taxonName, data }))
                .catch(error => ({ taxonType, taxonName, error }))
        )

        return Promise.all(promises)
    },

    // 获取地理分布的聚合数据（用于区域级别的可视化）
    getTaxonRegionalData(taxonType, taxonName) {
        return this.getTaxonGeographic(taxonType, taxonName)
            .then(geographic => {
                // 从地理数据中提取区域聚合信息
                const regional = {
                    continents: geographic.continentalDistribution || [],
                    countries: geographic.countryDistribution || [],
                    hotspots: geographic.biodiversityHotspots || []
                }

                // 计算区域统计
                const regionStats = regional.continents.reduce((stats, continent) => {
                    stats[continent.name] = {
                        records: continent.records,
                        percentage: continent.percentage,
                        countries: regional.countries.filter(country =>
                            this.isCountryInContinent(country.name, continent.name)
                        ).length
                    }
                    return stats
                }, {})

                return {
                    regional,
                    regionStats,
                    summary: {
                        totalContinents: regional.continents.length,
                        totalCountries: regional.countries.length,
                        totalHotspots: regional.hotspots.length,
                        mostActiveContinent: regional.continents[0]?.name || 'Unknown'
                    }
                }
            })
    },

    // 工具方法：判断国家属于哪个大洲
    isCountryInContinent(country, continent) {
        const continentMapping = {
            'North America': ['United States', 'USA', 'US', 'Canada', 'Mexico'],
            'Europe': ['United Kingdom', 'UK', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway'],
            'Asia-Pacific': ['China', 'Japan', 'Australia', 'New Zealand', 'India', 'South Korea', 'Thailand', 'Malaysia', 'Singapore'],
            'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela'],
            'Africa': ['South Africa', 'Kenya', 'Tanzania', 'Egypt', 'Morocco', 'Nigeria']
        }

        return continentMapping[continent]?.includes(country) || false
    },

    // 获取时间序列的统计摘要
    getTimelineStatsSummary(taxonType, taxonName) {
        return this.getTaxonTemporal(taxonType, taxonName)
            .then(temporal => {
                const yearlyData = temporal.yearlyTrend || []

                if (yearlyData.length === 0) {
                    return {
                        isEmpty: true,
                        message: 'No temporal data available'
                    }
                }

                // 计算统计指标
                const records = yearlyData.map(d => d.records)
                const years = yearlyData.map(d => d.year)

                const totalRecords = records.reduce((sum, r) => sum + r, 0)
                const avgRecords = totalRecords / records.length
                const maxRecords = Math.max(...records)
                const minRecords = Math.min(...records)
                const peakYear = yearlyData.find(d => d.records === maxRecords)?.year

                // 计算趋势
                const recentData = yearlyData.slice(-5) // 最近5年
                const olderData = yearlyData.slice(-10, -5) // 之前5年

                let trend = 'stable'
                if (recentData.length >= 3 && olderData.length >= 3) {
                    const recentAvg = recentData.reduce((sum, d) => sum + d.records, 0) / recentData.length
                    const olderAvg = olderData.reduce((sum, d) => sum + d.records, 0) / olderData.length
                    const change = ((recentAvg - olderAvg) / olderAvg) * 100

                    if (change > 10) trend = 'increasing'
                    else if (change < -10) trend = 'decreasing'
                }

                return {
                    isEmpty: false,
                    summary: {
                        totalRecords,
                        avgRecords: Math.round(avgRecords),
                        maxRecords,
                        minRecords,
                        peakYear,
                        yearSpan: Math.max(...years) - Math.min(...years),
                        dataPoints: yearlyData.length,
                        trend,
                        coverage: temporal.dataCoverage?.dateCoverage || 0
                    },
                    periods: temporal.historicalPeriods || [],
                    seasonal: temporal.seasonalPatterns || [],
                    recent: temporal.recentActivity || []
                }
            })
    },

    // 获取机构网络数据（用于机构关系可视化）
    getTaxonInstitutionNetwork(taxonType, taxonName) {
        return this.getTaxonInstitutions(taxonType, taxonName, { per_page: 50 })
            .then(response => {
                const institutions = response.data || []

                // 按国家和类型分组
                const networks = {
                    byCountry: {},
                    byType: {},
                    collaborations: []
                }

                institutions.forEach(inst => {
                    const country = inst.country || 'Unknown'
                    const type = this.inferInstitutionType(inst.code)

                    // 按国家分组
                    if (!networks.byCountry[country]) {
                        networks.byCountry[country] = []
                    }
                    networks.byCountry[country].push(inst)

                    // 按类型分组
                    if (!networks.byType[type]) {
                        networks.byType[type] = []
                    }
                    networks.byType[type].push(inst)
                })

                // 计算潜在协作关系（基于地理邻近性和收藏重叠）
                Object.entries(networks.byCountry).forEach(([country, insts]) => {
                    if (insts.length > 1) {
                        // 同一国家的机构之间可能有协作
                        for (let i = 0; i < insts.length - 1; i++) {
                            for (let j = i + 1; j < insts.length; j++) {
                                networks.collaborations.push({
                                    source: insts[i].code,
                                    target: insts[j].code,
                                    type: 'domestic',
                                    strength: this.calculateCollaborationStrength(insts[i], insts[j])
                                })
                            }
                        }
                    }
                })

                return {
                    institutions,
                    networks,
                    summary: {
                        totalInstitutions: institutions.length,
                        countriesCount: Object.keys(networks.byCountry).length,
                        typesCount: Object.keys(networks.byType).length,
                        collaborationsCount: networks.collaborations.length
                    }
                }
            })
    },

    // 工具方法：推断机构类型
    inferInstitutionType(institutionCode) {
        const code = institutionCode.toLowerCase()
        if (code.includes('mus') || code.includes('mnh')) return 'museum'
        if (code.includes('univ') || code.includes('coll')) return 'university'
        if (code.includes('gov') || code.includes('usgs') || code.includes('noaa')) return 'government'
        if (code.includes('acad') || code.includes('inst')) return 'research'
        return 'other'
    },

    // 工具方法：计算协作强度
    calculateCollaborationStrength(inst1, inst2) {
        // 基于记录数量、物种重叠等因素计算协作可能性
        const recordSimilarity = Math.min(inst1.recordCount, inst2.recordCount) / Math.max(inst1.recordCount, inst2.recordCount)
        const speciesSimilarity = Math.min(inst1.speciesCount || 0, inst2.speciesCount || 0) / Math.max(inst1.speciesCount || 1, inst2.speciesCount || 1)

        return Math.round((recordSimilarity + speciesSimilarity) * 50) // 0-100的强度值
    },

    // 导出数据方法
    exportTaxonData(taxonType, taxonName, format = 'json') {
        return this.getTaxonCompleteData(taxonType, taxonName)
            .then(data => {
                const exportData = {
                    metadata: {
                        taxonType,
                        taxonName,
                        exportDate: new Date().toISOString(),
                        format
                    },
                    ...data
                }

                if (format === 'csv') {
                    return this.convertToCSV(exportData)
                }

                return exportData
            })
    },

    // 工具方法：转换为CSV格式
    convertToCSV(data) {
        // 简化的CSV转换，实际应用中可能需要更复杂的逻辑
        const institutions = data.institutions?.data || []
        if (institutions.length === 0) return 'No data available'

        const headers = ['Code', 'Name', 'Country', 'Records', 'Species', 'Quality']
        const rows = institutions.map(inst => [
            inst.code,
            inst.name,
            inst.country,
            inst.recordCount,
            inst.speciesCount,
            inst.geoReferencingQuality
        ])

        return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
}