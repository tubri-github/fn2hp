<script setup>
const partners = [
  {
    name: 'FishBase',
    href: 'https://www.fishbase.org',
    domain: 'fishbase.org',
    body: [
      'FishBase is a global information system on fishes that provides comprehensive data on fish taxonomy, distribution, ecology, life history, and fisheries-related information. The database serves as an important reference resource for researchers, fisheries scientists, educators, and policy makers.',
      'FishNet 2 complements FishBase by providing access to specimen-based records from natural history collections. While FishBase focuses on species-level biological information, FishNet 2 documents individual specimens and their associated locality and collection metadata. Together, these resources support research in ichthyology, biodiversity science, and fisheries biology.'
    ]
  },
  {
    name: 'Global Biodiversity Information Facility',
    short: 'GBIF',
    href: 'https://www.gbif.org',
    domain: 'gbif.org',
    body: [
      'GBIF is an international network and data infrastructure funded by governments around the world that provides open access to biodiversity occurrence data. It integrates data from research institutions, natural history collections, monitoring programs, and citizen science initiatives.',
      'FishNet 2 supports specimen-based data that can be shared through global data publishing frameworks. Collaboration with GBIF helps ensure that fish specimen records from participating collections can be integrated into global biodiversity resources and used in large-scale ecological, biogeographic, and conservation research.'
    ]
  },
  {
    name: 'Ocean Biodiversity Information System',
    short: 'OBIS',
    href: 'https://obis.org',
    domain: 'obis.org',
    body: [
      'OBIS is a global open-access data platform that provides access to marine biodiversity records from around the world, integrating data from research programs, monitoring initiatives, and natural history collections.',
      'FishNet 2 contributes specimen-based records relevant to marine biodiversity research and supports data interoperability with OBIS through shared biodiversity data standards and publishing workflows, helping specimen records contribute to broader efforts to document marine biodiversity patterns.'
    ]
  },
  {
    name: 'VertNet',
    href: 'https://vertnet.org',
    domain: 'vertnet.org',
    body: [
      'VertNet is a biodiversity data network that provides access to vertebrate occurrence records from natural history collections, aggregating specimen data across fishes, birds, mammals, reptiles, and amphibians.',
      'FishNet 2 collaborates with VertNet through shared biodiversity informatics practices and data publishing standards, improving the discoverability of fish specimen records within broader vertebrate datasets and supporting interoperability between collection-based data infrastructures.'
    ]
  }
]
</script>

<template>
  <div class="doc-page">
    <!-- Hero -->
    <header class="doc-hero">
      <span class="eyebrow">Partners</span>
      <h1 class="doc-title">Collaborations</h1>
      <p class="lead">
        FishNet 2 operates within a broader ecosystem of biodiversity data networks and research infrastructures.
        Collaboration with international platforms helps ensure that specimen-based information from ichthyological
        collections is discoverable and usable across scientific communities.
      </p>
    </header>

    <ul class="partner-list">
      <li v-for="p in partners" :key="p.name" class="partner">
        <div class="partner-head">
          <h2 class="partner-name">
            {{ p.name }}
            <span v-if="p.short" class="partner-abbr">{{ p.short }}</span>
          </h2>
          <a class="partner-link" :href="p.href" target="_blank" rel="noopener noreferrer">
            {{ p.domain }}
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
        <div class="partner-body">
          <p v-for="(para, i) in p.body" :key="i">{{ para }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.doc-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 72px 24px 112px;
  color: #40515f;
}

/* ===== Hero（与 About 一致）===== */
.doc-hero {
  margin-bottom: 20px;
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
  margin: 22px 0 0;
  max-width: 64ch;
}

/* ===== 合作方：细线分隔的两栏「规格列表」，非卡片 ===== */
.partner-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.partner {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 48px;
  padding: 30px 0;
}

.partner-head {
  position: relative;
}

.partner-name {
  font-size: 22px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 650;
  color: #16232e;
  margin: 0;
}

.partner-abbr {
  display: inline-block;
  margin-left: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #2c7cb9;
  background: rgba(44, 124, 185, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  vertical-align: middle;
}

.partner-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  font-size: 14.5px;
  font-weight: 500;
  color: #2c7cb9;
  text-decoration: none;
  transition: gap 0.18s ease, color 0.18s ease;
}

.partner-link svg {
  transition: transform 0.18s ease;
}

.partner-link:hover {
  color: #1f6fb2;
  gap: 8px;
}

.partner-link:hover svg {
  transform: translate(1px, -1px);
}

.partner-body {
  font-size: 16px;
  line-height: 1.8;
}

.partner-body p {
  margin: 0 0 16px;
}

.partner-body p:last-child {
  margin-bottom: 0;
}

@media (max-width: 720px) {
  .partner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 36px 0;
  }
}

@media (max-width: 600px) {
  .doc-page {
    padding: 44px 20px 80px;
  }
  .partner-body {
    font-size: 15.5px;
  }
}
</style>