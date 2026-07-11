<script setup>
</script>

<template>
  <div class="doc-page">
    <!-- Hero -->
    <header class="doc-hero">
      <span class="eyebrow">About</span>
      <h1 class="doc-title">About FishNet</h1>
      <p class="lead">
        FishNet is a web-based portal that provides access to specimen-based data from ichthyological collections —
        enabling discovery, exploration, and use of fish specimen records contributed by participating institutions.
      </p>
    </header>

    <article class="doc-body">
      <p>
        By aggregating and indexing data from multiple collections, FishNet supports research, education,
        and collections management through a shared access point for biodiversity information.
      </p>
      <p>
        FishNet focuses on specimen records associated with preserved material held in natural history collections.
        These records typically include taxonomic identification, collection locality, geographic coordinates,
        collection date, collector information, catalog identifiers, and related institutional metadata. Through the
        portal, users can search, view, and explore these records using taxonomic, geographic, and collection-based
        queries.
      </p>
      <p>
        The system is designed to support a range of users, including researchers, collection managers, students,
        and educators. Researchers use FishNet to locate specimen records relevant to studies in biodiversity,
        systematics, ecology, and biogeography. Collections professionals use the platform to increase visibility
        and accessibility of their holdings. Educators and students use specimen data to support coursework, training,
        and data literacy activities.
      </p>

      <section class="doc-section">
        <h2>How It Works</h2>
        <p>
          FishNet operates as a network of contributing institutions. Participating collections maintain their own
          local databases and share selected data through established data publishing workflows. FishNet provides a
          centralized portal where these distributed records can be searched and explored together. This approach allows
          institutions to retain control of their data while making specimen information more broadly discoverable.
        </p>
      </section>

      <section class="doc-section">
        <h2>Search &amp; Exploration Tools</h2>
        <p>
          The portal includes tools for taxonomic search, geographic search, and collection-based queries. Users can
          explore records through tabular results, record detail pages, and map-based views. These tools allow users
          to locate specimen records by scientific name, higher taxonomy, locality, coordinates, watershed or drainage,
          institution, collection, or other associated fields.
        </p>
      </section>

      <section class="doc-section">
        <h2>Part of a Broader Ecosystem</h2>
        <p>
          FishNet is part of the broader biodiversity informatics ecosystem. The platform complements other data
          networks and portals that provide access to specimen and occurrence records. By focusing specifically on
          ichthyological collections, FishNet supports specialized research needs while contributing to broader efforts
          to improve access to biodiversity data.
        </p>
        <p>
          The platform is maintained through collaboration among participating institutions and supporting
          organizations. Governance and development activities are guided by community input and oversight from project
          committees and collaborating partners. Ongoing development focuses on improving data access, search tools,
          interoperability, and services that support the use of specimen-based biodiversity data.
        </p>
        <p>
          FishNet continues to evolve as collections contribute new data and as tools for discovery and analysis are
          improved. The long-term goal of the platform is to support reliable access to fish specimen data and to
          facilitate its use in scientific research, education, and collections stewardship.
        </p>
      </section>
    </article>
  </div>
</template>

<style scoped>
.doc-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 72px 24px 112px;
  color: #40515f;
}

/* ===== Hero ===== */
.doc-hero {
  margin-bottom: 12px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2c7cb9;
}

.eyebrow::before {
  content: '';
  width: 24px;
  height: 2px;
  background: #2c7cb9;
  border-radius: 2px;
  margin-right: 10px;
}

.doc-title {
  font-size: clamp(32px, 5vw, 44px);
  line-height: 1.12;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: #16232e;
  margin: 16px 0 0;
}

.lead {
  font-size: clamp(17px, 2.4vw, 20px);
  line-height: 1.65;
  color: #566672;
  font-weight: 400;
  margin: 22px 0 0;
  max-width: 62ch;
}

/* ===== Body ===== */
.doc-body {
  font-size: 16.5px;
  line-height: 1.85;
}

.doc-body p {
  margin: 0 0 20px;
}

.doc-body p:last-child {
  margin-bottom: 0;
}

.doc-section {
  margin-top: 56px;
}

.doc-section h2 {
  font-size: clamp(22px, 3vw, 26px);
  line-height: 1.25;
  letter-spacing: -0.015em;
  font-weight: 700;
  color: #16232e;
  margin: 0 0 16px;
}

@media (max-width: 600px) {
  .doc-page {
    padding: 44px 20px 80px;
  }
  .doc-section {
    margin-top: 44px;
  }
  .doc-body {
    font-size: 16px;
  }
}
</style>
