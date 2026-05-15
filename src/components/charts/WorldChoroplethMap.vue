<template>
  <div class="choropleth-wrap">
    <div v-if="loadError" class="map-msg error">
      Failed to load world map data: {{ loadError }}
    </div>
    <div v-else-if="!ready" class="map-msg">Loading map...</div>
    <v-chart
      v-else
      :option="option"
      autoresize
      class="choropleth-chart"
      @click="onClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use, registerMap } from 'echarts/core'
import { MapChart } from 'echarts/charts'
import {
  GeoComponent,
  VisualMapComponent,
  TooltipComponent,
} from 'echarts/components'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

// Apache ECharts ships a world map GeoJSON that is pre-processed for the
// flat 2D projection ECharts uses (no antimeridian artifacts, no degenerate
// polygons). We fetch and cache it at module scope so multiple instances of
// this component reuse the same data.
const WORLD_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/apache/echarts-examples@gh-pages/public/data/asset/geo/world.json'

let _worldFeatureNames = null   // Set<string> of feature.properties.name
let _initPromise = null

const initOnce = async () => {
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    use([MapChart, GeoComponent, VisualMapComponent, TooltipComponent])
    countries.registerLocale(enLocale)
    const res = await fetch(WORLD_GEOJSON_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching world map`)
    const geo = await res.json()
    registerMap('world', geo)
    _worldFeatureNames = new Set(
      (geo.features || []).map((f) => f?.properties?.name).filter(Boolean)
    )
  })()
  return _initPromise
}

// Per-ISO list of name candidates to try against the world.json's
// feature.properties.name. The Apache ECharts world.json uses Natural Earth
// "short" cartographic names (e.g. "Dem. Rep. Congo", "Solomon Is."), which
// differ from i18n-iso-countries' official ISO 3166 names.
const NAME_CANDIDATES = {
  // Major countries with known short-name mismatches
  US: ['United States', 'United States of America', 'USA'],
  GB: ['United Kingdom', 'England', 'Great Britain'],
  RU: ['Russia', 'Russian Federation'],
  CN: ['China', "People's Republic of China"],
  KR: ['South Korea', 'Republic of Korea', 'Korea'],
  KP: ['North Korea', 'Dem. Rep. Korea', "Democratic People's Republic of Korea"],
  TW: ['Taiwan', 'Taiwan, Province of China'],
  HK: ['Hong Kong', 'Hong Kong S.A.R.'],
  IR: ['Iran', 'Islamic Republic of Iran'],
  SY: ['Syria', 'Syrian Arab Republic'],
  VE: ['Venezuela', 'Bolivarian Republic of Venezuela'],
  BO: ['Bolivia', 'Plurinational State of Bolivia'],
  TZ: ['Tanzania', 'United Republic of Tanzania'],
  CD: ['Dem. Rep. Congo', 'Democratic Republic of the Congo'],
  CG: ['Congo', 'Republic of the Congo'],
  CI: ["Côte d'Ivoire", 'Ivory Coast', "Cote d'Ivoire"],
  CF: ['Central African Rep.', 'Central African Republic'],
  GQ: ['Eq. Guinea', 'Equatorial Guinea'],
  GM: ['Gambia', 'The Gambia'],
  LA: ['Lao PDR', 'Laos', "Lao People's Democratic Republic"],
  VN: ['Vietnam', 'Viet Nam'],
  CZ: ['Czech Rep.', 'Czech Republic', 'Czechia'],
  MD: ['Moldova', 'Republic of Moldova'],
  MK: ['Macedonia', 'North Macedonia'],
  RS: ['Serbia', 'Republic of Serbia'],
  BA: ['Bosnia and Herz.', 'Bosnia and Herzegovina'],
  PS: ['Palestine', 'Palestinian Territory'],
  BN: ['Brunei', 'Brunei Darussalam'],
  TL: ['Timor-Leste', 'East Timor'],
  SS: ['S. Sudan', 'South Sudan'],
  SZ: ['Swaziland', 'eSwatini', 'Eswatini'],
  FM: ['Micronesia', 'Federated States of Micronesia'],
  AE: ['United Arab Emirates', 'UAE'],
  TR: ['Turkey', 'Türkiye'],
  // Smaller countries that ECharts world.json does include but with abbreviations
  DO: ['Dominican Rep.', 'Dominican Republic'],
  SB: ['Solomon Is.', 'Solomon Islands'],
  AG: ['Antigua and Barb.', 'Antigua and Barbuda'],
  AQ: ['Antarctica'],
  EH: ['W. Sahara', 'Western Sahara'],
  FK: ['Falkland Is.', 'Falkland Islands', 'Falkland Islands (Malvinas)'],
  // GF (French Guiana) is rendered as part of France in Natural Earth Admin 0;
  // attribute its records to FR so they show up.
  GF: ['France'],
}

// ISO codes we know are NOT in a typical world choropleth map. Suppress the
// warning for these — listing them helps us tell "we forgot to add a
// candidate" from "this is a dependency that's invisibly merged into its
// parent country" (or just doesn't render at choropleth scale).
const IGNORE_CODES = new Set([
  // Junk / deprecated codes from upstream data
  'ZZ', 'UK', 'YU',
  // Small island dependencies / overseas territories not in Natural Earth Admin 0
  'AI', 'AW', 'AX', 'BL', 'BQ', 'BV', 'CC', 'CK', 'CX', 'FO', 'GI', 'GP',
  'GS', 'HM', 'IO', 'KN', 'KY', 'MC', 'MF', 'MH', 'MP', 'MQ', 'MV',
  'NF', 'NR', 'PF', 'PM', 'PN', 'RE', 'SJ', 'ST', 'SX', 'TC', 'TF',
  'TK', 'TV', 'UM', 'VC', 'VG', 'VI', 'WF', 'YT',
])

const _unmatchedReported = new Set()

// Pick the first name candidate that actually exists in the world.json's
// feature names. Falls back to the canonical ISO English name. Returns null
// (silently) for codes in IGNORE_CODES.
const isoToMapName = (code, featureNames) => {
  if (IGNORE_CODES.has(code)) return null

  const candidates = NAME_CANDIDATES[code] || []
  for (const name of candidates) {
    if (featureNames.has(name)) return name
  }
  const isoName = countries.getName(code, 'en')
  if (isoName && featureNames.has(isoName)) return isoName

  if (!_unmatchedReported.has(code)) {
    _unmatchedReported.add(code)
    console.warn(
      `[WorldChoroplethMap] No feature found for ISO ${code} (${isoName || '?'}). ` +
      `Add a candidate to NAME_CANDIDATES.`
    )
  }
  return null
}

const props = defineProps({
  // [{ countryCode: 'US', recordCount: 580432, countryName?: '...' }, ...]
  data: { type: Array, default: () => [] },
})

const emit = defineEmits(['country-click'])

const ready = ref(false)
const loadError = ref('')

onMounted(async () => {
  try {
    await initOnce()
    ready.value = true
  } catch (e) {
    loadError.value = e?.message || String(e)
  }
})

// Map our country list to ECharts data items, dropping countries that
// don't match any feature in the world map (small islands, depencies, etc.)
// rather than rendering as ghost grey areas with weird tooltips.
const seriesData = computed(() => {
  if (!_worldFeatureNames) return []
  const out = []
  for (const c of props.data) {
    const name = isoToMapName(c.countryCode, _worldFeatureNames)
    if (!name) continue
    out.push({
      name,
      value: c.recordCount,
      countryCode: c.countryCode,
      countryName: c.countryName || countries.getName(c.countryCode, 'en') || c.countryCode,
    })
  }
  return out
})

// Color stops chosen for biodiversity record volumes — most countries fall
// in the 1K–100K range so we give that range three distinct shades.
const valueMax = computed(() =>
  Math.max(1, ...props.data.map((c) => c.recordCount || 0))
)

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p) => {
      // Skip tooltip for unmatched countries — they have no useful info.
      if (!p.data) return ''
      const v = (p.data.value || 0).toLocaleString('en-US')
      return `<b>${p.data.countryName}</b> (${p.data.countryCode})<br/>${v} records`
    },
  },
  visualMap: {
    type: 'piecewise',
    pieces: [
      { gte: 1_000_000,                  label: '> 1M',     color: '#08306b' },
      { gte: 100_000, lt: 1_000_000,     label: '100K – 1M', color: '#2c7cb9' },
      { gte: 10_000,  lt: 100_000,       label: '10K – 100K', color: '#6baed6' },
      { gte: 1_000,   lt: 10_000,        label: '1K – 10K',  color: '#bdd7e7' },
      { gt: 0,        lt: 1_000,         label: '< 1K',      color: '#deebf7' },
    ],
    left: 14,
    bottom: 14,
    text: ['', 'Records'],
    textStyle: { fontSize: 11, color: '#333' },
    itemWidth: 16,
    itemHeight: 12,
    itemGap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 8,
    borderRadius: 4,
  },
  series: [
    {
      name: 'Records',
      type: 'map',
      map: 'world',
      roam: true,
      scaleLimit: { min: 1, max: 8 },
      zoom: 1.1,
      label: { show: false },
      itemStyle: {
        areaColor: '#f3f4f6',
        borderColor: '#bcd4f5',
        borderWidth: 0.4,
      },
      // focus:'self' is critical — without it ECharts 5 highlights the
      // entire series on hover (the whole map turns yellow).
      emphasis: {
        focus: 'self',
        itemStyle: {
          areaColor: '#fbbf24',
          borderColor: '#92400e',
          borderWidth: 1,
        },
        label: { show: false },
      },
      // Suppress hover effects for unmatched countries — keeps the grey
      // background grey instead of flashing yellow.
      selectedMode: false,
      data: seriesData.value,
    },
  ],
}))

const onClick = (params) => {
  const code = params.data?.countryCode
  if (code) emit('country-click', code)
}
</script>

<style scoped>
.choropleth-wrap {
  height: 480px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  position: relative;
}

.choropleth-chart {
  width: 100%;
  height: 100%;
}

.map-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 14px;
}

.map-msg.error {
  color: #d73027;
}
</style>