// 认证工具类 - Vue3版本
import axios from 'axios'
import { ref, computed } from 'vue'

// 认证配置
const AUTH_CONFIG = {
  authCenterUrl: import.meta.env.VITE_AUTH_CENTER_URL || 'http://localhost:8010',  // 认证中心地址
  projectCode: import.meta.env.VITE_PROJECT_CODE || 'FN2',  // 项目代码，与后端保持一致
  apiPrefix: '/api/v1',
  apiBaseUrl: import.meta.env.VITE_FISHESOFLA_API_URL || 'http://localhost:8001',  // FishesOfLAAPI地址
  storageKeys: {
    token: 'auth_token',
    refreshToken: 'refresh_token',
    user: 'auth_user',
    redirectUrl: 'auth_redirect_url'
  }
}

// 响应式认证状态
const user = ref(null)
const token = ref(null)
const isLoading = ref(false)
const isAuthenticated = computed(() => !!token.value && !!user.value)

// 解析JWT payload（不做签名验证，仅读取过期时间）
function parseJwtPayload(jwt) {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(jwt) {
  const payload = parseJwtPayload(jwt)
  if (!payload || !payload.exp) return true
  return Date.now() / 1000 > payload.exp
}

class AuthClient {
  constructor(config = AUTH_CONFIG) {
    this.config = config
    this._expirationTimer = null

    // 初始化时从localStorage恢复状态
    this.loadFromStorage()

    // 设置axios拦截器
    this.setupAxiosInterceptors()
  }

  // 从localStorage加载认证状态
  loadFromStorage() {
    try {
      const savedToken = localStorage.getItem(this.config.storageKeys.token)
      const savedUser = localStorage.getItem(this.config.storageKeys.user)

      if (savedToken && savedUser) {
        // 检查token是否已过期
        if (isTokenExpired(savedToken)) {
          console.warn('Token expired, clearing auth state')
          this.clearStorage()
          return
        }

        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // 设置axios默认header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`

        // 设置过期自动退出定时器
        this._scheduleExpiration(savedToken)
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error)
      this.clearStorage()
    }
  }

  // 设置token过期定时器
  _scheduleExpiration(jwt) {
    if (this._expirationTimer) {
      clearTimeout(this._expirationTimer)
      this._expirationTimer = null
    }

    const payload = parseJwtPayload(jwt)
    if (!payload || !payload.exp) return

    const msUntilExpiry = payload.exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) {
      this.clearAuth()
      return
    }

    this._expirationTimer = setTimeout(() => {
      console.warn('Token expired, auto logging out')
      this.clearAuth()
    }, msUntilExpiry)
  }

  // 保存到localStorage
  saveToStorage(tokenData, userData, refreshTokenData = null) {
    try {
      localStorage.setItem(this.config.storageKeys.token, tokenData)
      localStorage.setItem(this.config.storageKeys.user, JSON.stringify(userData))
      if (refreshTokenData) {
        localStorage.setItem(this.config.storageKeys.refreshToken, refreshTokenData)
      }
      
      // 设置axios默认header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`
    } catch (error) {
      console.error('Failed to save auth state to storage:', error)
    }
  }

  // 清除存储
  clearStorage() {
    Object.values(this.config.storageKeys).forEach(key => {
      localStorage.removeItem(key)
    })
    
    // 清除axios默认header
    delete axios.defaults.headers.common['Authorization']
  }

  // 保存认证信息（包括响应式状态更新）
  saveAuth(tokenData, userData, refreshTokenData = null) {
    // 更新响应式状态
    token.value = tokenData
    user.value = userData

    // 保存到localStorage
    this.saveToStorage(tokenData, userData, refreshTokenData)

    // 设置过期自动退出
    this._scheduleExpiration(tokenData)
  }

  // 设置axios拦截器
  setupAxiosInterceptors() {
    // 请求拦截器 - 添加认证头
    axios.interceptors.request.use(
      (config) => {
        if (token.value) {
          config.headers.Authorization = `Bearer ${token.value}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器 - 处理401错误
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // 尝试刷新token
          const refreshed = await this.refreshToken()
          if (refreshed) {
            // 重新发送原请求
            return axios.request(error.config)
          }
          // 刷新也失败，token确实无效了，清除登录状态
          if (token.value && isTokenExpired(token.value)) {
            this.clearAuth()
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // 检查当前登录状态
  async checkAuthStatus() {
    if (!token.value) {
      return false
    }

    try {
      isLoading.value = true

      // 先尝试后端API
      const response = await axios.get(`${this.config.apiBaseUrl}/auth/info`)

      if (response.data.authenticated) {
        const userData = response.data.user
        user.value = userData
        this.saveToStorage(token.value, userData)
        return true
      } else {
        // 后端说未认证，再跟认证中心确认一下token是否真的失效
        return await this._validateTokenWithAuthCenter()
      }
    } catch (error) {
      console.error('Auth status check failed:', error)

      // API不可用时，用认证中心验证token
      if (token.value) {
        return await this._validateTokenWithAuthCenter()
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  // 直接跟认证中心验证token
  async _validateTokenWithAuthCenter() {
    if (!token.value) return false

    try {
      const response = await fetch(
        `${this.config.authCenterUrl}${this.config.apiPrefix}/sso/user-info?project=${this.config.projectCode}`,
        { headers: { 'Authorization': `Bearer ${token.value}` } }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const userData = {
            user_id: result.data.user_id,
            username: result.data.username,
            email: result.data.email,
            display_name: result.data.display_name,
            is_superuser: result.data.is_superuser,
            permissions: result.data.permissions || []
          }
          user.value = userData
          this.saveToStorage(token.value, userData)
          return true
        }
      }

      // 认证中心也拒绝了，token真的失效了
      this.clearAuth()
      return false
    } catch (e) {
      console.warn('Auth center validation failed, keeping local token:', e)
      // 认证中心也不可用，保留本地状态
      return !!token.value && !!user.value
    }
  }

  // 刷新token
  async refreshToken() {
    const refreshTokenData = localStorage.getItem(this.config.storageKeys.refreshToken)
    if (!refreshTokenData) {
      return false
    }

    try {
      const response = await axios.post(
        `${this.config.authCenterUrl}${this.config.apiPrefix}/auth/refresh`,
        { refresh_token: refreshTokenData }
      )

      if (response.data.success) {
        const { access_token, user: userData } = response.data.data
        token.value = access_token
        user.value = userData
        this.saveToStorage(access_token, userData, refreshTokenData)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  // 重定向到统一登录页面
  redirectToLogin(returnUrl = null) {
    // 保存返回地址
    const redirectUrl = returnUrl || window.location.href
    localStorage.setItem(this.config.storageKeys.redirectUrl, redirectUrl)

    // 生成随机state用于防CSRF
    const state = this.generateRandomString(43)
    localStorage.setItem('auth_state', state)

    // 构建SSO登录URL - 重定向到认证中心
    const params = new URLSearchParams({
      redirect_uri: `${window.location.origin}${import.meta.env.PROD ? '/dist' : ''}/gate/callback`,
      project: this.config.projectCode,
      state: state
    })
    
    window.location.href = `${this.config.authCenterUrl}${this.config.apiPrefix}/sso/login?${params.toString()}`
  }

  // 处理登录成功回调（在页面加载时调用）
  async handleLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    const authSuccess = urlParams.get('auth')
    
    if (authSuccess === 'success') {
      try {
        isLoading.value = true
        
        // 检查认证状态
        const authenticated = await this.checkAuthStatus()
        
        if (authenticated) {
          // 清理URL参数
          const cleanUrl = window.location.origin + window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
          
          // 跳转到原来要访问的页面
          const savedRedirectUrl = localStorage.getItem(this.config.storageKeys.redirectUrl)
          if (savedRedirectUrl && savedRedirectUrl !== window.location.href) {
            localStorage.removeItem(this.config.storageKeys.redirectUrl)
            window.location.href = savedRedirectUrl
            return
          }
          
          return true
        }
      } catch (error) {
        console.error('Login callback failed:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    return false
  }

  // 登出
  async logout() {
    try {
      // 调用认证中心的SSO登出接口
      await axios.post(`${this.config.authCenterUrl}${this.config.apiPrefix}/sso/logout`, {
        redirect_uri: window.location.origin
      }, {
        withCredentials: true  // 确保发送cookies
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      this.clearAuth()
      // 刷新页面或跳转到首页
      window.location.href = import.meta.env.PROD ? '/dist/' : '/'
    }
  }

  // 清除认证状态
  clearAuth() {
    if (this._expirationTimer) {
      clearTimeout(this._expirationTimer)
      this._expirationTimer = null
    }
    token.value = null
    user.value = null
    this.clearStorage()
  }

  // 检查用户权限
  hasPermission(permission) {
    return user.value?.permissions?.includes(permission) || false
  }

  // 检查用户角色
  hasRole(role) {
    return user.value?.roles?.includes(role) || false
  }

  // 检查是否为超级用户
  get isSuperUser() {
    return user.value?.is_superuser || false
  }

  // 检查是否为数据提供者
  get isDataProvider() {
    return this.hasPermission('project.admin') || 
           this.hasPermission('data.manage') || 
           this.hasPermission('data.upload') ||
           this.isSuperUser
  }

  // 检查是否可以访问提供者仪表板
  get canAccessProviderDashboard() {
    return this.isDataProvider
  }

  // 检查是否可以访问用户仪表板
  get canAccessUserDashboard() {
    return isAuthenticated.value
  }

  // 生成随机字符串（用于state参数）
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// 创建全局认证实例
export const authClient = new AuthClient()

// Vue3 Composition API Hook
export function useAuth() {
  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isSuperUser: computed(() => authClient.isSuperUser),
    isDataProvider: computed(() => authClient.isDataProvider),
    canAccessProviderDashboard: computed(() => authClient.canAccessProviderDashboard),
    canAccessUserDashboard: computed(() => authClient.canAccessUserDashboard),
    
    checkAuthStatus: () => authClient.checkAuthStatus(),
    handleLoginCallback: () => authClient.handleLoginCallback(),
    redirectToLogin: (returnUrl) => authClient.redirectToLogin(returnUrl),
    logout: () => authClient.logout(),
    hasPermission: (permission) => authClient.hasPermission(permission),
    hasRole: (role) => authClient.hasRole(role)
  }
}

// 路由守卫
export function createAuthGuard(router) {
  router.beforeEach(async (to, from, next) => {
    // 处理登录回调
    if (to.query.auth === 'success') {
      const success = await authClient.handleLoginCallback()
      if (success) {
        return // handleLoginCallback会处理跳转
      }
    }

    // 检查路由是否需要认证
    if (to.meta.requiresAuth) {
      // 优先使用本地认证状态，只有在没有token时才调用API验证
      let authenticated = isAuthenticated.value
      
      if (!authenticated) {
        authenticated = await authClient.checkAuthStatus()
      }
      
      if (!authenticated) {
        authClient.redirectToLogin(to.fullPath)
        return
      }

      // 检查权限
      if (to.meta.permissions && to.meta.permissions.length > 0) {
        const hasPermission = to.meta.permissions.some(permission => 
          authClient.hasPermission(permission)
        )
        
        if (!hasPermission) {
          // 权限不足，跳转到403页面或首页
          next('/403')
          return
        }
      }

      // 检查特殊的仪表板访问权限
      if (to.path === '/dashboard/provider' && !authClient.canAccessProviderDashboard) {
        next('/dashboard/user') // 重定向到用户仪表板
        return
      }
    }

    next()
  })
}