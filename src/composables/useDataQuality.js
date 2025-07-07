// src/composables/useDataQuality.js
import { computed } from 'vue'

export function useDataQuality() {
    // 计算数据质量等级
    const getQualityLevel = (percentage) => {
        if (percentage >= 95) return 'excellent'
        if (percentage >= 80) return 'good'
        return 'poor'
    }

    // 质量颜色类
    const getQualityClass = (percentage) => {
        const level = getQualityLevel(percentage)
        return `quality-${level}`
    }

    // 质量描述
    const getQualityDescription = (percentage) => {
        if (percentage >= 95) return 'Excellent'
        if (percentage >= 80) return 'Good'
        return 'Needs Improvement'
    }

    // 计算整体质量分数
    const calculateOverallQuality = (metrics) => {
        if (!metrics || Object.keys(metrics).length === 0) return 0

        const values = Object.values(metrics).filter(v => typeof v === 'number')
        return values.reduce((sum, val) => sum + val, 0) / values.length
    }

    return {
        getQualityLevel,
        getQualityClass,
        getQualityDescription,
        calculateOverallQuality
    }
}