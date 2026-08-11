<template>
  <div class="auth-callback-page">
    <div class="callback-container">
      <div v-if="isProcessing" class="processing-state">
        <div class="spinner"></div>
        <h2>Processing Authentication...</h2>
        <p>Please wait while we verify your login.</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" width="60" height="60">
            <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
          </svg>
        </div>
        <h2>Authentication Failed</h2>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="retryLogin" class="btn-primary">Try Again</button>
          <button @click="goHome" class="btn-secondary">Go Home</button>
        </div>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" width="60" height="60">
            <path fill="#28a745" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2>Login Successful!</h2>
        <p>Redirecting you back to the application...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@/utils/auth.js'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const isProcessing = ref(true)
    const error = ref(null)

    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const state = urlParams.get('state')
        const errorParam = urlParams.get('error')

        // 检查是否有错误参数
        if (errorParam) {
          throw new Error(`Authentication error: ${errorParam}`)
        }

        // 验证state参数防止CSRF攻击
        const savedState = localStorage.getItem('auth_state')
        if (!state || state !== savedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.')
        }

        // 清除保存的state
        localStorage.removeItem('auth_state')

        // 通过 SSO check-session 获取用户信息（cookie 已由 SSO 登录设置好）
        const response = await fetch(
          `${authClient.config.authCenterUrl}${authClient.config.apiPrefix}/sso/check-session?project=${authClient.config.projectCode}`,
          { credentials: 'include' }
        )

        const responseData = await response.json()

        if (!response.ok || !responseData.success || !responseData.data?.has_project_access) {
          throw new Error(responseData.message || 'Failed to verify session')
        }

        const data = responseData.data

        // 构造用户对象
        const userData = {
          user_id: data.user_id,
          username: data.username,
          email: data.email,
          display_name: data.display_name,
          is_superuser: data.is_superuser || false,
          permissions: data.permissions || []
        }

        // 保存用户信息
        authClient.saveAuth(userData)

        isProcessing.value = false

        // 重定向到原来要访问的页面或首页
        const savedRedirectUrl = localStorage.getItem(authClient.config.storageKeys.redirectUrl)
        localStorage.removeItem(authClient.config.storageKeys.redirectUrl)

        // router.push 的路径不带 base 前缀，这里先把它剥掉
        const base = import.meta.env.BASE_URL // 结尾带 '/'
        const stripBase = (path) => {
          if (base !== '/' && path.startsWith(base)) {
            path = '/' + path.slice(base.length)
          }
          return path || '/'
        }

        let redirectPath = '/'
        if (savedRedirectUrl) {
          try {
            // 如果是完整URL，提取pathname
            const url = new URL(savedRedirectUrl)
            redirectPath = stripBase(url.pathname)
          } catch {
            // 如果不是完整URL，直接使用
            redirectPath = stripBase(savedRedirectUrl)
          }
        }

        setTimeout(() => {
          router.push(redirectPath)
        }, 1500)

      } catch (err) {
        console.error('Authentication callback error:', err)
        error.value = err.message
        isProcessing.value = false
      }
    }

    const retryLogin = () => {
      authClient.redirectToLogin()
    }

    const goHome = () => {
      router.push('/')
    }

    onMounted(() => {
      processCallback()
    })

    return {
      isProcessing,
      error,
      retryLogin,
      goHome
    }
  }
}
</script>

<style scoped>
.auth-callback-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.callback-container {
  text-align: center;
  max-width: 500px;
}

.processing-state,
.error-state,
.success-state {
  padding: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e8f0ff;
  border-top: 4px solid #2c7cb9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.success-icon {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.processing-state h2 {
  color: #2c7cb9;
}

.error-state h2 {
  color: #dc3545;
}

.success-state h2 {
  color: #28a745;
}

p {
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #2c7cb9;
  color: white;
}

.btn-primary:hover {
  background: #1e5a8a;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .auth-callback-page {
    padding: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>