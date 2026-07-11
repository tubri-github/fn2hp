<template>
  <div class="content-wrapper">
    <!-- Key Features Section -->
    <section class="section features-section">
      <h2 class="section-title">Key Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <!-- 简笔画放大镜 -->
              <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="25" y1="25" x2="35" y2="35" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Advanced Search</h3>
          <p>Powerful search capabilities across taxonomic, geographic, and providers dimensions.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <!-- 简笔画地球 -->
              <circle cx="20" cy="20" r="15" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M5 20h30" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M20 5c5 5 5 25 0 30" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <h3>Global Coverage</h3>
          <p>Access to occurrences from institutions worldwide.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <!-- 简笔画图表 -->
              <path d="M5 35h30" stroke="currentColor" stroke-width="2"/>
              <path d="M5 5v30" stroke="currentColor" stroke-width="2"/>
              <path d="M10 25l8-10 7 5 10-12" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <h3>Data Analysis</h3>
          <p>Tools for visualization and analysis of occurrence data.</p>
        </div>
      </div>
    </section>

    <!-- Recent Platform Improvements -->
    <section class="section improvements-section">
      <h2 class="section-title improvements-title">Recent Platform Improvements</h2>
      <div class="improvements-grid">
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>
          <span>Polygon-based geographic search</span>
        </div>
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20"/></svg>
          <span>Hydrologic Unit Code queries</span>
        </div>
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <span>Improved search interface</span>
        </div>
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>
          <span>Customizable mapping tools</span>
        </div>
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>
          <span>Object-level information pages</span>
        </div>
        <div class="improvement-box">
          <svg class="improvement-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>Use tracking and reporting</span>
        </div>
      </div>
    </section>

    <!-- Who Uses FishNet 2 -->
    <section class="section users-section">
      <h2 class="section-title users-title">Who Uses FishNet 2</h2>
      <div class="users-grid">
        <div class="user-card">
          <div class="user-card-label">Researchers</div>
          <p>Analyze biodiversity patterns, species distributions, and ecological change using specimen data.</p>
        </div>
        <div class="user-card">
          <div class="user-card-label">Collections</div>
          <p>Increase discoverability of museum data and integrate with biodiversity data publishing networks.</p>
        </div>
        <div class="user-card">
          <div class="user-card-label">Educators</div>
          <p>Bring real biodiversity data into courses and student research projects.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&display=swap');

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: 'Inter', sans-serif;
}

.section {
  margin-bottom: 120px;
}

.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 700;
  color: #16232e;
  letter-spacing: -0.02em;
}

/* Features Section */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  margin-top: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
}

.feature-icon {
  margin-bottom: 24px;
  color: #2c7cb9;
  display: flex;
  justify-content: center;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #16232e;
  margin-bottom: 16px;
}

.feature-card p {
  font-size: 1rem;
  line-height: 1.65;
  color: #566672;
  font-weight: 400;
}

/* Improvements Section —— 通栏淡蓝绿色带 + 波浪分隔 */
.improvements-section {
  position: relative;
  padding: 88px 0;
}

.improvements-section::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 100vw;
  margin-left: -50vw;
  z-index: -1;
  background:
    url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201440%2048'%20preserveAspectRatio='none'%3E%3Cpath%20fill='%23ffffff'%20d='M0,0%20H1440%20V22%20C1140,46%20900,8%20600,24%20C372,36%20168,32%200,22%20Z'/%3E%3C/svg%3E") top center / 100% 48px no-repeat,
    url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201440%2048'%20preserveAspectRatio='none'%3E%3Cpath%20fill='%23ffffff'%20d='M0,48%20H1440%20V26%20C1140,2%20900,40%20600,24%20C372,12%20168,16%200,26%20Z'/%3E%3C/svg%3E") bottom center / 100% 48px no-repeat,
    linear-gradient(135deg, #eef5fb 0%, #edf6f0 100%);
}

.improvements-title {
  text-align: center;
  margin-bottom: 40px;
}

.improvements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 40px;
}

.improvement-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 2px;
}

.improvement-icon {
  flex-shrink: 0;
  color: #2c7cb9;
}

.improvement-box span {
  font-size: 0.98rem;
  font-weight: 500;
  color: #33465a;
  line-height: 1.4;
}

/* Who Uses Section */
.users-title {
  text-align: center;
  margin-bottom: 40px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
}

.user-card {
  padding: 0;
}

.user-card-label {
  font-size: 1.15rem;
  font-weight: 650;
  color: #16232e;
  margin-bottom: 10px;
}

.user-card p {
  font-size: 0.95rem;
  line-height: 1.65;
  color: #566672;
  font-weight: 400;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .about-section {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .improvements-grid {
    grid-template-columns: 1fr;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
<script setup lang="ts">
</script>