<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="80" height="80">
          <path fill="#ffc107" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
        </svg>
      </div>
      <h1 class="error-title">Authentication Required</h1>
      <p class="error-message">
        Please sign in to access this content.
      </p>
      <div class="error-actions">
        <button @click="handleSignIn" class="btn-primary">Sign In</button>
        <button @click="$router.push('/')" class="btn-secondary">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/utils/auth.js'

export default {
  name: 'Unauthorized',
  setup() {
    const { redirectToLogin } = useAuth()
    
    return {
      redirectToLogin
    }
  },
  methods: {
    handleSignIn() {
      this.redirectToLogin(this.$route.fullPath)
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 2rem;
}

.error-title {
  font-size: 2.5rem;
  color: #16232e;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.error-message {
  font-size: 1.125rem;
  color: #566672;
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
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
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
  background: #eef3f8;
  color: #33546e;
}

.btn-secondary:hover {
  background: #e2ebf3;
  transform: translateY(-1px);
}
</style>