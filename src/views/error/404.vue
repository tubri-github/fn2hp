<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="80" height="80">
          <path fill="#6c757d" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <h1 class="error-title">Page Not Found</h1>
      <p class="error-message">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div class="error-actions">
        <button @click="$router.go(-1)" class="btn-secondary">Go Back</button>
        <button @click="$router.push('/')" class="btn-primary">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
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
  color: #6c757d;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
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
</style>