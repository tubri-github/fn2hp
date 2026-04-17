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
  { name: 'Grace Gleason', role: 'Information Coordinator', email: 'ggleason@tulane.edu', photo: gracePhoto },
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
  <div class="teams-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Teams</h1>
      <p class="page-subtitle">
        FishNet 2 is developed and maintained through collaboration among researchers, collections professionals,
        and technical staff working together to support access to specimen-based data from ichthyological collections.
      </p>
    </div>

    <!-- Project Leadership -->
    <div class="section-card">
      <h2 class="section-title">Project Leadership</h2>
      <p class="section-desc">
        Project leadership provides overall direction for FishNet 2 and coordinates activities among participating
        institutions. Leadership oversees development priorities, project management, community engagement, and
        collaboration with supporting organizations.
      </p>
      <div class="members-grid">
        <div class="member-card" v-for="member in leadership" :key="member.name">
          <img :src="getPhoto(member)" :alt="member.name" class="member-photo" />
          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-role">{{ member.role }}</div>
            <a :href="'mailto:' + member.email" class="member-email" :title="member.email"><el-icon><Message /></el-icon></a>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Development -->
    <div class="section-card">
      <h2 class="section-title">Technical Development &amp; Data Integration and Curation</h2>
      <p class="section-desc">
        The technical development team is responsible for the design, implementation, and maintenance of the
        FishNet 2 platform. This work includes database architecture, web application development, search
        functionality, mapping tools, and system integration.
      </p>
      <p class="section-desc">
        Data integration efforts focus on the ingestion, validation, and indexing of specimen records contributed
        by participating collections. This work includes managing data harvesting workflows, supporting taxonomic
        linkages, and maintaining reliable search and retrieval across the platform.
      </p>
      <div class="members-grid">
        <div class="member-card" v-for="member in techTeam" :key="member.name">
          <img :src="getPhoto(member)" :alt="member.name" class="member-photo" />
          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-role">{{ member.role }}</div>
            <a :href="'mailto:' + member.email" class="member-email" :title="member.email"><el-icon><Message /></el-icon></a>
          </div>
        </div>
      </div>
    </div>

    <!-- Steering Committee -->
    <div class="section-card">
      <h2 class="section-title">Steering Committee</h2>
      <p class="section-desc">
        The FishNet 2 Steering Committee provides strategic guidance and community oversight. Members represent
        participating institutions and help guide priorities for development, data services, and long-term
        sustainability of the network.
      </p>
      <div v-if="steeringCommittee.length" class="committee-list">
        <div class="committee-member" v-for="member in steeringCommittee" :key="member.name">
          <span class="committee-name">{{ member.name }}</span>
          <span v-if="member.institution" class="committee-institution">{{ member.institution }}</span>
        </div>
      </div>
      <p v-else class="section-desc placeholder-text">Members to be announced.</p>
    </div>

    <!-- Testing and User Feedback Group -->
    <div class="section-card">
      <h2 class="section-title">Testing and User Feedback Group</h2>
      <p class="section-desc">
        The testing group evaluates new features and updates prior to wider release. Members provide feedback on
        usability, functionality, and data workflows to help ensure that the platform meets the needs of
        researchers, collections staff, and educators.
      </p>
      <div v-if="testingGroup.length" class="committee-list">
        <div class="committee-member" v-for="member in testingGroup" :key="member.name">
          <span class="committee-name">{{ member.name }}</span>
          <span v-if="member.institution" class="committee-institution">{{ member.institution }}</span>
        </div>
      </div>
      <p v-else class="section-desc placeholder-text">Members to be announced.</p>
    </div>

    <!-- Participating Institutions -->
    <div class="section-card">
      <h2 class="section-title">Participating Institutions</h2>
      <p class="section-desc">
        FishNet 2 operates as a network of natural history collections that contribute specimen data to the
        platform. Participating institutions maintain their own databases and publish selected records through
        established data-sharing workflows.
      </p>
      <p class="section-desc">
        Through collaboration among these institutions, FishNet 2 provides unified discovery of fish specimen
        records while allowing collections to retain stewardship of their own data.
      </p>
    </div>
  </div>
</template>

<style scoped>
.teams-page {
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
  margin-bottom: 0;
}

.placeholder-text {
  color: #999;
  font-style: italic;
}

/* Members with photos */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #e9ecef;
}

.member-photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.member-info {
  min-width: 0;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.member-email {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  color: #999;
  text-decoration: none;
  margin-top: 6px;
  transition: color 0.2s;
}

.member-email:hover {
  color: #3498db;
}

/* Committee list (name + email, many members) */
.committee-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px 24px;
  margin-top: 16px;
}

.committee-member {
  padding: 8px 0;
}

.committee-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.committee-institution {
  font-size: 13px;
  color: #888;
  display: block;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .teams-page {
    padding: 15px;
  }

  .page-header,
  .section-card {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .committee-list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .committee-list {
    grid-template-columns: 1fr;
  }
}
</style>