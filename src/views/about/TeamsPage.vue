<script setup>
import { Message } from '@element-plus/icons-vue'
import placeholderPhoto from '@/assets/teams/placeholder.svg'
import hankPhoto from '@/assets/teams/img.png'
import ybakisPhoto from '@/assets/teams/bakis.png'
import bianPhoto from '@/assets/teams/BrianS.jpg'
import xiaojunPhoto from '@/assets/teams/xiaojun.jpg'
import gracePhoto from '@/assets/teams/Grace_Gleason.jpg'

const leadership = [
  { name: 'Hank Bart', role: 'Project Director', email: 'hbartjr@tulane.edu', photo: hankPhoto },
  { name: 'Yasin Bakış', role: 'Co-PI – Technical Lead and System Architect', email: 'ybakis@tulane.edu', photo: ybakisPhoto },
  { name: 'Brian Sidlauskas', role: 'Institute Director - Institutional Oversight', email: 'bsidlauskas@tulane.edu', photo: bianPhoto },
]

const techTeam = [
  { name: 'Yasin Bakış', role: 'System Architect and Platform Designer', email: 'ybakis@tulane.edu', photo: ybakisPhoto },
  { name: 'Xiaojun Wang', role: 'Research Programmer – Frontend Backend Developer', email: 'xwang90@tulane.edu', photo: xiaojunPhoto },
  { name: 'Roseline Ewa', role: 'Information Coordinator', email: 'rewa@tulane.edu', photo: placeholderPhoto },
]

// Steering Committee members
const steeringCommittee = [
  { name: 'Andy Bentley', institution: 'University of Kansas' },
  { name: 'Anja Palandačić', institution: 'Natural History Museum Vienna' },
  { name: 'Andrew Williston', institution: 'Harvard University' },
  { name: 'Brian Sidlauskas', institution: 'Oregon State University' },
  { name: 'Chris Martins', institution: 'UC Berkeley' },
  { name: 'Felipe Polivanov Ottoni', institution: 'Universidade Federal do Maranhão' },
  { name: 'Gabriela M. Hogue', institution: 'North Carolina Museum of Natural Sciences' },
  { name: 'Heather L. Prestridge', institution: 'Texas A&M University' },
  { name: 'Andres Lopez', institution: 'University of Alaska' },
  { name: 'Jos Snoeks', institution: 'Royal Museum for Central Africa' },
  { name: 'José Luís Olivan Birindelli', institution: 'Universidade Estadual de Londrina' },
  { name: 'M. Worth Pugh', institution: 'University of Alabama' },
  { name: 'Katherine Pearson Maslenikov', institution: 'University of Washington' },
  { name: 'Nicolas Bailly', institution: 'University of British Columbia' },
  { name: 'Roger Bills', institution: 'SAIAB' },
  { name: 'Robert H. Robins', institution: 'Florida Museum of Natural History' },
  { name: 'Ronald Fricke', institution: 'State Museum of Natural History Stuttgart' },
  { name: 'Ryan J. Thoni', institution: 'American Museum of Natural History' },
]

// Testing & User Feedback Group members
const testingGroup = [
  { name: 'Andy Bentley', institution: 'University of Kansas' },
  { name: 'Nicolas Bailly', institution: 'University of British Columbia' },
  { name: 'Willem Coetzer', institution: 'SAIAB' },
  { name: 'Victor de Brito', institution: 'Cornell University' },
  { name: 'Robert Ellwanger', institution: 'Mississippi Museum of Natural Science' },
  { name: 'Brendan Haley', institution: 'Harvard University' },
  { name: 'Jean-Marc Herpers', institution: 'Royal Belgian Institute of Natural Sciences' },
  { name: 'Katherine Mallalieu', institution: 'University of Alberta' },
  { name: 'Franck Theeten', institution: 'Royal Museum for Central Africa' },
]

const getPhoto = (member) => {
  return member.photo || placeholderPhoto
}
</script>

<template>
  <div class="doc-page">
    <!-- Hero -->
    <header class="doc-hero">
      <span class="eyebrow">Team</span>
      <h1 class="doc-title">Teams</h1>
      <p class="lead">
        FishNet 2 is developed and maintained through collaboration among researchers, collections professionals,
        and technical staff working together to support access to specimen-based data from ichthyological collections.
      </p>
    </header>

    <article class="doc-body">
      <!-- Project Leadership -->
      <section class="doc-section">
        <h2>Project Leadership</h2>
        <p>
          Project leadership provides overall direction for FishNet 2 and coordinates activities among participating
          institutions. Leadership oversees development priorities, project management, community engagement, and
          collaboration with supporting organizations.
        </p>
        <div class="people">
          <div class="person" v-for="member in leadership" :key="member.name">
            <img :src="getPhoto(member)" :alt="member.name" class="person-photo" />
            <div class="person-info">
              <div class="person-name">{{ member.name }}</div>
              <div class="person-role">{{ member.role }}</div>
              <a :href="'mailto:' + member.email" class="person-email" :title="member.email">
                <el-icon><Message /></el-icon><span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Technical Development -->
      <section class="doc-section">
        <h2>Technical Development &amp; Data Integration and Curation</h2>
        <p>
          The technical development team is responsible for the design, implementation, and maintenance of the
          FishNet 2 platform. This work includes database architecture, web application development, search
          functionality, mapping tools, and system integration.
        </p>
        <p>
          Data integration efforts focus on the ingestion, validation, and indexing of specimen records contributed
          by participating collections. This work includes managing data harvesting workflows, supporting taxonomic
          linkages, and maintaining reliable search and retrieval across the platform.
        </p>
        <div class="people">
          <div class="person" v-for="member in techTeam" :key="member.name">
            <img :src="getPhoto(member)" :alt="member.name" class="person-photo" />
            <div class="person-info">
              <div class="person-name">{{ member.name }}</div>
              <div class="person-role">{{ member.role }}</div>
              <a :href="'mailto:' + member.email" class="person-email" :title="member.email">
                <el-icon><Message /></el-icon><span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Steering Committee -->
      <section class="doc-section">
        <h2>Steering Committee</h2>
        <p>
          The FishNet 2 Steering Committee provides strategic guidance and community oversight. Members represent
          participating institutions and help guide priorities for development, data services, and long-term
          sustainability of the network.
        </p>
        <div v-if="steeringCommittee.length" class="roster">
          <div class="roster-item" v-for="member in steeringCommittee" :key="member.name">
            <span class="roster-name">{{ member.name }}</span>
            <span v-if="member.institution" class="roster-inst">{{ member.institution }}</span>
          </div>
        </div>
        <p v-else class="placeholder-text">Members to be announced.</p>
      </section>

      <!-- Testing and User Feedback Group -->
      <section class="doc-section">
        <h2>Testing and User Feedback Group</h2>
        <p>
          The testing group evaluates new features and updates prior to wider release. Members provide feedback on
          usability, functionality, and data workflows to help ensure that the platform meets the needs of
          researchers, collections staff, and educators.
        </p>
        <div v-if="testingGroup.length" class="roster">
          <div class="roster-item" v-for="member in testingGroup" :key="member.name">
            <span class="roster-name">{{ member.name }}</span>
            <span v-if="member.institution" class="roster-inst">{{ member.institution }}</span>
          </div>
        </div>
        <p v-else class="placeholder-text">Members to be announced.</p>
      </section>

      <!-- Participating Institutions -->
      <section class="doc-section">
        <h2>Participating Institutions</h2>
        <p>
          FishNet 2 operates as a network of natural history collections that contribute specimen data to the
          platform. Participating institutions maintain their own databases and publish selected records through
          established data-sharing workflows.
        </p>
        <p>
          Through collaboration among these institutions, FishNet 2 provides unified discovery of fish specimen
          records while allowing collections to retain stewardship of their own data.
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

/* ===== Hero（与 About / Collaborations 一致）===== */
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

/* ===== Sections ===== */
.doc-body {
  font-size: 16.5px;
  line-height: 1.85;
}

.doc-section {
  margin-top: 56px;
}

.doc-section > p {
  margin: 0 0 18px;
  max-width: 72ch;
}

.doc-section h2 {
  font-size: clamp(22px, 3vw, 26px);
  line-height: 1.25;
  letter-spacing: -0.015em;
  font-weight: 700;
  color: #16232e;
  margin: 0 0 16px;
}

.placeholder-text {
  color: #9aa7b2;
  font-style: italic;
}

/* ===== 带照片的成员：去掉灰底边框卡片，纯净排布 ===== */
.people {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px 28px;
  margin-top: 30px;
}

.person {
  display: flex;
  align-items: center;
  gap: 16px;
}

.person-photo {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(20, 35, 46, 0.12);
}

.person-info {
  min-width: 0;
}

.person-name {
  font-size: 16px;
  font-weight: 650;
  color: #16232e;
}

.person-role {
  font-size: 13px;
  color: #6b7a88;
  line-height: 1.45;
  margin-top: 3px;
}

.person-email {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: #2c7cb9;
  text-decoration: none;
  margin-top: 8px;
  transition: color 0.18s;
}

.person-email:hover {
  color: #1f6fb2;
}

/* ===== 名单：细线分隔的花名册 ===== */
.roster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 22px 36px;
  margin-top: 26px;
}

.roster-item {
  padding: 0;
}

.roster-name {
  font-size: 15px;
  font-weight: 600;
  color: #16232e;
}

.roster-inst {
  display: block;
  font-size: 13px;
  color: #7d8b97;
  margin-top: 2px;
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
  .people {
    grid-template-columns: 1fr;
  }
}
</style>