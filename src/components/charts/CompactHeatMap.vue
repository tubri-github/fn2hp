<template>
  <div class="compact-heatmap-container">
    <div class="compact-map-wrapper" :style="{ height: height + 'px' }">
      <div
          ref="mapElement"
          class="compact-leaflet-map"
      ></div>

      <div v-if="loading" class="compact-loading">
        <div class="loading-spinner-small"></div>
        <span>Loading...</span>
      </div>

      <div v-if="mapError" class="compact-error">
        <p>⚠️ {{ mapError }}</p>
      </div>
      
      <!-- Debug info -->
      <div v-if="showDebug" class="debug-info">
        <p>Data: {{ props.data.length }} | Heat points: {{ debugInfo.heatPoints }}</p>
        <p>Map: {{ !!map }} | Layer: {{ !!heatLayer }}</p>
        <p>Container: {{ debugInfo.containerWidth }}x{{ debugInfo.containerHeight }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'

// 确保Leaflet图标路径正确
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  height: {
    type: Number,
    default: 180
  },
  // 'auto' = heatmap for coords / circles for countries
  // 'points' = always circle markers (适合分布图)
  // 'heatmap' = L.heatLayer with raw [[lat,lng,count]] data
  // 'clusters' = circle markers with {lat, lng, records} data
  mode: {
    type: String,
    default: 'auto',
    validator: v => ['auto', 'points', 'heatmap', 'clusters'].includes(v)
  },
  // heatmap 模式下的最大计数值（用于 L.heatLayer max 参数）
  maxCount: {
    type: Number,
    default: 0
  },
  // 可选：在地图上叠加显示的 hotspot 列表
  hotspots: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['boundsChanged'])

// Reactive state
const mapElement = ref(null)
const map = ref(null)
const heatLayer = ref(null)
const hotspotsControl = ref(null)
const legendControl = ref(null)
const loading = ref(false)
const mapError = ref('')
const showDebug = ref(false)
const debugInfo = ref({ heatPoints: 0, containerWidth: 0, containerHeight: 0 })

// 初始化地图
const initMap = async () => {
  try {
    if (!mapElement.value) {
      throw new Error('Map container not found')
    }

    loading.value = true

    // 检查容器尺寸
    const rect = mapElement.value.getBoundingClientRect()
    debugInfo.value.containerWidth = rect.width
    debugInfo.value.containerHeight = rect.height
    
    console.log('Container dimensions:', rect.width, 'x', rect.height)
    
    if (rect.width < 50) {
      throw new Error(`Container too narrow: ${rect.width}px`)
    }

    // 根据高度决定是否启用交互（大地图启用交互）
    const isLargeMap = props.height > 300

    // 创建地图实例
    map.value = L.map(mapElement.value, {
      center: [20, 0],
      zoom: isLargeMap ? 2 : 1,
      zoomControl: isLargeMap,
      worldCopyJump: true,
      preferCanvas: true,
      attributionControl: false,
      scrollWheelZoom: isLargeMap,
      doubleClickZoom: isLargeMap,
      boxZoom: isLargeMap,
      keyboard: isLargeMap,
      dragging: isLargeMap
    })

    // 添加轻量级的地图瓦片
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: isLargeMap ? 12 : 6,
      minZoom: 1
    })
    
    tileLayer.addTo(map.value)

    // 等待DOM更新后添加热图层
    await nextTick()

    // 强制调整地图尺寸，防止容器尺寸问题
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize()
        addHeatmapLayer()
        addHotspotsOverlay()

        // 大地图：监听视窗变化并发射事件
        if (isLargeMap) {
          map.value.on('moveend', emitBounds)
          map.value.on('zoomend', emitBounds)
        }
      }
    }, 100)

    mapError.value = ''
    loading.value = false

  } catch (error) {
    console.error('Compact heatmap initialization error:', error)
    mapError.value = error.message
    loading.value = false
  }
}

// 发射视窗变化事件（用于动态加载地图数据）
const emitBounds = () => {
  if (!map.value) return
  const bounds = map.value.getBounds()
  const zoom = map.value.getZoom()
  emit('boundsChanged', {
    bounds: {
      south: bounds.getSouth(),
      north: bounds.getNorth(),
      west: bounds.getWest(),
      east: bounds.getEast()
    },
    zoom
  })
}

// 添加连续热力图层
const addHeatmapLayer = async () => {
  try {
    if (!map.value) {
      console.log('Map not available for heatmap layer')
      return
    }

    // mode='heatmap' → L.heatLayer with [[lat,lng],...] 点数据
    if (props.mode === 'heatmap' && props.data && props.data.length > 0) {
      // 如果已有热力图层，直接更新数据（moveend 场景）
      if (heatLayer.value && typeof heatLayer.value.setLatLngs === 'function') {
        heatLayer.value.setLatLngs(props.data)
        console.log('Heatmap updated via setLatLngs:', props.data.length, 'points')
        return
      }
      // 否则新建
      if (legendControl.value) { map.value.removeControl(legendControl.value); legendControl.value = null }
      if (heatLayer.value) { map.value.removeLayer(heatLayer.value) }
      if (!L.heatLayer) await loadHeatmapPlugin()
      // weight 是第三个元素，动态取最大值做归一化
      const maxWeight = Math.max(...props.data.map(p => (Array.isArray(p) && p[2]) || 1), 1)
      heatLayer.value = L.heatLayer(props.data, {
        radius: 8,
        blur: 6,
        maxZoom: 15,
        max: maxWeight,
        minOpacity: 0.3,
        gradient: {
          0.2: '#2b8cbe',
          0.4: '#7bccc4',
          0.6: '#f0f9e8',
          0.7: '#fec44f',
          0.85: '#f03b20',
          1.0: '#bd0026'
        }
      })
      heatLayer.value.addTo(map.value)
      addHeatmapLegend()
      console.log('Heatmap layer created with', props.data.length, 'points')
      return
    }

    // 非 heatmap 模式：移除现有图层和图例
    if (legendControl.value) {
      map.value.removeControl(legendControl.value)
      legendControl.value = null
    }
    if (heatLayer.value) {
      map.value.removeLayer(heatLayer.value)
    }

    // mode='clusters' → 圆标记（后端返回聚合对象）
    if (props.mode === 'clusters' && props.data && props.data.length > 0) {
      fallbackToCircleMarkers()
      console.log('Clusters mode: circle markers for', props.data.length, 'points')
      return
    }

    // 检测数据类型
    const hasCoords = props.data && props.data.length > 0 && props.data.some(item =>
      item.lat !== undefined || item.latitude !== undefined
    )

    // mode='points' → 强制用圆标记（分布图场景）
    if (props.mode === 'points' && hasCoords && props.data.length > 0) {
      fallbackToCircleMarkers()
      return
    }

    // 国家聚合数据 → 用比例圆标记（不做热力图）
    if (!hasCoords && props.data && props.data.length > 0) {
      addCountryCircleMarkers()
      return
    }

    // 坐标数据 + auto mode → 用热力图
    // 动态加载热力图插件
    if (!L.heatLayer) {
      await loadHeatmapPlugin()
    }

    // 生成热力图数据点
    const heatPoints = generateContinuousHeatmapData()
    debugInfo.value.heatPoints = heatPoints.length

    console.log('Generated continuous heatmap points:', heatPoints.length)

    if (heatPoints.length > 0) {
      const isLargeMap = props.height > 300

      heatLayer.value = L.heatLayer(heatPoints, {
        radius: isLargeMap ? 15 : 25,
        blur: isLargeMap ? 10 : 15,
        maxZoom: isLargeMap ? 12 : 6,
        gradient: {
          0.0: '#c6dbef',
          0.2: '#9ecae1',
          0.4: '#6baed6',
          0.6: '#3182bd',
          0.8: '#08519c',
          1.0: '#041e42'
        },
        minOpacity: 0.4,
        maxOpacity: 0.7
      })

      heatLayer.value.addTo(map.value)
      console.log('Continuous heatmap layer added with', heatPoints.length, 'data points')

      // 添加图例和信息提示
      addHeatmapLegend()
    } else {
      console.log('No heatmap data to display')
    }

  } catch (error) {
    console.error('Heatmap layer error:', error)
    // fallback: 热力图插件加载失败时使用圆标记
    fallbackToCircleMarkers()
  }
}

// 坐标数据的 fallback：直接用圆标记
const fallbackToCircleMarkers = () => {
  try {
    const layerGroup = L.layerGroup()
    const maxRecords = Math.max(...props.data.map(d => d.records || d.recordCount || 1), 1)

    props.data.forEach(item => {
      const lat = parseFloat(item.lat ?? item.latitude)
      const lng = parseFloat(item.lng ?? item.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const records = item.records || item.recordCount || 1
      const normalizedValue = records / maxRecords
      const radius = Math.max(3, Math.sqrt(normalizedValue) * 12)

      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: '#4292c6',
        fillOpacity: 0.5,
        color: '#08519c',
        weight: 1,
        opacity: 0.7
      })

      if (item.name || item.country) {
        marker.bindTooltip(
          `${item.name || item.country || ''}<br>${records.toLocaleString()} records`,
          { direction: 'top' }
        )
      }

      layerGroup.addLayer(marker)
    })

    heatLayer.value = layerGroup
    layerGroup.addTo(map.value)
    console.log('Fallback circle markers added:', layerGroup.getLayers().length)
  } catch (err) {
    console.error('Fallback circle markers failed:', err)
  }
}

// 国家聚合数据 → 比例圆标记（取代 Gaussian blob 热力图）
const addCountryCircleMarkers = () => {
  const layerGroup = L.layerGroup()
  const maxValue = Math.max(...props.data.map(d => d.value || 0), 1)

  props.data.forEach(item => {
    const coords = getCountryCoords(item.name)
    if (!coords || !item.value) return

    const normalizedValue = item.value / maxValue
    const radius = Math.max(4, Math.sqrt(normalizedValue) * 18)

    const marker = L.circleMarker([coords.lat, coords.lng], {
      radius: radius,
      fillColor: '#4292c6',
      fillOpacity: 0.55,
      color: '#08519c',
      weight: 1,
      opacity: 0.8
    })

    marker.bindTooltip(
      `<strong>${item.name}</strong><br>${item.value.toLocaleString()} records`,
      { direction: 'top', offset: [0, -radius] }
    )

    layerGroup.addLayer(marker)
  })

  heatLayer.value = layerGroup
  layerGroup.addTo(map.value)
  debugInfo.value.heatPoints = props.data.length
  console.log('Country circle markers added:', props.data.length)
}

// 加载热力图插件
const loadHeatmapPlugin = () => {
  return new Promise((resolve, reject) => {
    if (typeof L.heatLayer !== 'undefined') {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js'
    script.onload = () => {
      console.log('Heatmap plugin loaded successfully')
      resolve()
    }
    script.onerror = () => {
      console.error('Failed to load heatmap plugin')
      reject(new Error('Failed to load heatmap plugin'))
    }
    document.head.appendChild(script)
  })
}

// 生成连续热力图数据
const generateContinuousHeatmapData = () => {
  const heatPoints = []

  if (!props.data || props.data.length === 0) {
    return heatPoints
  }

  // 检测数据类型：坐标数据(lat/lng) vs 国家聚合数据(name/value)
  const hasCoords = props.data.some(item =>
    (item.lat !== undefined && item.lng !== undefined) ||
    (item.latitude !== undefined && item.longitude !== undefined)
  )

  if (hasCoords) {
    // 直接使用坐标数据生成热力点（用于分布地图）
    props.data.forEach(item => {
      const lat = parseFloat(item.lat || item.latitude)
      const lng = parseFloat(item.lng || item.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        const intensity = Math.min((item.records || item.recordCount || 1) / 10, 1)
        heatPoints.push([lat, lng, intensity])
      }
    })
  } else {
    // 国家聚合数据（name/value 格式，用于概览热力图）
    props.data.forEach(item => {
      const coords = getCountryCoords(item.name)
      if (coords && item.value > 0) {
        const normalizedIntensity = Math.min(item.value / 15000, 1)

        const numPoints = Math.max(8, Math.min(30, Math.ceil(item.value / 500)))
        const spread = Math.max(2, Math.min(8, 2 + normalizedIntensity * 6))

        for (let i = 0; i < numPoints; i++) {
          const angle = Math.random() * 2 * Math.PI
          const distance = Math.sqrt(-2 * Math.log(Math.random())) * spread / 3

          const lat = coords.lat + Math.cos(angle) * distance
          const lng = coords.lng + Math.sin(angle) * distance

          const distanceFactor = Math.max(0.3, 1 - (distance / spread))
          const pointIntensity = normalizedIntensity * distanceFactor

          heatPoints.push([lat, lng, pointIntensity])
        }

        heatPoints.push([coords.lat, coords.lng, normalizedIntensity])
      }
    })
  }

  return heatPoints
}

// 添加热力图图例
const addHeatmapLegend = () => {
  if (!map.value) return
  if (legendControl.value) {
    map.value.removeControl(legendControl.value)
    legendControl.value = null
  }
  const legend = L.control({ position: 'bottomright' })
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'heatmap-legend')
    div.innerHTML = `
      <div class="legend-title">Record Density</div>
      <div class="legend-gradient" style="background: linear-gradient(to right, #2b8cbe, #7bccc4, #fec44f, #f03b20, #bd0026)"></div>
      <div class="legend-labels">
        <span>Low</span>
        <span>High</span>
      </div>
    `
    return div
  }
  legend.addTo(map.value)
  legendControl.value = legend
}

// 在地图右侧叠加 Hotspot 面板
const hotspotColors = ['#e6550d', '#3182bd', '#31a354', '#756bb1', '#636363']
const addHotspotsOverlay = () => {
  if (!map.value) return

  // 移除旧控件
  if (hotspotsControl.value) {
    map.value.removeControl(hotspotsControl.value)
    hotspotsControl.value = null
  }

  if (!props.hotspots || props.hotspots.length === 0) return

  const ctrl = L.control({ position: 'topright' })
  ctrl.onAdd = function () {
    const div = L.DomUtil.create('div', 'hotspots-overlay')
    L.DomEvent.disableClickPropagation(div)
    const rows = props.hotspots.map((h, i) => {
      const c = hotspotColors[i % hotspotColors.length]
      const rec = (h.records || 0).toLocaleString()
      return `<div class="hs-row"><span class="hs-dot" style="background:${c}"></span><span class="hs-name">${h.name}</span><span class="hs-count">${rec}</span></div>`
    }).join('')
    div.innerHTML = `<div class="hs-title">Hotspots</div>${rows}`
    return div
  }
  ctrl.addTo(map.value)
  hotspotsControl.value = ctrl
}

// 备用方案：点标记显示
const fallbackToPointMarkers = () => {
  try {
    // 创建图层组
    heatLayer.value = L.layerGroup()

    // 创建点状标记分布
    const pointData = generatePointMarkers()
    
    pointData.forEach((point) => {
      const { lat, lng, count, name, intensity } = point
      
      if (lat && lng) {
        // 创建小的圆形点标记
        const pointMarker = L.circleMarker([lat, lng], {
          radius: Math.max(3, Math.min(10, 3 + Math.sqrt(count / 100))),
          fillColor: getPointColor(count),
          color: getPointBorderColor(count),
          weight: 1,
          fillOpacity: 0.7,
          opacity: 0.8,
          className: 'distribution-point'
        })

        pointMarker.bindTooltip(`${name}<br><strong>Records:</strong> ${count}`, {
          permanent: false,
          direction: 'top'
        })

        heatLayer.value.addLayer(pointMarker)
      }
    })

    if (heatLayer.value.getLayers().length > 0) {
      heatLayer.value.addTo(map.value)
      console.log('Fallback point markers added:', heatLayer.value.getLayers().length)
    }

  } catch (error) {
    console.error('Fallback point markers error:', error)
  }
}

// 生成热力图数据点
const generateHeatmapPoints = () => {
  const heatPoints = []
  
  if (props.data && props.data.length > 0) {
    // 使用真实数据生成热力图点
    props.data.forEach(item => {
      const coords = getCountryCoords(item.name)
      if (coords) {
        const intensity = Math.min(item.value / 10000, 1) // 标准化强度值
        
        // 为每个国家生成多个点以表示分布密度
        const numPoints = Math.max(5, Math.min(20, Math.ceil(item.value / 500)))
        
        for (let i = 0; i < numPoints; i++) {
          // 在国家中心周围随机分布点
          const offsetLat = (Math.random() - 0.5) * 6 // ±3度范围
          const offsetLng = (Math.random() - 0.5) * 6
          
          const lat = coords.lat + offsetLat
          const lng = coords.lng + offsetLng
          
          // 添加一些变化到强度值
          const pointIntensity = intensity * (0.5 + Math.random() * 0.5)
          
          heatPoints.push([lat, lng, pointIntensity])
        }
      }
    })
  }
  
  return heatPoints
}

// 生成大面积热力图区域
const generateLargeHeatmapRegions = () => {
  const heatRegions = []
  
  if (props.data && props.data.length > 0) {
    // 使用真实数据生成大面积热力图区域
    props.data.forEach(item => {
      const coords = getCountryCoords(item.name)
      if (coords) {
        const intensity = Math.min(item.value / 10000, 1)
        const radius = Math.max(3, Math.min(8, 2 + intensity * 6)) // 3-8度半径
        
        heatRegions.push({
          center: coords,
          radius: radius,
          intensity: intensity,
          name: item.name
        })
      }
    })
  }
  
  return heatRegions
}

// 生成点状标记数据
const generatePointMarkers = () => {
  const pointMap = new Map() // 用于合并重复坐标
  
  console.log('Generating point markers from props.data:', props.data)
  console.log('First item structure:', props.data[0])
  
  if (props.data && props.data.length > 0) {
    // 检查数据是否包含真实坐标 (lat/lng fields)
    const hasRealCoords = props.data.some(item => 
      (item.lat !== undefined && item.lng !== undefined) || 
      (item.latitude !== undefined && item.longitude !== undefined)
    )
    
    console.log('Data has real coordinates:', hasRealCoords)
    
    if (hasRealCoords) {
      // 使用真实坐标数据
      props.data.forEach(item => {
        const lat = item.lat || item.latitude
        const lng = item.lng || item.longitude
        const name = item.name || item.locality || item.country || `${lat},${lng}`
        const recordCount = item.records || item.recordCount || 1
        
        if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
          const key = `${Math.round(lat * 1000) / 1000},${Math.round(lng * 1000) / 1000}` // 精确到3位小数
          
          if (pointMap.has(key)) {
            // 合并相同坐标的记录
            const existing = pointMap.get(key)
            existing.count += recordCount
            existing.name = existing.name.includes(name) ? existing.name : `${existing.name}, ${name}`
          } else {
            pointMap.set(key, {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              count: recordCount,
              name: name,
              intensity: Math.min(recordCount / 100, 1)
            })
          }
        }
      })
    } else {
      // 回退到基于国家名称的逻辑
      props.data.forEach(item => {
        const name = item.name || item.country || item.countryName || item.location
        const recordCount = item.value || item.records || item.recordCount || 1
        
        console.log('Processing country data item:', { name, recordCount })
        
        const coords = getCountryCoords(name)
        if (coords) {
          // 为每个国家生成多个分散的点
          const numPoints = Math.max(3, Math.min(15, Math.ceil(recordCount / 100)))
          
          for (let i = 0; i < numPoints; i++) {
            const offsetLat = (Math.random() - 0.5) * 4
            const offsetLng = (Math.random() - 0.5) * 4
            
            const lat = Math.round((coords.lat + offsetLat) * 100) / 100
            const lng = Math.round((coords.lng + offsetLng) * 100) / 100
            
            const key = `${lat},${lng}`
            const pointRecords = Math.ceil(recordCount / numPoints)
            
            if (pointMap.has(key)) {
              const existing = pointMap.get(key)
              existing.count += pointRecords
              existing.name = existing.name.includes(name) ? existing.name : `${existing.name}, ${name}`
            } else {
              pointMap.set(key, {
                lat: lat,
                lng: lng,
                count: pointRecords,
                name: name,
                intensity: Math.min(recordCount / 1000, 1)
              })
            }
          }
        }
      })
    }
  }
  
  return Array.from(pointMap.values())
}

// 生成曲线型物种分布范围数据
const generateCurvedRangeData = () => {
  const rangeRegions = []
  
  if (props.data && props.data.length > 0) {
    // 使用真实数据生成连续的范围区域
    props.data.forEach(item => {
      const polygon = generateCountryRangePolygon(item.name, item.value)
      if (polygon) {
        const intensity = Math.min(item.value / 10000, 1)
        rangeRegions.push({
          polygon: polygon,
          intensity: intensity,
          name: item.name
        })
      }
    })
  }
  
  return rangeRegions
}

// 生成亚马逊流域的平滑曲线边界
const generateAmazonPolygon = () => {
  const center = { lat: -8, lng: -60 }
  return generateSmoothCurvedBoundary(center, 8, 2000)
}

// 生成五大湖的平滑曲线边界
const generateGreatLakesPolygon = () => {
  const center = { lat: 45, lng: -85 }
  return generateSmoothCurvedBoundary(center, 4, 1500)
}

// 生成湄公河流域平滑曲线边界
const generateMekongPolygon = () => {
  const center = { lat: 16, lng: 104 }
  return generateSmoothCurvedBoundary(center, 6, 1800)
}

// 生成欧洲河流网络平滑曲线边界
const generateEuropeanPolygon = () => {
  const center = { lat: 48, lng: 8 }
  return generateSmoothCurvedBoundary(center, 5, 1200)
}

// 生成非洲河流系统平滑曲线边界
const generateAfricanPolygon = () => {
  const center = { lat: 5, lng: 25 }
  return generateSmoothCurvedBoundary(center, 7, 1600)
}

// 生成澳洲东海岸平滑曲线边界
const generateAustralianPolygon = () => {
  const center = { lat: -25, lng: 145 }
  return generateSmoothCurvedBoundary(center, 4, 1000)
}

// 根据国家生成平滑曲线边界（真实数据）
const generateCountryRangePolygon = (countryName, recordCount) => {
  const predefinedPolygon = getCountryRangePolygon(countryName)
  if (predefinedPolygon) {
    return predefinedPolygon
  }
  
  const baseCoords = getCountryCoords(countryName)
  if (!baseCoords) return null
  
  // 根据记录数量生成动态的曲线范围
  const intensity = Math.min(recordCount / 5000, 1)
  const rangeSize = 1.5 + (intensity * 3) // 1.5-4.5度的范围
  
  // 生成平滑的有机曲线形状
  return generateSmoothCurvedBoundary(baseCoords, rangeSize, recordCount)
}

// 生成超级平滑的有机曲线边界
const generateSmoothCurvedBoundary = (center, size, complexity = 1000) => {
  // 增加控制点数量以获得更平滑的曲线
  const numControlPoints = Math.max(12, Math.min(24, Math.ceil(complexity / 400)))
  
  // 生成控制点，形成流动的有机形状
  const controlPoints = []
  for (let i = 0; i < numControlPoints; i++) {
    const angle = (i / numControlPoints) * 2 * Math.PI
    
    // 使用多层噪声创建更自然的变化
    const baseVariation = 0.75 + Math.sin(angle * 3) * 0.15 // 基础三波变化
    const secondaryVariation = Math.sin(angle * 5) * 0.08 // 二级五波变化
    const randomVariation = (Math.random() - 0.5) * 0.1 // 随机变化
    const distanceVariation = Math.max(0.4, baseVariation + secondaryVariation + randomVariation)
    
    // 减少角度噪声，保持更流畅的曲线
    const angleNoise = (Math.random() - 0.5) * 0.15 // 减少角度噪声
    
    const adjustedAngle = angle + angleNoise
    const distance = size * distanceVariation
    
    const lat = center.lat + Math.cos(adjustedAngle) * distance
    const lng = center.lng + Math.sin(adjustedAngle) * distance
    
    controlPoints.push([lat, lng])
  }
  
  // 使用更高分辨率的样条插值生成超平滑曲线
  const smoothPoints = []
  const resolution = 64 // 大幅提高分辨率
  
  for (let i = 0; i < controlPoints.length; i++) {
    const p0 = controlPoints[(i - 1 + controlPoints.length) % controlPoints.length]
    const p1 = controlPoints[i]
    const p2 = controlPoints[(i + 1) % controlPoints.length]
    const p3 = controlPoints[(i + 2) % controlPoints.length]
    
    // 使用改进的Catmull-Rom样条生成超平滑曲线段
    for (let t = 0; t < 1; t += 1 / resolution) {
      const point = enhancedCatmullRomSpline(p0, p1, p2, p3, t)
      smoothPoints.push(point)
    }
  }
  
  // 应用额外的平滑处理
  const finalPoints = applyAdditionalSmoothing(smoothPoints)
  
  // 闭合曲线
  if (finalPoints.length > 0) {
    finalPoints.push(finalPoints[0])
  }
  
  return finalPoints
}

// 增强版Catmull-Rom样条插值函数，提供更平滑的曲线
const enhancedCatmullRomSpline = (p0, p1, p2, p3, t) => {
  // 使用改进的张力参数获得更自然的曲线
  const tension = 0.5 // 张力系数，0.5为标准Catmull-Rom
  const t2 = t * t
  const t3 = t2 * t
  
  // 计算切线向量，使用改进的权重
  const v0 = [(p2[0] - p0[0]) * tension, (p2[1] - p0[1]) * tension]
  const v1 = [(p3[0] - p1[0]) * tension, (p3[1] - p1[1]) * tension]
  
  // Hermite插值系数
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 = t3 - t2
  
  const lat = h00 * p1[0] + h10 * v0[0] + h01 * p2[0] + h11 * v1[0]
  const lng = h00 * p1[1] + h10 * v0[1] + h01 * p2[1] + h11 * v1[1]
  
  return [lat, lng]
}

// 原始Catmull-Rom样条插值函数（保留作为备用）
const catmullRomSpline = (p0, p1, p2, p3, t) => {
  const t2 = t * t
  const t3 = t2 * t
  
  const lat = 0.5 * (
    (2 * p1[0]) +
    (-p0[0] + p2[0]) * t +
    (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
    (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
  )
  
  const lng = 0.5 * (
    (2 * p1[1]) +
    (-p0[1] + p2[1]) * t +
    (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
    (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
  )
  
  return [lat, lng]
}

// 应用额外平滑处理，进一步消除尖锐角度
const applyAdditionalSmoothing = (points) => {
  if (points.length < 3) return points
  
  const smoothed = []
  const smoothingRadius = 3 // 平滑半径
  
  for (let i = 0; i < points.length; i++) {
    let avgLat = 0
    let avgLng = 0
    let count = 0
    
    // 计算周围点的加权平均值
    for (let j = -smoothingRadius; j <= smoothingRadius; j++) {
      const index = (i + j + points.length) % points.length
      const weight = 1 - Math.abs(j) / (smoothingRadius + 1) // 距离权重
      
      avgLat += points[index][0] * weight
      avgLng += points[index][1] * weight
      count += weight
    }
    
    // 与原始点混合，保持形状的同时增加平滑度
    const blendFactor = 0.7 // 70%平滑，30%原始
    const smoothedLat = (avgLat / count) * blendFactor + points[i][0] * (1 - blendFactor)
    const smoothedLng = (avgLng / count) * blendFactor + points[i][1] * (1 - blendFactor)
    
    smoothed.push([smoothedLat, smoothedLng])
  }
  
  return smoothed
}

// 获取国家坐标
const getCountryCoords = (countryName) => {
  const coords = {
    // 基础国家
    'USA': { lat: 39, lng: -98 },
    'US': { lat: 39, lng: -98 },
    'United States': { lat: 39, lng: -98 },
    'Canada': { lat: 60, lng: -95 },
    'Brazil': { lat: -14, lng: -51 },
    'Colombia': { lat: 4, lng: -74 },
    'Mexico': { lat: 23, lng: -102 },
    'MX': { lat: 23, lng: -102 },
    'Argentina': { lat: -38, lng: -63 },
    'UK': { lat: 55, lng: -3 },
    'France': { lat: 46, lng: 2 },
    'Germany': { lat: 51, lng: 10 },
    'Spain': { lat: 40, lng: -3 },
    'Japan': { lat: 36, lng: 138 },
    'JP': { lat: 36, lng: 138 },
    'China': { lat: 35, lng: 104 },
    'Australia': { lat: -25, lng: 133 },
    'India': { lat: 20, lng: 77 },
    
    // 太平洋岛屿国家
    'Palau': { lat: 7.5, lng: 134.5 },
    'Philippines': { lat: 13, lng: 122 },
    'Marshall Islands': { lat: 7, lng: 171 },
    'Maldives': { lat: 3.2, lng: 73.2 },
    'Hawaiian Islands': { lat: 21.3, lng: -157.8 },
    'Society Islands': { lat: -17.5, lng: -149.5 },
    'Solomon Islands': { lat: -9.6, lng: 160.2 },
    'Vanuatu': { lat: -16, lng: 167 },
    'Papua New Guinea': { lat: -6.3, lng: 143.9 },
    'Fiji': { lat: -16.7, lng: 179.4 },
    'FJ': { lat: -16.7, lng: 179.4 },
    
    // 加勒比海和大西洋
    'Bermuda': { lat: 32.3, lng: -64.8 },
    'Jamaica': { lat: 18.1, lng: -77.3 },
    'Bahamas': { lat: 25.0, lng: -77.4 },
    'BS': { lat: 25.0, lng: -77.4 },
    'Panama': { lat: 8.4, lng: -80.1 },
    'Belize': { lat: 17.2, lng: -88.5 },
    'Costa Rica': { lat: 9.7, lng: -83.8 },
    'Honduras': { lat: 15.2, lng: -86.2 },
    'Guatemala': { lat: 15.8, lng: -90.2 },
    
    // 其他国家代码
    'United Kingdom': { lat: 55, lng: -3 },
    'New Zealand': { lat: -40.9, lng: 174.9 },
    'South Africa': { lat: -30.6, lng: 22.9 },
    'Indonesia': { lat: -0.8, lng: 113.9 },
    'Malaysia': { lat: 4.2, lng: 101.9 },
    'Thailand': { lat: 15.9, lng: 100.9 },
    'Vietnam': { lat: 14.1, lng: 108.3 },
    'South Korea': { lat: 35.9, lng: 127.8 },
    'Taiwan': { lat: 23.7, lng: 120.9 },
    
    // 地区性描述
    'Other Regions': { lat: 0, lng: 0 }, // 可以设为赤道
    'North America': { lat: 45, lng: -100 },
    'Asia-Pacific': { lat: 10, lng: 120 },
    'South America': { lat: -15, lng: -60 },
    'Africa': { lat: 0, lng: 20 },
    'Europe': { lat: 50, lng: 10 }
  }
  
  console.log('Looking up coordinates for:', countryName, '-> Found:', coords[countryName])
  return coords[countryName] || null
}

// 获取国家的范围多边形（简化版本）
const getCountryRangePolygon = (countryName) => {
  const countryPolygons = {
    'USA': [[49, -125], [25, -80], [30, -95], [45, -120]],
    'Brazil': [[5, -75], [-30, -35], [-25, -60], [-5, -75]],
    'Canada': [[70, -140], [45, -60], [60, -140]],
    'Colombia': [[12, -80], [-4, -67], [1, -75], [10, -75]],
    'Mexico': [[32, -117], [14, -87], [20, -105], [28, -110]]
  }
  return countryPolygons[countryName] || null
}

// 根据强度获取范围颜色
const getRangeColor = (intensity) => {
  if (intensity > 0.8) return '#1565c0' // 深蓝色 (高密度)
  if (intensity > 0.6) return '#1976d2' // 蓝色
  if (intensity > 0.4) return '#42a5f5' // 浅蓝色
  if (intensity > 0.2) return '#90caf9' // 很浅蓝色
  return '#e3f2fd' // 极浅蓝色 (低密度)
}

// 根据强度获取范围透明度
const getRangeOpacity = (intensity) => {
  return 0.4 + (intensity * 0.5) // 0.4到0.9的透明度范围
}

// 根据强度获取密度文本
const getRangeDensityText = (intensity) => {
  if (intensity > 0.8) return 'Very High'
  if (intensity > 0.6) return 'High' 
  if (intensity > 0.4) return 'Medium'
  if (intensity > 0.2) return 'Low'
  return 'Very Low'
}

// 热力图专用颜色函数
const getHeatmapColor = (intensity) => {
  // 使用蓝色系渐变，从深蓝到浅蓝
  if (intensity > 0.8) return '#08519c' // 最深蓝
  if (intensity > 0.6) return '#3182bd' // 深蓝
  if (intensity > 0.4) return '#6baed6' // 中蓝
  if (intensity > 0.2) return '#9ecae1' // 浅蓝
  return '#c6dbef' // 最浅蓝
}

// 热力图透明度
const getHeatmapOpacity = (intensity) => {
  return Math.max(0.2, Math.min(0.8, intensity * 0.8 + 0.2)) // 0.2到0.8的范围
}

// 热力图密度文本
const getHeatmapDensityText = (intensity) => {
  const percentage = Math.round(intensity * 100)
  if (intensity > 0.8) return `Very High (${percentage}%)`
  if (intensity > 0.6) return `High (${percentage}%)`
  if (intensity > 0.4) return `Medium (${percentage}%)`
  if (intensity > 0.2) return `Low (${percentage}%)`
  return `Very Low (${percentage}%)`
}

// 点标记颜色函数（根据记录数量）
const getPointColor = (count) => {
  if (count >= 1500) return '#08519c' // 深蓝色 - 很多记录
  if (count >= 1000) return '#2171b5' // 蓝色
  if (count >= 500) return '#4292c6'  // 中蓝色
  if (count >= 200) return '#6baed6'  // 浅蓝色
  return '#9ecae1' // 很浅蓝色 - 少量记录
}

// 点标记边框颜色（重复坐标时加深）
const getPointBorderColor = (count) => {
  if (count >= 1500) return '#041e42' // 最深蓝色边框
  if (count >= 1000) return '#08519c'
  if (count >= 500) return '#2171b5'
  if (count >= 200) return '#4292c6'
  return '#6baed6'
}

// 点标记透明度
const getPointOpacity = (count) => {
  return Math.max(0.6, Math.min(1.0, 0.6 + (count / 2000) * 0.4)) // 0.6到1.0的范围
}

// 生命周期
onMounted(() => {
  setTimeout(initMap, 100)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// 监听数据变化
watch(() => props.data, () => {
  if (map.value) {
    addHeatmapLayer()
  }
}, { deep: true })

// 监听 hotspots 变化（数据异步加载后重新渲染控件）
watch(() => props.hotspots, () => {
  if (map.value) {
    addHotspotsOverlay()
  }
}, { deep: true })
</script>

<style scoped>
@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

.compact-heatmap-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  min-width: 300px; /* 确保最小宽度 */
  width: 100%;
}

.compact-map-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 300px; /* 确保最小宽度 */
}

.compact-leaflet-map {
  width: 100%;
  height: 100%;
  background: #f0f8ff;
  min-width: 300px; /* 确保最小宽度 */
}

.compact-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  font-size: 12px;
  color: #666;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.compact-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  text-align: center;
  z-index: 1000;
}

.debug-info {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 9px;
  z-index: 1000;
  line-height: 1.2;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 热力图图例样式 */
:deep(.heatmap-legend) {
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 11px;
  min-width: 80px;
}

:deep(.legend-title) {
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
  color: #333;
}

:deep(.legend-gradient) {
  height: 12px;
  background: linear-gradient(to right, 
    #c6dbef 0%, 
    #9ecae1 20%, 
    #6baed6 40%, 
    #3182bd 60%, 
    #08519c 80%, 
    #041e42 100%
  );
  border-radius: 2px;
  margin: 2px 0;
}

:deep(.legend-labels) {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

/* 大地图显示缩放控件，小地图隐藏 */
:deep(.leaflet-control-zoom) {
  /* zoom control visibility is handled by Leaflet zoomControl option */
}

:deep(.leaflet-control-attribution) {
  display: none;
}

/* Hotspots overlay */
:deep(.hotspots-overlay) {
  background: rgba(255, 255, 255, 0.92);
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 11px;
  line-height: 1;
  min-width: 120px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
:deep(.hs-title) {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
:deep(.hs-row) {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
}
:deep(.hs-dot) {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
:deep(.hs-name) {
  flex: 1;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}
:deep(.hs-count) {
  color: #888;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .compact-heatmap-container {
    border-radius: 4px;
  }
}
</style>