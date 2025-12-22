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
          <h1 class="family-name" :class="{ 'italic-name': taxonType === 'species' }">{{ currentTaxon.scientificName || taxonName }}</h1>
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
            <div class="dc-label">scientificName</div>
            <div class="dc-value" :class="{ 'italic-name': taxonType === 'species' }">{{ currentTaxon.scientificName || taxonName }}</div>
          </div>
          <div class="dc-field-group">
            <div class="dc-label">vernacularName</div>
            <div class="dc-value">{{ formatCommonNames(currentTaxon.vernacularName) }}</div>
          </div>
        </div>

        <!-- <div class="family-stats">
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
        </div> -->

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

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <ul>
          <li><a @click.prevent="scrollToSection('overview')">Overview</a></li>
          <li v-if="taxonType === 'family'"><a @click.prevent="scrollToSection('genera')">Genera & Species</a></li>
          <li v-else-if="taxonType === 'genus'"><a @click.prevent="scrollToSection('species')">Species</a></li>
          <li><a @click.prevent="scrollToSection('distribution')">Geographic Distribution</a></li>
          <li><a @click.prevent="scrollToSection('temporal')">Temporal Patterns</a></li>
          <li><a @click.prevent="scrollToSection('institutions')">Contributing Institutions</a></li>
          <li><a @click.prevent="scrollToSection('fishair')">Fish-AIR Images</a></li>
        </ul>
      </nav>

      <!-- Overview Section -->
      <section id="overview" class="section">
        <h2 class="section-title">{{ formatTaxonRank(taxonType) }} Overview</h2>

        <!-- Key Statistics Cards -->
        <div class="overview-stats-grid">
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(currentTaxon.recordCount) }}</div>
              <div class="stat-label">Total Specimens</div>
              <div class="stat-context">Preserved in global collections</div>
            </div>
          </div>
          <div class="overview-stat-card" v-if="taxonType === 'family'">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(currentTaxon.generaCount) }}</div>
              <div class="stat-label">Genera</div>
              <div class="stat-context">{{ currentTaxon.speciesCount }} species total</div>
            </div>
          </div>
          <div class="overview-stat-card" v-else-if="taxonType === 'genus'">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(currentTaxon.speciesCount) }}</div>
              <div class="stat-label">Species</div>
              <div class="stat-context">In this genus</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(currentTaxon.institutionsCount) }}</div>
              <div class="stat-label">Institutions</div>
              <div class="stat-context">Contributing collections</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(currentTaxon.countriesCount) }}</div>
              <div class="stat-label">Countries</div>
              <div class="stat-context">Global distribution</div>
            </div>
          </div>
          <div class="overview-stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ currentTaxon.geoReferencingQuality || 0 }}%</div>
              <div class="stat-label">Georeferenced</div>
              <div class="stat-context">Location accuracy</div>
            </div>
          </div>
        </div>

        <!-- Main Overview Content -->
        <div class="overview-main-content">
          <div class="overview-left">
            <div class="overview-summary-card">
              <h3>{{ formatTaxonRank(taxonType) }} Summary</h3>
              <div class="summary-text">
                <p v-if="taxonType === 'family'">
                  <strong>{{ taxonName }}</strong> is a fish family with <strong>{{ currentTaxon.generaCount }}</strong> 
                  genera and <strong>{{ currentTaxon.speciesCount }}</strong> known species. This family is represented 
                  by <strong>{{ formatNumber(currentTaxon.recordCount) }}</strong> specimens in natural history collections 
                  worldwide, making it {{ getCollectionIntensity() }} documented family in ichthyological research.
                </p>
                <p v-else-if="taxonType === 'genus'">
                  <strong>{{ taxonName }}</strong> is a fish genus comprising <strong>{{ currentTaxon.speciesCount }}</strong> 
                  known species. With <strong>{{ formatNumber(currentTaxon.recordCount) }}</strong> specimens preserved 
                  in collections across <strong>{{ currentTaxon.countriesCount }}</strong> countries, this genus 
                  represents {{ getCollectionIntensity() }} studied group.
                </p>
                <p v-else>
                  <strong>{{ taxonName }}</strong> is represented by <strong>{{ formatNumber(currentTaxon.recordCount) }}</strong> 
                  specimens in natural history collections, collected from <strong>{{ currentTaxon.countriesCount }}</strong> 
                  countries by <strong>{{ currentTaxon.institutionsCount }}</strong> institutions.
                </p>
                
                <div class="data-quality-summary">
                  <h4>Collection Data Quality</h4>
                  <div class="quality-metrics">
                    <div class="quality-item">
                      <span class="quality-label">Geographic precision:</span>
                      <span class="quality-value {{ getQualityClass(currentTaxon.geoReferencingQuality) }}">
                        {{ getQualityText(currentTaxon.geoReferencingQuality) }}
                      </span>
                    </div>
                    <div class="quality-item">
                      <span class="quality-label">Temporal coverage:</span>
                      <span class="quality-value">{{ getTemporalCoverage() }}</span>
                    </div>
                    <div class="quality-item">
                      <span class="quality-label">Taxonomic status:</span>
                      <span class="quality-value">{{ currentTaxon.taxonomicstatus || 'Active' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="basis-of-record-card">
              <h4>Specimen Types</h4>
              <div class="basis-distribution">
                <div class="basis-item">
                  <span class="basis-of-record basis-preserved">PreservedSpecimen</span>
                  <span class="basis-percentage">~100%</span>
                </div>
                <div class="basis-note">
                  Most ichthyological specimens are preserved specimens in museum collections, 
                  providing long-term research value and verification capability.
                </div>
              </div>
            </div>
          </div>

          <div class="overview-right">
            <div class="map-card">
              <h3>Global Distribution Heatmap</h3>
              <div class="range-map-container">
                <CompactHeatMap
                    :data="heatMapData"
                    :height="200"
                />
              </div>
              <div class="map-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background: #08519c;"></div>
                  <span>High density</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #3182bd;"></div>
                  <span>Medium density</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #9ecae1;"></div>
                  <span>Low density</span>
                </div>
              </div>
            </div>

            <div class="quick-facts-card">
              <h4>Quick Facts</h4>
              <div class="quick-facts-list">
                <div class="fact-item">
                  <span class="fact-label">Most common in:</span>
                  <span class="fact-value">{{ getMostCommonRegion() }}</span>
                </div>
                <div class="fact-item">
                  <span class="fact-label">Collection peak:</span>
                  <span class="fact-value">{{ getCollectionPeak() }}</span>
                </div>
                <div class="fact-item">
                  <span class="fact-label">Primary contributors:</span>
                  <span class="fact-value">{{ getPrimaryContributors() }}</span>
                </div>
                <div class="fact-item" v-if="taxonType === 'family'">
                  <span class="fact-label">Most diverse genus:</span>
                  <span class="fact-value">{{ getMostDiverseGenus() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Genera & Species Section (for Family) -->
      <section v-if="taxonType === 'family'" id="genera" class="section">
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
      <section v-if="taxonType === 'genus'" id="species" class="section">
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
      <section id="distribution" class="section">
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

        <!-- Global Distribution - Full Width -->
        <h3>Global Distribution</h3>
        <div class="full-width-map-container">
          <WorldMap
              :mapData="coordinatePoints"
              :loading="false"
          />
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
      <section id="temporal" class="section">
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
              :data="timelineData"
              :title="`${formatTaxonRank(taxonType)} ${taxonName} Collection Timeline`"
              :subtitle="`Based on eventDate field (${temporalCoverage}% coverage)`"
              @year-selected="onYearSelected"
              @period-selected="onPeriodSelected"
          />
          <div v-if="timelineData.length === 0" class="placeholder-content">
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
      <section id="institutions" class="section">
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

        <div class="table-container">
          <table class="institutions-table">
            <thead>
              <tr>
                <th><span class="dc-field">institutionCode</span></th>
                <th>Institution Name</th>
                <th>Records</th>
                <th>Species</th>
                <th>Countries</th>
                <th>Georeferenced</th>
                <th><span class="dc-field">collectionCode</span></th>
                <th>Latest Record</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="institution in filteredInstitutions" 
                  :key="institution.code" 
                  class="table-row institution-row"
                  @click="navigateToInstitution(institution)">
                <td>
                  <span class="institution-code-badge">{{ institution.code }}</span>
                </td>
                <td>
                  <span class="institution-name">{{ institution.name || 'Unknown Institution' }}</span>
                </td>
                <td>
                  <div class="records-bar-container">
                    <div
                        class="records-bar"
                        :style="{ width: getInstitutionRecordsPercentage(institution.recordCount) + '%' }"
                    ></div>
                    <div class="records-text">
                      {{ formatNumber(institution.recordCount, 'short') }}
                    </div>
                  </div>
                </td>
                <td>{{ formatNumber(institution.speciesCount || 0) }}</td>
                <td>{{ formatNumber(institution.countriesCount || 0) }}</td>
                <td>
                  <span
                      class="quality-badge"
                      :class="getQualityClass(institution.geoReferencingQuality || 0)"
                  >
                    {{ (institution.geoReferencingQuality || 0).toFixed(1) }}%
                  </span>
                </td>
                <td>
                  <span class="collection-codes">{{ institution.collectionCodes?.join(', ') || 'N/A' }}</span>
                </td>
                <td>{{ institution.latestRecord || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
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

      <!-- Fish-AIR Images Section -->
      <section id="fishair" class="section">
        <h2 class="section-title">Fish-AIR Images</h2>
        <FishImages 
          v-if="currentTaxon?.scientificName || taxonName" 
          :scientific-name="currentTaxon?.scientificName || taxonName"
          :limit="5"
        />
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaxonomy } from '@/composables/useTaxonomy.js'
import WorldMap from '@/components/charts/WorldMap.vue'
import CompactHeatMap from '@/components/charts/CompactHeatMap.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'
import FishImages from '@/components/FishImages.vue'

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

// Local state (activeTab removed - now using scroll navigation)
const loadingChildren = ref(false)
const children = ref([])
const childrenSearch = ref('')
const childrenSort = ref('records_desc')

// Coordinate records for map display
const actualCoordinateRecords = ref([])
const diversityFilter = ref('')
const institutionSearch = ref('')
const institutionTypeFilter = ref('')
const institutionSort = ref('records_desc')

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

// Heat map data for overview - using test data
const heatMapData = computed(() => {
  // Use test data instead of API data
  return [
    { name: 'United States', value: 15420 },
    { name: 'Brazil', value: 12380 },
    { name: 'Canada', value: 8960 },
    { name: 'Colombia', value: 6570 },
    { name: 'Mexico', value: 4820 },
    { name: 'Australia', value: 3290 },
    { name: 'Argentina', value: 2840 },
    { name: 'Peru', value: 2150 },
    { name: 'Venezuela', value: 1890 },
    { name: 'Chile', value: 1560 },
    { name: 'Ecuador', value: 1340 },
    { name: 'Costa Rica', value: 980 }
  ]
})

// Coordinate points for full-width distribution map - using test data
const coordinatePoints = computed(() => {
  // Use test coordinate points instead of API data
  return [
    { name: 'United States - Atlantic Coast', lat: 39.8283, lng: -98.5795, records: 2840, country: 'United States', species: 145, dataQuality: 87 },
    { name: 'Brazil - Amazon Basin', lat: -14.2350, lng: -51.9253, records: 2156, country: 'Brazil', species: 123, dataQuality: 91 },
    { name: 'Canada - Pacific Coast', lat: 56.1304, lng: -106.3468, records: 1897, country: 'Canada', species: 98, dataQuality: 85 },
    { name: 'Colombia - Caribbean', lat: 4.5709, lng: -74.2973, records: 1654, country: 'Colombia', species: 87, dataQuality: 89 },
    { name: 'Mexico - Gulf Coast', lat: 23.6345, lng: -102.5528, records: 1423, country: 'Mexico', species: 76, dataQuality: 82 },
    { name: 'Australia - Great Barrier Reef', lat: -25.2744, lng: 133.7751, records: 1298, country: 'Australia', species: 65, dataQuality: 93 },
    { name: 'Argentina - Patagonia', lat: -38.4161, lng: -63.6167, records: 987, country: 'Argentina', species: 54, dataQuality: 78 },
    { name: 'Peru - Amazon River', lat: -9.1900, lng: -75.0152, records: 876, country: 'Peru', species: 47, dataQuality: 84 },
    { name: 'Venezuela - Orinoco Basin', lat: 6.4238, lng: -66.5897, records: 743, country: 'Venezuela', species: 39, dataQuality: 81 },
    { name: 'Chile - Pacific Coast', lat: -35.6751, lng: -71.5430, records: 654, country: 'Chile', species: 32, dataQuality: 86 },
    { name: 'Ecuador - Galapagos', lat: -1.8312, lng: -78.1834, records: 567, country: 'Ecuador', species: 28, dataQuality: 92 },
    { name: 'Costa Rica - Caribbean Coast', lat: 9.7489, lng: -83.7534, records: 432, country: 'Costa Rica', species: 24, dataQuality: 88 },
    { name: 'Japan - Kuroshio Current', lat: 36.2048, lng: 138.2529, records: 389, country: 'Japan', species: 21, dataQuality: 95 },
    { name: 'Norway - North Sea', lat: 60.4720, lng: 8.4689, records: 298, country: 'Norway', species: 18, dataQuality: 90 },
    { name: 'South Africa - Cape Coast', lat: -30.5595, lng: 22.9375, records: 234, country: 'South Africa', species: 15, dataQuality: 83 }
  ]
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

// Transform country distribution to multiple map points based on record density
const transformCountryDistributionToMapData = (countryDistribution) => {
  const mapPoints = []
  
  countryDistribution.forEach(country => {
    const countryCoords = generateCoordinatesForCountry(country.name)
    if (!countryCoords.lat || !countryCoords.lng) return
    
    const recordCount = country.records || country.recordCount || 0
    if (recordCount === 0) return
    
    // Generate multiple points based on record density
    // More records = more points to show density
    const numPoints = Math.min(Math.ceil(recordCount / 100), 50) // 每100条记录1个点，最多50个点
    
    for (let i = 0; i < numPoints; i++) {
      // Add random offset within country bounds to distribute points
      const latOffset = (Math.random() - 0.5) * 4 // ±2度随机偏移
      const lngOffset = (Math.random() - 0.5) * 4
      
      mapPoints.push({
        institutionCode: `${country.name}-${i}`,
        institutionName: `Records from ${country.name}`,
        lat: countryCoords.lat + latOffset,
        lng: countryCoords.lng + lngOffset,
        recordCount: Math.ceil(recordCount / numPoints), // 每个点代表的记录数
        country: country.name,
        isDataPoint: true // 标记这是数据点而不是机构点
      })
    }
  })
  
  console.log(`Generated ${mapPoints.length} map points from ${countryDistribution.length} countries`)
  return mapPoints
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


const loadMapData = async () => {
  loadingMapData.value = true
  try {
    console.log('Loading map data from geographic distribution...')
    
    // 优先使用地理分布数据（国家分布）而不是机构数据
    if (geographicData.value.countryDistribution && geographicData.value.countryDistribution.length > 0) {
      institutionMapData.value = transformCountryDistributionToMapData(geographicData.value.countryDistribution)
      console.log('Transformed country distribution data:', institutionMapData.value.length, 'data points')
    } else if (institutions.value.length > 0) {
      // 备选方案：使用机构数据
      institutionMapData.value = transformInstitutionsToMapData(institutions.value)
      console.log('Transformed institution data:', institutionMapData.value.length, 'items')
    } else {
      // 最后备选：使用测试数据
      console.log('No geographic or institution data, using test data')
      const testData = [
        { name: 'USA', records: 15000 },
        { name: 'Brazil', records: 12000 },
        { name: 'Canada', records: 8000 },
        { name: 'Colombia', records: 6500 },
        { name: 'Mexico', records: 4000 }
      ]
      institutionMapData.value = transformCountryDistributionToMapData(testData)
    }
    console.log('Final map data:', institutionMapData.value.length, 'points')
    
    // Load actual coordinate records for distribution map
    await loadCoordinateRecords()
  } catch (err) {
    console.error('Failed to load map data:', err)
    institutionMapData.value = []
  } finally {
    loadingMapData.value = false
  }
}

const loadCoordinateRecords = async () => {
  try {
    console.log('=== loadCoordinateRecords START ===')
    console.log('Loading coordinate records for', props.taxonType, props.taxonName)
    
    // Convert species name for API if needed
    let apiTaxonName = props.taxonName
    if (props.taxonType === 'species') {
      const parts = props.taxonName.trim().split(' ')
      if (parts.length >= 2) {
        apiTaxonName = parts[1]
      }
    }
    
    let allRecords = []
    let page = 1
    let hasMore = true
    
    // Load all coordinate records with pagination
    while (hasMore && allRecords.length < 5000) { // Limit to 5000 to avoid performance issues
      try {
        const records = await fetchTaxonRecords(props.taxonType, apiTaxonName, {
          has_coordinates: true,
          per_page: 1000,
          page: page
        })
        
        console.log(`Page ${page}: loaded ${records.length} records`)
        
        if (records.length === 0) {
          hasMore = false
        } else {
          allRecords = allRecords.concat(records)
          page++
        }
      } catch (pageError) {
        console.error(`Failed to load page ${page}:`, pageError)
        hasMore = false
      }
    }
    
    console.log(`Total records loaded: ${allRecords.length}`)
    
    // Debug: check first record structure
    if (allRecords.length > 0) {
      console.log('First record structure:', allRecords[0])
      console.log('Coordinate fields check:')
      console.log('- decimalLatitude:', allRecords[0].decimalLatitude)
      console.log('- decimalLongitude:', allRecords[0].decimalLongitude)
    }
    
    // Transform records to coordinate points
    actualCoordinateRecords.value = allRecords
      .filter(record => record.decimalLatitude && record.decimalLongitude)
      .map(record => ({
        name: `${record.country || 'Unknown'} - ${record.locality || 'Unknown location'}`,
        lat: parseFloat(record.decimalLatitude),
        lng: parseFloat(record.decimalLongitude),
        records: 1,
        country: record.country,
        locality: record.locality,
        institution: record.institutionCode,
        collectionDate: record.eventDate
      }))
    
    console.log('Final coordinate records for map:', actualCoordinateRecords.value.length)
    console.log('=== loadCoordinateRecords END ===')
    
  } catch (err) {
    console.error('Failed to load coordinate records:', err)
    actualCoordinateRecords.value = []
  }
}

const loadTimelineData = async () => {
  try {
    console.log('Loading timeline data...', temporalData.value)
    
    if (temporalData.value && temporalData.value.yearlyTrend && temporalData.value.yearlyTrend.length > 0) {
      // 使用真实的时间线数据，直接使用后端返回的yearlyTrend数据
      timelineData.value = temporalData.value.yearlyTrend.map(item => ({
        year: item.year,
        records: item.records
      }))
      console.log('Using real temporal data:', timelineData.value.length, 'data points')
    } else {
      // 生成示例时间线数据
      console.log('No temporal data found, generating sample data')
      timelineData.value = generateSampleTimelineData()
    }
    
    // For detailed timeline, we could use the same data or create a subset
    detailedTimelineData.value = timelineData.value.filter(item => item.year >= 2000)
    
  } catch (err) {
    console.error('Failed to load timeline data:', err)
    // 即使出错也提供示例数据
    timelineData.value = generateSampleTimelineData()
    detailedTimelineData.value = timelineData.value.filter(item => item.year >= 2000)
  }
}

// 生成示例时间线数据
const generateSampleTimelineData = () => {
  const sampleData = []
  const currentYear = new Date().getFullYear()
  const startYear = 1850
  
  for (let year = startYear; year <= currentYear; year += 2) {
    let records = 0
    
    // 模拟收集模式：早期较少，1950-2000年增长，最近稳定
    if (year < 1900) {
      records = Math.floor(Math.random() * 50) + 5
    } else if (year < 1950) {
      records = Math.floor(Math.random() * 150) + 20
    } else if (year < 1980) {
      records = Math.floor(Math.random() * 500) + 100
    } else if (year < 2000) {
      records = Math.floor(Math.random() * 800) + 300
    } else if (year < 2020) {
      records = Math.floor(Math.random() * 600) + 400
    } else {
      records = Math.floor(Math.random() * 400) + 200
    }
    
    // 添加一些随机波动
    const variance = records * 0.3
    records += Math.floor((Math.random() - 0.5) * variance)
    records = Math.max(1, records)
    
    sampleData.push({
      year: year,
      records: records
    })
  }
  
  return sampleData.sort((a, b) => a.year - b.year)
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

// Scroll navigation function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// New computed methods for overview section
const getCollectionIntensity = () => {
  const recordCount = currentTaxon.value?.recordCount || 0
  if (recordCount > 50000) return 'a very well'
  if (recordCount > 10000) return 'a well'
  if (recordCount > 1000) return 'a moderately well'
  return 'a'
}

const getQualityClass = (percentage) => {
  if (percentage >= 80) return 'quality-excellent'
  if (percentage >= 60) return 'quality-good'
  if (percentage >= 40) return 'quality-fair'
  return 'quality-poor'
}

const getQualityText = (percentage) => {
  if (percentage >= 80) return 'Excellent'
  if (percentage >= 60) return 'Good' 
  if (percentage >= 40) return 'Fair'
  return 'Needs improvement'
}

const getTemporalCoverage = () => {
  // Mock data - would be calculated from actual temporal data
  return '1850-2024 (174 years)'
}

const getMostCommonRegion = () => {
  const regions = geographicData.value.continentalDistribution || []
  if (regions.length > 0) {
    return regions[0].name || 'North America'
  }
  return 'North America'
}

const getCollectionPeak = () => {
  // Mock data - would be calculated from temporal data
  return '1990s-2000s'
}

const getPrimaryContributors = () => {
  const institutions = institutionData.value || []
  if (institutions.length >= 2) {
    return `${institutions[0].code}, ${institutions[1].code}`
  }
  return 'Multiple institutions'
}

const getMostDiverseGenus = () => {
  const genera = diversityData.value || []
  if (genera.length > 0) {
    return genera[0].name || 'Various genera'
  }
  return 'Various genera'
}

// Institution table helper functions
const getInstitutionRecordsPercentage = (recordCount) => {
  const maxRecords = Math.max(...institutionData.value.map(inst => inst.recordCount || 0))
  return maxRecords > 0 ? (recordCount / maxRecords) * 100 : 0
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

.italic-name {
  font-style: italic;
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

/* Navigation menu */
.nav-menu {
  background: white;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  margin-bottom: 20px;
  padding: 0;
  position: sticky;
  top: 20px;
  z-index: 100;
}

.nav-menu ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid #e0e0e0;
}

.nav-menu li {
  flex: 1;
}

.nav-menu a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
}

.nav-menu a:hover {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

/* Overview Section Styles */
.overview-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-stat-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin-bottom: 2px;
}

.stat-context {
  font-size: 11px;
  color: #999;
}

/* Overview Main Content */
.overview-main-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.overview-left, .overview-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-summary-card, .map-card, .basis-of-record-card, .quick-facts-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 25px;
}

.overview-summary-card h3, .map-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
}

.summary-text p {
  line-height: 1.6;
  margin-bottom: 15px;
  color: #444;
}

.data-quality-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.data-quality-summary h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quality-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-label {
  font-weight: 500;
  color: #666;
}

.quality-value {
  font-weight: 600;
}

.quality-excellent { color: #27ae60; }
.quality-good { color: #3498db; }
.quality-fair { color: #f39c12; }
.quality-poor { color: #e74c3c; }

.basis-distribution {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.basis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.basis-percentage {
  font-weight: bold;
  color: #3498db;
}

.basis-note {
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.map-legend {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.quick-facts-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.quick-facts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fact-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fact-value {
  font-weight: 500;
  color: #2c3e50;
}

.fishair-placeholder {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
}

.fishair-placeholder p {
  margin: 10px 0;
}

/* Full width map container */
.full-width-map-container {
  width: 100%;
  margin: 20px 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Institutions Table Styles (similar to AllFamilies.vue) */
.institutions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.institutions-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.institutions-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.institution-row {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.institution-row:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.institution-code-badge {
  background: #e3f2fd;
  color: #1565c0;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.institution-name {
  font-weight: 500;
  color: #2c3e50;
}

.records-bar-container {
  position: relative;
  height: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
  min-width: 100px;
}

.records-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #2196f3);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.records-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: #333;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

.quality-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  min-width: 40px;
  display: inline-block;
}

.quality-excellent {
  background: #e8f5e8;
  color: #2e7d32;
}

.quality-good {
  background: #e3f2fd;
  color: #1565c0;
}

.quality-fair {
  background: #fff3e0;
  color: #ef6c00;
}

.quality-poor {
  background: #ffebee;
  color: #c62828;
}

.collection-codes {
  font-size: 12px;
  color: #666;
  font-family: 'Courier New', monospace;
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
  background: #f9f9f9;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

/* 确保地图组件能完全填充容器 */
.map-container > * {
  width: 100%;
  height: 100%;
}

.heatmap-container {
  margin-bottom: 15px;
}

.range-map-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
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

  .overview-stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .overview-main-content {
    grid-template-columns: 1fr;
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

  .nav-menu ul {
    flex-wrap: wrap;
  }

  .overview-stats-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .nav-menu a {
    padding: 12px 8px;
    font-size: 12px;
  }

  .overview-stats-grid {
    grid-template-columns: 1fr;
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