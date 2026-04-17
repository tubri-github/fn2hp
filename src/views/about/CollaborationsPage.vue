<script setup>
</script>

<template>
  <div class="collaborations-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Collaborations</h1>
      <p class="page-subtitle">
        FishNet 2 operates within a broader ecosystem of biodiversity data networks and research infrastructures.
        Collaboration with international data platforms helps ensure that specimen-based information from
        ichthyological collections is discoverable and usable across multiple scientific communities.
      </p>
    </div>

    <!-- FishBase -->
    <div class="section-card">
      <h2 class="section-title">FishBase</h2>
      <p class="section-desc">
        FishBase is a global information system on fishes that provides comprehensive data on fish taxonomy,
        distribution, ecology, life history, and fisheries-related information. The database serves as an
        important reference resource for researchers, fisheries scientists, educators, and policy makers.
      </p>
      <p class="section-desc">
        FishNet 2 complements FishBase by providing access to specimen-based records from natural history
        collections. While FishBase focuses on species-level biological information, FishNet 2 provides access
        to collection records that document individual specimens and their associated locality and collection
        metadata. Together, these resources support research in ichthyology, biodiversity science, and
        fisheries biology.
      </p>
      <a href="https://www.fishbase.org" target="_blank" rel="noopener noreferrer" class="ext-link">
        www.fishbase.org
      </a>
    </div>

    <!-- GBIF -->
    <div class="section-card">
      <h2 class="section-title">Global Biodiversity Information Facility (GBIF)</h2>
      <p class="section-desc">
        The Global Biodiversity Information Facility (GBIF) is an international network and data infrastructure
        funded by governments around the world that provides open access to biodiversity occurrence data. GBIF
        integrates data from research institutions, natural history collections, monitoring programs, and citizen
        science initiatives.
      </p>
      <p class="section-desc">
        FishNet 2 contributes to the broader biodiversity informatics landscape by supporting specimen-based
        data that can be shared through global data publishing frameworks. Collaboration with GBIF helps ensure
        that fish specimen records from participating collections can be integrated into global biodiversity data
        resources and used in large-scale ecological, biogeographic, and conservation research.
      </p>
      <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer" class="ext-link">
        www.gbif.org
      </a>
    </div>

    <!-- OBIS -->
    <div class="section-card">
      <h2 class="section-title">Ocean Biodiversity Information System (OBIS)</h2>
      <p class="section-desc">
        The Ocean Biodiversity Information System (OBIS) is a global open-access data platform that provides
        access to marine biodiversity records from around the world. OBIS integrates data from numerous sources,
        including research programs, monitoring initiatives, and natural history collections.
      </p>
      <p class="section-desc">
        FishNet 2 contributes specimen-based records relevant to marine biodiversity research and supports data
        interoperability with OBIS through shared biodiversity data standards and publishing workflows. Through
        this collaboration, specimen records from ichthyological collections can contribute to broader efforts
        to document and understand marine biodiversity patterns.
      </p>
      <a href="https://obis.org" target="_blank" rel="noopener noreferrer" class="ext-link">
        obis.org
      </a>
    </div>

    <!-- VertNet -->
    <div class="section-card">
      <h2 class="section-title">VertNet</h2>
      <p class="section-desc">
        VertNet is a biodiversity data network that provides access to vertebrate occurrence records from natural
        history collections. The network aggregates specimen data across multiple vertebrate groups, including
        fishes, birds, mammals, reptiles, and amphibians.
      </p>
      <p class="section-desc">
        FishNet 2 collaborates with VertNet through shared biodiversity informatics practices and data publishing
        standards. This collaboration helps improve the discoverability of fish specimen records within broader
        vertebrate biodiversity datasets and supports interoperability between collection-based data
        infrastructures.
      </p>
      <a href="https://vertnet.org" target="_blank" rel="noopener noreferrer" class="ext-link">
        vertnet.org
      </a>
    </div>
  </div>
</template>

<style scoped>
.collaborations-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 200px);
}

.page-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.page-subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  margin: 0;
}

.section-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.section-desc {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  margin: 0 0 14px 0;
}

.section-desc:last-of-type {
  margin-bottom: 16px;
}

.ext-link {
  display: inline-block;
  font-size: 14px;
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.ext-link:hover {
  text-decoration: underline;
  color: #2980b9;
}

@media (max-width: 768px) {
  .collaborations-page {
    padding: 15px;
  }

  .page-header,
  .section-card {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>