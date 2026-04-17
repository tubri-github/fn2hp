<script setup>
</script>

<template>
  <div class="about-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">About FishNet</h1>
      <p class="page-subtitle">
        FishNet is a web-based portal that provides access to specimen-based data from ichthyological collections.
        The platform enables discovery, exploration, and use of fish specimen records contributed by participating
        institutions.
      </p>
    </div>

    <div class="section-card">
      <p class="section-desc">
        By aggregating and indexing data from multiple collections, FishNet supports research, education,
        and collections management through a shared access point for biodiversity information.
      </p>
      <p class="section-desc">
        FishNet focuses on specimen records associated with preserved material held in natural history collections.
        These records typically include taxonomic identification, collection locality, geographic coordinates,
        collection date, collector information, catalog identifiers, and related institutional metadata. Through the
        portal, users can search, view, and explore these records using taxonomic, geographic, and collection-based
        queries.
      </p>
      <p class="section-desc">
        The system is designed to support a range of users, including researchers, collection managers, students,
        and educators. Researchers use FishNet to locate specimen records relevant to studies in biodiversity,
        systematics, ecology, and biogeography. Collections professionals use the platform to increase visibility
        and accessibility of their holdings. Educators and students use specimen data to support coursework, training,
        and data literacy activities.
      </p>
    </div>

    <div class="section-card">
      <h2 class="section-title">How It Works</h2>
      <p class="section-desc">
        FishNet operates as a network of contributing institutions. Participating collections maintain their own
        local databases and share selected data through established data publishing workflows. FishNet provides a
        centralized portal where these distributed records can be searched and explored together. This approach allows
        institutions to retain control of their data while making specimen information more broadly discoverable.
      </p>
    </div>

    <div class="section-card">
      <h2 class="section-title">Search &amp; Exploration Tools</h2>
      <p class="section-desc">
        The portal includes tools for taxonomic search, geographic search, and collection-based queries. Users can
        explore records through tabular results, record detail pages, and map-based views. These tools allow users
        to locate specimen records by scientific name, higher taxonomy, locality, coordinates, watershed or drainage,
        institution, collection, or other associated fields.
      </p>
    </div>

    <div class="section-card">
      <p class="section-desc">
        FishNet is part of the broader biodiversity informatics ecosystem. The platform complements other data
        networks and portals that provide access to specimen and occurrence records. By focusing specifically on
        ichthyological collections, FishNet supports specialized research needs while contributing to broader efforts
        to improve access to biodiversity data.
      </p>
      <p class="section-desc">
        The platform is maintained through collaboration among participating institutions and supporting
        organizations. Governance and development activities are guided by community input and oversight from project
        committees and collaborating partners. Ongoing development focuses on improving data access, search tools,
        interoperability, and services that support the use of specimen-based biodiversity data.
      </p>
      <p class="section-desc">
        FishNet continues to evolve as collections contribute new data and as tools for discovery and analysis are
        improved. The long-term goal of the platform is to support reliable access to fish specimen data and to
        facilitate its use in scientific research, education, and collections stewardship.
      </p>
    </div>
  </div>
</template>

<style scoped>
.about-page {
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

.section-desc:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .about-page {
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