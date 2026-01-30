<template>
  <footer class="footer">
    <!-- Social Media Section -->
    <div class="footer-section social-section">
      <h4 class="section-title">Join us on</h4>
      <div class="social-icons">
        <a href="#" class="social-icon" title="Twitter">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.49-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23z"/>
          </svg>
        </a>
        <a href="#" class="social-icon" title="GitHub">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Funding Section -->
    <div class="footer-section funding-section">
      <h4 class="section-title">Development funding provided by</h4>
      <div class="funding-logos">
        <div class="logo-item">
          <img src="@/assets/nsf-logo.png" alt="National Science Foundation" class="funding-logo" />
          <span>National Science Foundation</span>
        </div>
        <div class="logo-divider">|</div>
        <div class="logo-item">
          <img src="@/assets/nbii-logo.png" alt="National Biological Information Infrastructure" class="funding-logo" />
          <span>National Biological Information Infrastructure</span>
        </div>
      </div>
    </div>

    <!-- Copyright Section -->
    <div class="footer-section copyright-section">
      <p>© 2017-2025 FishNet 2. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'ModernFooter'
}
</script>

<style scoped>
.footer {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  padding: 40px 20px;
}

.footer-section {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 20px 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4A90E2;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

/* Social Media Section */
.social-icons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 12px;
}

.social-icon {
  color: #4A90E2;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  background: rgba(74, 144, 226, 0.05);
}

.social-icon:hover {
  color: #2171CD;
  background: rgba(74, 144, 226, 0.1);
  transform: translateY(-1px);
}

/* Funding Section */
.funding-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.logo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #4A5568;
}

.funding-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.logo-item:hover .funding-logo {
  opacity: 1;
}

.logo-divider {
  color: rgba(74, 144, 226, 0.2);
  font-weight: 300;
}

/* Copyright Section */
.copyright-section {
  font-size: 0.85rem;
  color: #718096;
  padding-top: 32px;
  margin-top: 32px;
  border-top: 1px solid rgba(74, 144, 226, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .funding-logos {
    flex-direction: column;
    gap: 16px;
  }

  .logo-divider {
    display: none;
  }
}
</style>