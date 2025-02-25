<template>
  <div class="content-wrapper">
    <!-- About Section -->
    <section class="section about-section">
      <div class="text-content">
        <h2 class="section-title">About FishNet2</h2>
        <div class="section-text">
          <p >
            The FishNet network is a collaborative effort among fish collections around the world to share and distribute data on specimen holdings. There is an open invitation for any institution with a fish collection to join.
          </p>
          <p>
            The network was created in 1999 and initially relied upon a distributed query model based on the Z39.50 search/retrieval protocol. Over the years, FishNet has transitioned through a number of technological improvements. The modern search portal relies upon a core web service known as the Biological Object Search Service (BOSS) which is comprised of a series of software and database components that harvests data from providers, imports harvested data into a data cache and exposes the data cache via publicly accessible web based APIs. The architecture for FishNet 2 has been mirrored to provide similar search portals for reptile and amphibian data within HerpNET and bird data within ORNIS.
          </p>
        </div>

      </div>
      <div class="image-content">
        <img src="@/assets/img.png" alt="Fish Specimen" class="section-image"/>
        <span class="image-caption">Fish specimen collection</span>
      </div>
    </section>

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

    <!-- Updates Section -->
    <section class="section updates-section">
      <h2 class="section-title">Latest Updates</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-date">January 10, 2025</div>
          <div class="timeline-content">
            <h3 class="timeline-title">New Dataset Integration</h3>
            <p class="timeline-text">
              "Placeholder" collections have joined the network, adding over 100,000 specimens to our database.
            </p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">January 8, 2025</div>
          <div class="timeline-content">
            <h3 class="timeline-title">Research Highlight</h3>
            <p class="timeline-text">
              Recent study utilizing FishNet2 data reveals new insights into freshwater fish distribution patterns.
            </p>
          </div>
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
  font-size: 2.5rem;
  font-weight: bolder;
  color: #3f8ba1;
  margin-bottom: 60px;
  letter-spacing: -0.5px;
}

/* About Section */
.about-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  font-weight: 300;
}

.image-content {
  position: relative;
}

.section-image {
  width: 100%;
  border-radius: 4px;
}

.image-caption {
  font-size: 1rem;
  color: #578ecc;
  margin-top: 10px;
  display: block;
  text-align: center;
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
  color: #3b82f6;
  display: flex;
  justify-content: center;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 400;
  color: #333;
  margin-bottom: 16px;
}

.feature-card p {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
  font-weight: 300;
}

/* Timeline Section */
.timeline {
  position: relative;
  padding-left: 50px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  margin-bottom: 40px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -54px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
}

.timeline-date {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.timeline-title {
  font-size: 1.2rem;
  font-weight: 400;
  color: #333;
  margin-bottom: 10px;
}

.timeline-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  font-weight: 300;
}

/* Responsive Design */
@media (max-width: 768px) {
  .about-section {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
<script setup lang="ts">
</script>