import './assets/main.css'
import 'leaflet/dist/leaflet.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createAuthGuard } from '@/utils/auth.js'
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import {
    CanvasRenderer
} from 'echarts/renderers'
import {
    PieChart,
    BarChart
} from 'echarts/charts'
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from 'echarts/components'

use([
    CanvasRenderer,
    PieChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
])

// 设置认证守卫
createAuthGuard(router)

createApp(App).use(router).use(ElementPlus).component('v-chart', ECharts).mount('#app')
