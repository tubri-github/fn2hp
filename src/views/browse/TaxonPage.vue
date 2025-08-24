<template>
  <div class="taxon-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading {{ taxonType }} information...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button @click="loadTaxonData" class="retry-button">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else-if="currentTaxon" class="container">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> &gt;
        <router-link to="/browse">Browse</router-link> &gt;
        <router-link v-if="hierarchy.order" :to="`/browse/orders/${hierarchy.order}`">{{ hierarchy.order }}</router-link> &gt;
        <strong>{{ taxonName }}</strong>
      </div>

      <!-- Family Header with Darwin Core Fields -->
      <div class="family-header">
        <div class="family-title">
          <h1 class="family-name">{{ currentTaxon.scientificName || taxonName }}</h1>
          <span class="taxon-rank">{{ formatTaxonRank(taxonType) }}</span>
        </div>

        <div class="darwin-core-taxonomy">
          <div class="dc-field-group">
            <div class="dc-label">kingdom</div>
            <div class="dc-value">{{ currentTaxon.kingdom || 'Animalia' }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">phylum</div>
            <div class="dc-value">{{ currentTaxon.phylum || 'Chordata' }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">class</div>
            <div class="dc-value">{{ currentTaxon.class || 'Actinopterygii' }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">order</div>
            <div class="dc-value">{{ currentTaxon.order || '-' }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">{{ taxonType }}</div>
            <div class="dc-value">{{ currentTaxon.scientificName || taxonName }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">vernacularName</div>
            <div class="dc-value">{{ formatCommonNames(currentTaxon.vernacularName) }}</div>
          </div>
        </div>

        <div class="family-stats">
          <div v-if="taxonType === 'family'" class="stat-item">
            <div class="stat-number">{{ formatNumber(currentTaxon.generaCount) }}</div>
            <div class="stat-label">Genera</div>
          </div>
          <div v-if="taxonType !== 'species'" class="stat-item">
            <div class="stat-number">{{ formatNumber(currentTaxon.speciesCount) }}</div>
            <div class="stat-label">Species</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatNumber(currentTaxon.recordCount) }}</div>
            <div class="stat-label">Total Records</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatNumber(currentTaxon.institutionsCount) }}</div>
            <div class="stat-label">Institutions</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatNumber(currentTaxon.countriesCount) }}</div>
            <div class="stat-label">Countries</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ currentTaxon.geoReferencingQuality || 0 }}%</div>
            <div class="stat-label">Georeferenced</div>
          </div>
        </div>

        <div class="family-actions">
          <button class="action-button download" @click="exportTaxonData">
            <span class="action-icon">⬇️</span> Download {{ formatTaxonRank(taxonType) }} DwC Archive
          </button>
          <button class="action-button compare" @click="compareTaxa">
            <span class="action-icon">⚖️</span> Compare with Other {{ formatTaxonRank(taxonType, true) }}
          </button>
          <button class="action-button export" @click="generateReport">
            <span class="action-icon">📊</span> Generate {{ formatTaxonRank(taxonType) }} Report
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <ul>
<!--          <li><a href="#overview" :class="{ active: activeTab === 'overview' }" @click.prevent="activeTab = 'overview'">Overview</a></li>-->
          <li v-if="taxonType === 'family'"><a href="#genera" :class="{ active: activeTab === 'genera' }" @click.prevent="activeTab = 'genera'">Genera & Species</a></li>
          <li v-else-if="taxonType === 'genus'"><a href="#species" :class="{ active: activeTab === 'species' }" @click.prevent="activeTab = 'species'">Species</a></li>
          <li><a href="#distribution" :class="{ active: activeTab === 'distribution' }" @click.prevent="activeTab = 'distribution'">Geographic Distribution</a></li>
          <li><a href="#temporal" :class="{ active: activeTab === 'temporal' }" @click.prevent="activeTab = 'temporal'">Temporal Patterns</a></li>
          <li><a href="#institutions" :class="{ active: activeTab === 'institutions' }" @click.prevent="activeTab = 'institutions'">Contributing Institutions</a></li>
          <li><a href="#records" :class="{ active: activeTab === 'records' }" @click.prevent="activeTab = 'records'">Recent Records</a></li>
          <li><a href="#FishAir Images" :class="{ active: activeTab === 'fishair' }" @click.prevent="activeTab = 'fishair'">Fish-AIR Images</a></li>

        </ul>
      </nav>

      <!-- Overview Section -->
<!--      <section v-if="activeTab === 'overview'" id="overview" class="section">-->
<!--        <h2 class="section-title">{{ formatTaxonRank(taxonType) }} Overview</h2>-->

<!--        <div class="summary-cards">-->
<!--          <div class="summary-card">-->
<!--            <div class="summary-number">{{ formatNumber(currentTaxon.recordCount) }}</div>-->
<!--            <div class="summary-label">Total Records</div>-->
<!--          </div>-->
<!--          <div v-if="taxonType === 'family'" class="summary-card">-->
<!--            <div class="summary-number">{{ formatNumber(currentTaxon.generaCount) }}</div>-->
<!--            <div class="summary-label">Genera</div>-->
<!--          </div>-->
<!--          <div v-if="taxonType !== 'species'" class="summary-card">-->
<!--            <div class="summary-number">{{ formatNumber(currentTaxon.speciesCount) }}</div>-->
<!--            <div class="summary-label">Species</div>-->
<!--          </div>-->
<!--          <div class="summary-card">-->
<!--            <div class="summary-number">{{ formatNumber(currentTaxon.institutionsCount) }}</div>-->
<!--            <div class="summary-label">Institutions</div>-->
<!--          </div>-->
<!--          <div class="summary-card">-->
<!--            <div class="summary-number">{{ formatNumber(currentTaxon.countriesCount) }}</div>-->
<!--            <div class="summary-label">Countries</div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="two-column">-->
<!--          <div>-->
<!--            <h3>Global Distribution</h3>-->
<!--            <div class="map-container">-->
<!--              <WorldMap-->
<!--                  v-if="institutionMapData.length > 0"-->
<!--                  :institutions="[]"-->
<!--                  :map-data="institutionMapData"-->
<!--                  :loading="loadingMapData"-->
<!--                  @provider-clicked="onInstitutionClicked"-->
<!--              />-->
<!--              <div v-else class="placeholder-content">-->
<!--                Loading global distribution data...-->
<!--                <br>-->
<!--                <small>Based on <span class="dc-field">decimalLatitude/decimalLongitude</span> fields</small>-->
<!--              </div>-->
<!--            </div>-->
<!--            <p><strong>Basis of Record Distribution:</strong></p>-->
<!--            <div style="display: flex; gap: 10px; margin-top: 10px;">-->
<!--              <span class="basis-of-record basis-preserved">PreservedSpecimen (100%)</span>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div>-->
<!--            <h3>Diversity Metrics</h3>-->
<!--            <div class="chart-container chart-small">-->
<!--              {{ taxonType === 'family' ? 'Genera by Species Count' : 'Species Distribution' }}-->
<!--            </div>-->
<!--            <div style="margin-top: 15px;" v-if="diversityData.length">-->
<!--              <h4>{{ taxonType === 'family' ? 'Most Diverse Genera' : 'Top Species' }}</h4>-->
<!--              <div style="font-size: 14px; line-height: 1.6;">-->
<!--                <div v-for="item in diversityData.slice(0, 4)" :key="item.name" style="display: flex; justify-content: space-between; margin: 5px 0;">-->
<!--                  <span><em>{{ item.name }}</em></span>-->
<!--                  <strong>{{ item.count }} {{ taxonType === 'family' ? 'species' : 'records' }}</strong>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <h3>Geographic Distribution by Region</h3>-->
<!--        <div class="geo-stats">-->
<!--          <div v-for="region in geographicRegions" :key="region.name" class="geo-region">-->
<!--            <div class="geo-region-name">{{ region.name }} ({{ region.percentage }}% of records)</div>-->
<!--            <div class="geo-countries">{{ region.description }}</div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </section>-->

      <!-- Genera & Species Section (for Family) -->
      <section v-if="activeTab === 'genera' && taxonType === 'family'" id="genera" class="section">
        <h2 class="section-title">Genera and Species Diversity</h2>

        <div class="section-controls">
          <input type="text" placeholder="Filter genera by name..." v-model="childrenSearch" class="filter-input" style="flex: 1;">
          <select v-model="childrenSort" class="filter-select">
            <option value="records_desc">Sort by Record Count</option>
            <option value="species_desc">Sort by Species Count</option>
            <option value="name_asc">Sort by Name</option>
          </select>
          <select v-model="diversityFilter" class="filter-select">
            <option value="">All Genera</option>
            <option value="high">High Diversity (>50 species)</option>
            <option value="medium">Medium Diversity (10-50 species)</option>
            <option value="low">Low Diversity (<10 species)</option>
          </select>
        </div>

        <h3>Top Genera by Record Count</h3>
        <div v-if="loadingChildren" class="loading-children">Loading genera...</div>
        <div v-else class="genera-grid">
          <div v-for="genus in filteredChildren" :key="genus.name" class="genus-card" @click="navigateToChild(genus)">
            <div class="genus-header">
              <div class="genus-name">{{ genus.name }}</div>
              <div class="genus-count">{{ formatNumber(genus.recordCount) }}</div>
            </div>
            <div class="genus-stats">
              <span>{{ genus.speciesCount || 0 }} species</span>
              <span>{{ genus.institutionsCount || 0 }} institutions</span>
              <span>{{ genus.countriesCount || 0 }} countries</span>
              <span>{{ genus.geoReferencingQuality || 0 }}% georeferenced</span>
            </div>
          </div>
        </div>

        <h3 style="margin-top: 30px;">Most Recorded Species</h3>
        <div class="top-species-grid">
          <div v-for="(species, index) in topSpecies" :key="species.name" class="species-rank-card" @click="navigateToSpecies(species)">
            <div class="species-rank-header">
              <div class="rank-number">{{ species.rank || index + 1 }}</div>
              <div class="species-name-small">{{ species.name }}</div>
              <div class="species-count-small">{{ formatNumber(species.recordCount) }}</div>
            </div>
            <div class="species-meta">
              {{ species.vernacularName || 'No common name' }} • {{ species.institutionsCount || 0 }} institutions • {{ species.countriesCount || 0 }} countries
            </div>
          </div>
        </div>
      </section>

      <!-- Species Section (for Genus) -->
      <section v-if="activeTab === 'species' && taxonType === 'genus'" id="species" class="section">
        <h2 class="section-title">Species in this Genus</h2>

        <div class="section-controls">
          <input type="text" placeholder="Filter species by name..." v-model="childrenSearch" class="filter-input" style="flex: 1;">
          <select v-model="childrenSort" class="filter-select">
            <option value="records_desc">Sort by Record Count</option>
            <option value="name_asc">Sort by Name</option>
          </select>
        </div>

        <div v-if="loadingChildren" class="loading-children">Loading species...</div>
        <div v-else class="top-species-grid">
          <div v-for="(species, index) in filteredChildren" :key="species.name" class="species-rank-card" @click="navigateToChild(species)">
            <div class="species-rank-header">
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="species-name-small">{{ species.name }}</div>
              <div class="species-count-small">{{ formatNumber(species.recordCount) }}</div>
            </div>
            <div class="species-meta">
              {{ species.vernacularName || 'No common name' }} • {{ species.institutionsCount || 0 }} institutions • {{ species.countriesCount || 0 }} countries
            </div>
          </div>
        </div>
      </section>

      <!-- Geographic Distribution Section -->
      <section v-if="activeTab === 'distribution'" id="distribution" class="section">
        <h2 class="section-title">Geographic Distribution</h2>

        <div class="section-controls">
          <select class="filter-select">
            <option>All {{ taxonType === 'family' ? 'Genera' : 'Records' }}</option>
            <option v-if="taxonType === 'family'">Top 10 Genera</option>
            <option>Native Distributions Only</option>
            <option>Introduced Species Only</option>
          </select>
          <select class="filter-select">
            <option>All Time Periods</option>
            <option>Last 20 Years</option>
            <option>Historical (pre-2000)</option>
          </select>
        </div>

        <div class="two-column">
          <div>
            <div class="map-container">
              <WorldMap
                  v-if="institutionMapData.length > 0"
                  :institutions="[]"
                  :map-data="institutionMapData"
                  :loading="loadingMapData"
                  @provider-clicked="onInstitutionClicked"
              />
              <div v-else class="placeholder-content">
                Loading global distribution data...
                <br>
                <small>{{ formatNumber(currentTaxon.recordCount) }} records from {{ currentTaxon.countriesCount }} countries</small>
              </div>
            </div>
          </div>
          <div>
            <h3>Continental Distribution</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div v-for="continent in continentalDistribution" :key="continent.name" style="display: flex; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 4px;">
                <span><strong>{{ continent.name }}</strong></span>
                <span>{{ formatNumber(continent.records) }} records ({{ continent.percentage }}%)</span>
              </div>
            </div>

            <h3 style="margin-top: 25px;">Data Quality by Region</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div v-for="region in dataQualityByRegion" :key="region.name">
                <strong>{{ region.name }}:</strong> {{ region.georeferenced }}% georeferenced, {{ region.dated }}% with eventDate
              </div>
              <div style="margin-top: 10px; color: #666; font-size: 12px;">
                Based on <span class="dc-field">decimalLatitude/decimalLongitude</span> and <span class="dc-field">eventDate</span> completeness
              </div>
            </div>
          </div>
        </div>

        <h3>Biodiversity Hotspots</h3>
        <div class="four-column">
          <div v-for="hotspot in biodiversityHotspots" :key="hotspot.name" style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db;">
            <div style="font-weight: bold; margin-bottom: 8px;">{{ hotspot.name }}</div>
            <div style="font-size: 13px; color: #666; line-height: 1.4;">
              <strong>{{ formatNumber(hotspot.records) }} records</strong> • {{ hotspot.species }} species<br>
              {{ hotspot.description || 'Major biodiversity center' }}
            </div>
          </div>
        </div>
      </section>

      <!-- Temporal Patterns Section -->
      <section v-if="activeTab === 'temporal'" id="temporal" class="section">
        <h2 class="section-title">Temporal Collection Patterns</h2>

        <div class="section-controls">
          <select class="filter-select">
            <option>All Records</option>
            <option>PreservedSpecimen only</option>
            <option>HumanObservation only</option>
          </select>
          <select class="filter-select">
            <option>By Year</option>
            <option>By Decade</option>
            <option>By Month</option>
          </select>
          <select v-if="taxonType === 'family'" class="filter-select">
            <option>All Genera</option>
            <option>Top 10 Genera</option>
            <option>By Genus</option>
          </select>
        </div>

        <div class="chart-container">
          <TimelineChart
              v-if="timelineData.length > 0"
              :data="timelineData"
              :title="`${formatTaxonRank(taxonType)} ${taxonName} Collection Timeline`"
              :subtitle="`Based on eventDate field (${temporalCoverage}% coverage)`"
              @year-selected="onYearSelected"
              @period-selected="onPeriodSelected"
          />
          <div v-else class="placeholder-content">
            Loading temporal patterns...
            <br>
            <small>Based on <span class="dc-field">eventDate</span> field (87% coverage)</small>
          </div>
        </div>

        <div class="three-column" style="margin-top: 20px;">
          <div>
            <h3>Historical Periods</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div v-for="period in historicalPeriods" :key="period.name">
                <strong>{{ period.name }}:</strong> {{ formatNumber(period.records) }} records ({{ period.percentage }}%)
              </div>
              <div style="margin-top: 10px; color: #666; font-size: 12px;">
                Based on records with valid <span class="dc-field">eventDate</span>
              </div>
            </div>
          </div>
          <div>
            <h3>Seasonal Collection Patterns</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div v-for="season in seasonalPatterns" :key="season.name">
                <strong>{{ season.name }}:</strong> {{ formatNumber(season.records) }} records
              </div>
              <div style="margin-top: 10px; color: #666; font-size: 12px;">
                Peak activity in summer months
              </div>
            </div>
          </div>
          <div>
            <h3>Recent Collection Activity</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div v-for="year in recentActivity" :key="year.year">
                <strong>{{ year.year }}:</strong> {{ formatNumber(year.records) }} records
              </div>
              <div style="margin-top: 10px; color: #666; font-size: 12px;">
                Consistent annual collection effort
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contributing Institutions Section -->
      <section v-if="activeTab === 'institutions'" id="institutions" class="section">
        <h2 class="section-title">Contributing Institutions</h2>

        <div class="section-controls">
          <input type="text" placeholder="Filter institutions..." v-model="institutionSearch" class="filter-input" style="flex: 1;">
          <select v-model="institutionTypeFilter" class="filter-select">
            <option value="">All Institution Types</option>
            <option value="museum">Museums</option>
            <option value="university">Universities</option>
            <option value="government">Government Agencies</option>
          </select>
          <select v-model="institutionSort" class="filter-select">
            <option value="records_desc">Sort by Records</option>
            <option value="species_desc">Sort by Species</option>
            <option value="name_asc">Sort by Name</option>
          </select>
        </div>

        <div class="institutions-grid">
          <div v-for="institution in filteredInstitutions" :key="institution.code" class="institution-card" @click="navigateToInstitution(institution)">
            <div class="institution-header">
              <div class="institution-code">{{ institution.code }}</div>
              <div class="institution-name">{{ institution.name }}</div>
            </div>
            <div class="institution-stats">
              <strong>{{ formatNumber(institution.recordCount) }} records</strong> ({{ institution.percentage }}% of {{ taxonType }} total)<br>
              <span class="dc-field">collectionCode:</span> {{ institution.collectionCodes?.join(', ') || 'N/A' }}<br>
              {{ institution.speciesCount || 0 }} species • {{ institution.generaCount || 0 }} genera • Latest: {{ institution.latestRecord || 'N/A' }}
            </div>
          </div>
        </div>

        <h3 style="margin-top: 30px;">Institution Coverage Analysis</h3>
        <div class="three-column">
          <div>
            <h4>Geographic Coverage</h4>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>Global coverage:</strong> {{ geographicCoverageData.globalCoverage }} institutions</div>
              <div><strong>Regional specialists:</strong> {{ geographicCoverageData.regionalSpecialists }} institutions</div>
              <div><strong>Local collections:</strong> {{ geographicCoverageData.localCollections }} institutions</div>
              <div style="margin-top: 10px; color: #666;">
                Based on specimen <span class="dc-field">country</span> diversity
              </div>
            </div>
          </div>
          <div>
            <h4>Taxonomic Specialization</h4>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>{{ formatTaxonRank(taxonType) }} specialists:</strong> {{ taxonomicSpecializationData.familySpecialists }} institutions</div>
              <div><strong>Genus specialists:</strong> {{ taxonomicSpecializationData.genusSpecialists }} institutions</div>
              <div><strong>Regional fauna focus:</strong> {{ taxonomicSpecializationData.regionalFaunaFocus }} institutions</div>
              <div style="margin-top: 10px; color: #666;">
                Based on taxonomic depth and coverage
              </div>
            </div>
          </div>
          <div>
            <h4>Data Quality Leaders</h4>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>High quality (>95%):</strong> {{ dataQualityLeadersData.highQuality }} institutions</div>
              <div><strong>Good quality (85-95%):</strong> {{ dataQualityLeadersData.goodQuality }} institutions</div>
              <div><strong>Improving quality:</strong> {{ dataQualityLeadersData.improvingQuality }} institutions</div>
              <div style="margin-top: 10px; color: #666;">
                Based on DwC field completeness
              </div>
            </div>
          </div>
        </div>

<!--        &lt;!&ndash; 可选：添加更多详细分析 &ndash;&gt;-->
<!--        <h3 style="margin-top: 30px;">Additional Institution Insights</h3>-->
<!--        <div class="four-column">-->
<!--          <div>-->
<!--            <h4>Collection Scale</h4>-->
<!--            <div style="font-size: 14px; line-height: 1.6;">-->
<!--              <div><strong>Major (>10K):</strong> {{ collectionScaleData.majorCollections }}</div>-->
<!--              <div><strong>Substantial (1-10K):</strong> {{ collectionScaleData.substantialCollections }}</div>-->
<!--              <div><strong>Moderate (100-999):</strong> {{ collectionScaleData.moderateCollections }}</div>-->
<!--              <div><strong>Small (<100):</strong> {{ collectionScaleData.smallCollections }}</div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div>-->
<!--            <h4>Institution Types</h4>-->
<!--            <div style="font-size: 14px; line-height: 1.6;">-->
<!--              <div v-for="(data, type) in institutionTypesData" :key="type">-->
<!--                <strong>{{ type.charAt(0).toUpperCase() + type.slice(1) }}:</strong> {{ data.count }}-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div>-->
<!--            <h4>Temporal Activity</h4>-->
<!--            <div style="font-size: 14px; line-height: 1.6;">-->
<!--              <div><strong>Recently active:</strong> {{ temporalActivityData.recentlyActive }}</div>-->
<!--              <div><strong>Historically active:</strong> {{ temporalActivityData.historicallyActive }}</div>-->
<!--              <div><strong>Inactive:</strong> {{ temporalActivityData.inactive }}</div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div>-->
<!--            <h4>Quality Metrics</h4>-->
<!--            <div style="font-size: 14px; line-height: 1.6;">-->
<!--              <div><strong>Avg Quality:</strong> {{ dataQualityLeadersData.averageQuality || 0 }}%</div>-->
<!--              <div><strong>Total Records:</strong> {{ formatNumber(collectionScaleData.totalRecords) }}</div>-->
<!--              <div><strong>Contributing:</strong> {{ geographicCoverageData.totalInstitutions || institutionData.length }}</div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
      </section>

      <!-- Recent Records Section -->
      <section v-if="activeTab === 'records'" id="records" class="section">
        <h2 class="section-title">Recent {{ formatTaxonRank(taxonType) }} Records</h2>

        <div class="section-controls">
          <input type="text" placeholder="Filter by scientificName, locality, or catalogNumber..." v-model="recordSearch" class="filter-input" style="flex: 1;">
          <select v-if="taxonType === 'family'" v-model="recordGenusFilter" class="filter-select">
            <option value="">All Genera</option>
            <option v-for="genus in availableGenera" :key="genus" :value="genus">{{ genus }}</option>
          </select>
          <select v-model="recordTimeFilter" class="filter-select">
            <option value="30">Last 30 Days</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        <table class="records-table">
          <thead>
          <tr>
            <th><span class="dc-field">catalogNumber</span></th>
            <th><span class="dc-field">scientificName</span></th>
            <th><span class="dc-field">institutionCode</span></th>
            <th><span class="dc-field">locality</span></th>
            <th><span class="dc-field">eventDate</span></th>
            <th><span class="dc-field">basisOfRecord</span></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="record in filteredRecentRecords" :key="record.catalogNumber" @click="viewRecordDetail(record)">
            <td>{{ record.catalogNumber }}</td>
            <td><em>{{ record.scientificName }}</em></td>
            <td>{{ record.institutionCode }}</td>
            <td>{{ record.locality }}</td>
            <td>{{ record.eventDate }}</td>
            <td>
                <span class="basis-of-record" :class="getBasisClass(record.basisOfRecord)">
                  {{ record.basisOfRecord }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaxonomy } from '@/composables/useTaxonomy.js'
import WorldMap from '@/components/charts/WorldMap.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'

// Props
const props = defineProps({
  taxonType: {
    type: String,
    required: true,
    validator: value => ['family', 'genus', 'species'].includes(value)
  },
  taxonName: {
    type: String,
    required: true
  }
})

const router = useRouter()

// Composables
const {
  loading,
  error,
  currentTaxon,
  hierarchy,
  diversityData,
  geographicData,
  temporalData,
  institutionData,
  topSpecies,
  institutionCoverage,
  loadTaxonFullData,
  fetchTaxonChildren,
  fetchTaxonInstitutions,
  fetchTaxonRecords,
} = useTaxonomy()

// Local state
// const activeTab = ref('overview')
const activeTab = ref('distribution')
const loadingChildren = ref(false)
const children = ref([])
const childrenSearch = ref('')
const childrenSort = ref('records_desc')
const diversityFilter = ref('')
const institutionSearch = ref('')
const institutionTypeFilter = ref('')
const institutionSort = ref('records_desc')
const recordSearch = ref('')
const recordGenusFilter = ref('')
const recordTimeFilter = ref('30')

// Recent records state
const recentRecords = ref([])

// Map and timeline specific state
const loadingMapData = ref(false)
const institutionMapData = ref([])
const timelineData = ref([])
const detailedTimelineData = ref([])

// Institution coverage computed properties
const geographicCoverageData = computed(() => {
  return institutionCoverage.value.geographicCoverage || {
    globalCoverage: 0,
    regionalSpecialists: 0,
    localCollections: 0
  }
})

const taxonomicSpecializationData = computed(() => {
  return institutionCoverage.value.taxonomicSpecialization || {
    familySpecialists: 0,
    genusSpecialists: 0,
    regionalFaunaFocus: 0
  }
})

const dataQualityLeadersData = computed(() => {
  return institutionCoverage.value.dataQualityLeaders || {
    highQuality: 0,
    goodQuality: 0,
    improvingQuality: 0
  }
})

const collectionScaleData = computed(() => {
  return institutionCoverage.value.collectionScale || {
    majorCollections: 0,
    substantialCollections: 0,
    moderateCollections: 0,
    smallCollections: 0
  }
})

const institutionTypesData = computed(() => {
  return institutionCoverage.value.institutionTypes || {}
})

const temporalActivityData = computed(() => {
  return institutionCoverage.value.temporalActivity || {
    recentlyActive: 0,
    historicallyActive: 0,
    inactive: 0
  }
})

// Geographic data computed properties
const geographicRegions = computed(() => {
  if (!geographicData.value.continentalDistribution) return []

  return geographicData.value.continentalDistribution.map(continent => ({
    name: continent.name,
    percentage: Math.round(continent.percentage),
    description: `${formatNumber(continent.records)} records from this region`
  }))
})

const continentalDistribution = computed(() => {
  return geographicData.value.continentalDistribution || []
})

const dataQualityByRegion = computed(() => {
  return geographicData.value.countryDistribution?.slice(0, 4).map(country => ({
    name: country.name,
    georeferenced: Math.round(country.dataQuality || 0),
    dated: Math.round((country.dataQuality || 0) * 0.9) // 估算
  })) || []
})

const biodiversityHotspots = computed(() => {
  return geographicData.value.biodiversityHotspots || []
})

// Temporal data computed properties
const historicalPeriods = computed(() => {
  return temporalData.value.historicalPeriods || []
})

const seasonalPatterns = computed(() => {
  return temporalData.value.seasonalPatterns || []
})

const recentActivity = computed(() => {
  return temporalData.value.recentActivity || []
})

const temporalCoverage = computed(() => {
  return temporalData.value.dataCoverage?.dateCoverage || 87
})

const institutions = computed(() => {
  return institutionData.value || []
})

// Computed properties for filtered data
const filteredChildren = computed(() => {
  let filtered = children.value

  // Apply search filter
  if (childrenSearch.value) {
    const search = childrenSearch.value.toLowerCase()
    filtered = filtered.filter(child =>
        child.name.toLowerCase().includes(search) ||
        (child.vernacularName && child.vernacularName.toLowerCase().includes(search))
    )
  }

  // Apply diversity filter for family page
  if (props.taxonType === 'family' && diversityFilter.value) {
    filtered = filtered.filter(child => {
      const speciesCount = child.speciesCount || 0
      switch (diversityFilter.value) {
        case 'high': return speciesCount > 50
        case 'medium': return speciesCount >= 10 && speciesCount <= 50
        case 'low': return speciesCount < 10
        default: return true
      }
    })
  }

  return filtered.slice(0, 20) // Limit to 20 items for display
})

const filteredInstitutions = computed(() => {
  let filtered = institutions.value

  // Apply search filter
  if (institutionSearch.value) {
    const search = institutionSearch.value.toLowerCase()
    filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(search) ||
        institution.code.toLowerCase().includes(search)
    )
  }

  return filtered
})

const filteredRecentRecords = computed(() => {
  let filtered = recentRecords.value

  // Apply search filter
  if (recordSearch.value) {
    const search = recordSearch.value.toLowerCase()
    filtered = filtered.filter(record =>
        record.scientificName.toLowerCase().includes(search) ||
        record.locality.toLowerCase().includes(search) ||
        record.catalogNumber.toString().toLowerCase().includes(search)
    )
  }

  // Apply genus filter for family pages
  if (props.taxonType === 'family' && recordGenusFilter.value) {
    filtered = filtered.filter(record => {
      const genus = record.scientificName.split(' ')[0]
      return genus === recordGenusFilter.value
    })
  }

  return filtered
})

const availableGenera = computed(() => {
  const genera = new Set()
  recentRecords.value.forEach(record => {
    const genus = record.scientificName.split(' ')[0]
    genera.add(genus)
  })
  return Array.from(genera).sort()
})

// Map data transformation
const transformInstitutionsToMapData = (institutions) => {
  return institutions.map(inst => ({
    institutionCode: inst.code,
    institutionName: inst.name,
    lat: generateCoordinatesForCountry(inst.country).lat,
    lng: generateCoordinatesForCountry(inst.country).lng,
    recordCount: inst.recordCount || 0,
    country: inst.country || 'Unknown'
  })).filter(item => item.lat !== null && item.lng !== null)
}

// Simple coordinate generation for countries (you can replace with real geocoding data)
const generateCoordinatesForCountry = (country) => {
  const countryCoords = {
    'United States': { lat: 39.8283, lng: -98.5795 },
    'USA': { lat: 39.8283, lng: -98.5795 },
    'US': { lat: 39.8283, lng: -98.5795 },
    'United Kingdom': { lat: 55.3781, lng: -3.4360 },
    'UK': { lat: 55.3781, lng: -3.4360 },
    'Canada': { lat: 56.1304, lng: -106.3468 },
    'Australia': { lat: -25.2744, lng: 133.7751 },
    'Germany': { lat: 51.1657, lng: 10.4515 },
    'France': { lat: 46.2276, lng: 2.2137 },
    'Japan': { lat: 36.2048, lng: 138.2529 },
    'Brazil': { lat: -14.2350, lng: -51.9253 },
    'China': { lat: 35.8617, lng: 104.1954 },
    'Russia': { lat: 61.5240, lng: 105.3188 },
    'India': { lat: 20.5937, lng: 78.9629 },
    'Mexico': { lat: 23.6345, lng: -102.5528 },
    'Argentina': { lat: -38.4161, lng: -63.6167 },
    'Spain': { lat: 40.4637, lng: -3.7492 },
    'Italy': { lat: 41.8719, lng: 12.5674 },
    'Sweden': { lat: 60.1282, lng: 18.6435 },
    'Norway': { lat: 60.4720, lng: 8.4689 },
    'South Africa': { lat: -30.5595, lng: 22.9375 }
  }

  return countryCoords[country] || { lat: null, lng: null }
}

// Timeline data transformation
const transformTemporalToTimelineData = (temporalData) => {
  if (!temporalData.yearlyTrend) return []

  return temporalData.yearlyTrend.map(item => ({
    year: item.year,
    records: item.records
  })).sort((a, b) => a.year - b.year)
}

// Methods
const loadTaxonData = async () => {
  try {
    // 使用综合加载方法
    await loadTaxonFullData(props.taxonType, props.taxonName)

    // 加载子级数据
    if (props.taxonType === 'family' || props.taxonType === 'genus') {
      await loadChildren()
    }

    // 加载最新记录
    await loadRecentRecords()

    // 加载并转换地图数据
    await loadMapData()

    // 加载并转换时间线数据
    await loadTimelineData()

  } catch (err) {
    console.error('Failed to load taxon data:', err)
  }
}

const loadChildren = async () => {
  loadingChildren.value = true
  try {
    const response = await fetchTaxonChildren(props.taxonType, props.taxonName, {
      page: 1,
      per_page: 20,
      search: childrenSearch.value,
      sort_by: childrenSort.value
    })
    children.value = response.data || []
  } catch (err) {
    console.error('Failed to load children:', err)
    children.value = []
  } finally {
    loadingChildren.value = false
  }
}

const loadRecentRecords = async () => {
  try {
    const response = await fetchTaxonRecords(props.taxonType, props.taxonName, {
      page: 1,
      per_page: 10,
      sort_by: 'date_desc'
    })
    recentRecords.value = response || []
  } catch (err) {
    console.error('Failed to load recent records:', err)
    recentRecords.value = []
  }
}

const loadMapData = async () => {
  loadingMapData.value = true
  try {
    if (institutions.value.length > 0) {
      institutionMapData.value = transformInstitutionsToMapData(institutions.value)
    }
  } catch (err) {
    console.error('Failed to load map data:', err)
    institutionMapData.value = []
  } finally {
    loadingMapData.value = false
  }
}

const loadTimelineData = async () => {
  try {
    if (temporalData.value.yearlyTrend) {
      timelineData.value = transformTemporalToTimelineData(temporalData.value)

      // For detailed timeline, we could use the same data or create a subset
      detailedTimelineData.value = timelineData.value.filter(item => item.year >= 2000)
    }
  } catch (err) {
    console.error('Failed to load timeline data:', err)
    timelineData.value = []
    detailedTimelineData.value = []
  }
}

const loadMoreInstitutions = async () => {
  try {
    const response = await fetchTaxonInstitutions(props.taxonType, props.taxonName, {
      page: 1,
      per_page: 50,
      search: institutionSearch.value,
      sort_by: institutionSort.value
    })
    // 更新 institutionData 在 composable 中已经处理

    // 重新加载地图数据
    await loadMapData()
  } catch (err) {
    console.error('Failed to load institutions:', err)
  }
}

// Navigation methods
const navigateToChild = (child) => {
  if (props.taxonType === 'family') {
    router.push({
      name: 'GenusDetail',
      params: { genusName: child.name }
    })
  } else {
    router.push({
      name: 'SpeciesDetail',
      params: { scientificName: encodeURIComponent(child.name) }
    })
  }
}

const navigateToSpecies = (species) => {
  router.push({
    name: 'SpeciesDetail',
    params: { scientificName: encodeURIComponent(species.name) }
  })
}

const navigateToInstitution = (institution) => {
  router.push({
    name: 'InstitutionDetail',
    params: { institutionCode: institution.code }
  })
}

const viewRecordDetail = (record) => {
  router.push({
    name: 'RecordDetail',
    params: { catalogNumber: record.catalogNumber }
  })
}

// Map and timeline event handlers
const onInstitutionClicked = (institution) => {
  console.log('Institution clicked:', institution)
  navigateToInstitution({ code: institution.institutionCode })
}

const onYearSelected = (year) => {
  console.log('Year selected:', year)
  // You can implement year-specific filtering here
}

const onPeriodSelected = (period) => {
  console.log('Period selected:', period)
  // You can implement period-specific filtering here
}

// Utility functions
const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const formatTaxonRank = (rank, plural = false) => {
  const formatted = rank.charAt(0).toUpperCase() + rank.slice(1)
  if (plural) {
    return formatted === 'Family' ? 'Families' :
        formatted === 'Genus' ? 'Genera' :
            formatted === 'Species' ? 'Species' : formatted + 's'
  }
  return formatted
}

const formatCommonNames = (names) => {
  if (!names) return 'No common names'
  if (Array.isArray(names)) {
    return names.join(', ')
  }
  return names
}

const getBasisClass = (basis) => {
  switch (basis) {
    case 'PreservedSpecimen': return 'basis-preserved'
    case 'HumanObservation': return 'basis-observation'
    case 'FossilSpecimen': return 'basis-fossil'
    default: return 'basis-preserved'
  }
}

// Action methods
const exportTaxonData = () => {
  alert(`Preparing Darwin Core Archive for ${formatTaxonRank(props.taxonType)} ${props.taxonName}...\n\nIncluded:\n- All ${formatNumber(currentTaxon.value?.recordCount)} occurrence records\n- Complete taxonomic hierarchy\n- Geographic and temporal data\n- Institution and collection metadata`)
}

const compareTaxa = () => {
  alert(`Opening ${formatTaxonRank(props.taxonType).toLowerCase()} comparison tool...\n\nCompare ${props.taxonName} with:\n- Other ${formatTaxonRank(props.taxonType, true).toLowerCase()}\n- Species diversity metrics\n- Geographic distribution patterns\n- Collection effort over time`)
}

const generateReport = () => {
  alert(`Generating comprehensive ${formatTaxonRank(props.taxonType).toLowerCase()} report...\n\nReport will include:\n- Taxonomic diversity analysis\n- Geographic distribution maps\n- Temporal collection trends\n- Data quality assessment\n- Institution contribution summary`)
}

// Watch for changes and reload data
watch(() => childrenSearch.value, () => {
  if (props.taxonType === 'family' || props.taxonType === 'genus') {
    loadChildren()
  }
})

watch(() => childrenSort.value, () => {
  if (props.taxonType === 'family' || props.taxonType === 'genus') {
    loadChildren()
  }
})

watch(() => institutionSearch.value, () => {
  loadMoreInstitutions()
})

watch(() => institutionSort.value, () => {
  loadMoreInstitutions()
})

// Watch for institution data changes to update map
watch(() => institutionData.value, () => {
  loadMapData()
}, { deep: true })

// Watch for temporal data changes to update timeline
watch(() => temporalData.value, () => {
  loadTimelineData()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadTaxonData()
})

// Watch for route changes
watch(() => [props.taxonType, props.taxonName], () => {
  loadTaxonData()
}, { immediate: false })
</script>

<style scoped>
/* Base styles - matching the HTML design */
.taxon-page {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #3498db;
  text-decoration: none;
}

/* Family header */
.family-header {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 25px;
  margin-bottom: 20px;
}

.family-title {
  display: flex;
  align-items: baseline;
  margin-bottom: 15px;
}

.family-name {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  margin-right: 15px;
}

.taxon-rank {
  font-size: 16px;
  color: #666;
  background: #e8f4fd;
  padding: 4px 12px;
  border-radius: 12px;
}

.darwin-core-taxonomy {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.dc-field-group {
  min-width: 120px;
}

.dc-label {
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dc-value {
  font-size: 15px;
  line-height: 1.4;
}

.family-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.family-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-button.download { background: #e8f5e9; color: #2e7d32; }
.action-button.compare { background: #fff3e0; color: #f57c00; }
.action-button.export { background: #e8f4fd; color: #0288d1; }

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.action-icon { margin-right: 5px; }

/* Navigation tabs */
.nav-tabs {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 20px;
  padding: 0;
  position: sticky;
  top: 20px;
  z-index: 100;
}

.nav-tabs ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e0e0e0;
}

.nav-tabs li {
  flex: 1;
}

.nav-tabs a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-align: center;
  font-weight: 500;
}

.nav-tabs a:hover, .nav-tabs a.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

/* Section styles */
.section {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  padding: 25px;
  margin-bottom: 20px;
  scroll-margin-top: 100px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

/* Grid layouts */
.two-column {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.four-column {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Map and charts */
.map-container, .chart-container {
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  margin-bottom: 15px;
  flex-direction: column;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.chart-container {
  height: 500px;
}

.chart-small {
  height: 200px;
}

/* Placeholder content for loading states */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* Summary cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
}

.summary-number {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Genera grid */
.genera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.genus-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.genus-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.genus-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.genus-name {
  font-weight: bold;
  font-style: italic;
  font-size: 18px;
  color: #2c3e50;
}

.genus-count {
  background: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.genus-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #777;
  margin-top: 8px;
}

/* Top species */
.top-species-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.species-rank-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.species-rank-card:hover {
  background-color: #e9ecef;
}

.species-rank-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rank-number {
  background: #3498db;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
  font-size: 12px;
}

.species-name-small {
  font-weight: bold;
  font-style: italic;
  color: #2c3e50;
  flex: 1;
}

.species-count-small {
  font-weight: bold;
  color: #3498db;
  font-size: 14px;
}

.species-meta {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* Geographic distribution */
.geo-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.geo-region {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
}

.geo-region-name {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.geo-countries {
  font-size: 13px;
  line-height: 1.5;
  color: #666;
}

/* Section controls */
.section-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.loading-children {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Institutions grid */
.institutions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.institution-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.institution-card:hover {
  background-color: #e9ecef;
}

.institution-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.institution-code {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  margin-right: 12px;
  font-size: 12px;
}

.institution-name {
  font-weight: bold;
  flex: 1;
  color: #2c3e50;
}

.institution-stats {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Records table */
.records-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 15px;
}

.records-table th, .records-table td {
  border-bottom: 1px solid #eee;
  padding: 10px;
  text-align: left;
}

.records-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #555;
  position: sticky;
  top: 0;
}

.records-table tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.dc-field {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}

/* Basis of record styling */
.basis-of-record {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.basis-preserved { background: #e3f2fd; color: #1976d2; }
.basis-observation { background: #f3e5f5; color: #7b1fa2; }
.basis-fossil { background: #fff3e0; color: #f57c00; }

/* Responsive */
@media (max-width: 1024px) {
  .darwin-core-taxonomy {
    grid-template-columns: repeat(3, 1fr);
  }

  .family-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .family-actions {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .family-name {
    font-size: 28px;
  }

  .darwin-core-taxonomy {
    grid-template-columns: repeat(2, 1fr);
  }

  .family-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-column, .three-column, .four-column {
    grid-template-columns: 1fr;
  }

  .nav-tabs ul {
    flex-wrap: wrap;
  }

  .section {
    padding: 20px;
  }

  .section-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input {
    width: 100%;
  }

  .genera-grid, .top-species-grid, .institutions-grid {
    grid-template-columns: 1fr;
  }

  .geo-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .family-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .darwin-core-taxonomy {
    grid-template-columns: 1fr;
  }

  .family-stats {
    grid-template-columns: 1fr;
  }

  .nav-tabs a {
    padding: 12px 8px;
    font-size: 12px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-container, .map-container {
    height: 250px;
  }

  .records-table {
    font-size: 12px;
  }

  .records-table th, .records-table td {
    padding: 6px;
  }
}
</style>