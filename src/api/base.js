// src/api/base.js
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    withCredentials: true,  // 通过 cookie 认证
    headers: {
        'Content-Type': 'application/json',
    }
})

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

export default api