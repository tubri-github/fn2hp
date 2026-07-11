<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="80" height="80">
          <path fill="#dc3545" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
        </svg>
      </div>
      <h1 class="error-title">Access Denied</h1>
      <p class="error-message">
        You don't have permission to access this resource.
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
  name: 'Forbidden'
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