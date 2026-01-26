// src/api/fishair.js - FishAIR API调用
import axios from 'axios'

// 创建专门用于FishnetUserSystem的axios实例
const fishnetApi = axios.create({
    baseURL: import.meta.env.VITE_FISHAIR_API_URL || 'http://localhost:8010',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// 请求拦截器 - 添加认证token
fishnetApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
fishnetApi.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        console.error('FishAIR API Error:', error)
        return Promise.reject(error)
    }
)

export const fishairApi = {
    // 根据scientific name获取鱼类图片
    getFishImages(scientificName, options = {}) {
        const params = {
            scientific_name: scientificName,
            limit: options.limit || 5,
            page: options.page || 1,
            per_page: options.per_page || 20
        }

        // 添加图片类型筛选
        if (options.dataset) {
            params.dataset = options.dataset
        }

        return fishnetApi.get('/fish-images/', { params })
    },

    // 获取图片类型统计
    getImageStats(scientificName) {
        return fishnetApi.get('/fish-images/stats/', {
            params: {
                scientific_name: scientificName
            }
        })
    },

    // 获取图片树结构
    getImageTree(arkId) {
        return fishnetApi.get(`/fish-images/tree/${arkId}`)
    },

    // 检查FishAIR API连接状态
    healthCheck() {
        return fishnetApi.get('/health/')
    }
}