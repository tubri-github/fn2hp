import { createRouter, createWebHistory } from "vue-router";
import { browseRoutes } from "@/router/browse.js";
import HomePage from "../components/HomePage.vue"; // 引入页面组件
import BrowseView from "../components/BrowseNew/BrowseView.vue";
import AllFamilies from "@/views/browse/AllFamilies.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomePage, // 首页组件
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/search/SearchPage.vue'),
        meta: {
            title: 'Advanced Search',
            description: 'Search fish occurrence records with advanced filters'
        }
    },
    {
        path: '/browse',
        name: 'Browse',
        redirect: '/browse/families'
    },
    {
        path: '/browse/families',
        name: 'AllFamilies',
        component: AllFamilies,
        meta: {
            title: 'Browse All Fish Families',
            description: 'Explore taxonomic diversity across all fish families'
        }
    },
    {
        path: '/browse/families/:familyName',
        name: 'FamilyDetail',
        component: () => import('@/views/browse/TaxonPage.vue'),
        props: route => ({
            taxonType: 'family',
            taxonName: route.params.familyName
        }),
        meta: {
            title: 'Family Details',
            description: 'Detailed information about fish family'
        }
    },
    {
        path: '/browse/genera',
        name: 'AllGenera',
        component: () => import('@/views/browse/AllGenera.vue'),
        meta: {
            title: 'Browse All Fish Genera',
            description: 'Explore all fish genera in the database'
        }
    },
    {
        path: '/browse/genera/:genusName',
        name: 'GenusDetail',
        component: () => import('@/views/browse/TaxonPage.vue'),
        props: route => ({
            taxonType: 'genus',
            taxonName: route.params.genusName
        }),
        meta: {
            title: 'Genus Details',
            description: 'Detailed information about fish genus'
        }
    },
    {
        path: '/browse/species',
        name: 'AllSpecies',
        component: () => import('@/views/browse/AllSpecies.vue'),
        meta: {
            title: 'Browse All Fish Species',
            description: 'Search and explore all fish species'
        }
    },
    {
        path: '/browse/species/:scientificName',
        name: 'SpeciesDetail',
        component: () => import('@/views/browse/TaxonPage.vue'),
        props: route => ({
            taxonType: 'species',
            taxonName: decodeURIComponent(route.params.scientificName)
        }),
        meta: {
            title: 'Species Details',
            description: 'Detailed information about fish species'
        }
    },
    {
        path: '/browse/providers',
        name: 'AllProviders',
        component: () => import('@/views/browse/AllInstitutions.vue'),
        meta: {
            title: 'Browse All Data Providers',
            description: 'Explore data providers and their collections'
        }
    },
    {
        path: '/browse/providers/:institutionCode',
        name: 'ProviderDetail',
        component: () => import('@/views/browse/InstitutionPage.vue'),
        props: route => ({
            institutionCode: route.params.institutionCode
        }),
        meta: {
            title: 'Provider Details',
            description: 'Detailed information about data provider'
        }
    },
    // About Page
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/about/AboutPage.vue'),
        meta: {
            title: 'About FishNet',
            description: 'About the FishNet portal'
        }
    },
    // Teams Page
    {
        path: '/teams',
        name: 'Teams',
        component: () => import('@/views/about/TeamsPage.vue'),
        meta: {
            title: 'Teams',
            description: 'FishNet 2 project teams and members'
        }
    },
    // Collaborations Page
    {
        path: '/collaborations',
        name: 'Collaborations',
        component: () => import('@/views/about/CollaborationsPage.vue'),
        meta: {
            title: 'Collaborations',
            description: 'FishNet 2 collaborations and partner networks'
        }
    },
    // Dashboard Routes - 需要登录认证
    {
        path: '/dashboard',
        name: 'Dashboard',
        redirect: '/dashboard/user',
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/dashboard/user',
        name: 'UserDashboard',
        component: () => import('@/views/dashboard/UserDashboard.vue'),
        meta: {
            title: 'User Dashboard',
            description: 'User Data Center',
            requiresAuth: true
        }
    },
    {
        path: '/dashboard/provider',
        name: 'ProviderDashboard', 
        component: () => import('@/views/dashboard/ProviderDashboard.vue'),
        meta: {
            title: 'Data Provider Dashboard',
            description: 'Data Provider Data Center',
            requiresAuth: true,
            permissions: ['project.admin', 'data.manage', 'data.upload'] // 需要管理员或数据管理权限
        }
    },
    
    // Tools Routes
    {
        path: '/tools',
        name: 'Tools',
        redirect: '/tools/outlier-detector',
        meta: {
            title: 'Analysis Tools',
            description: 'GIS Analysis and Data Processing Tools'
        }
    },
    {
        path: '/tools/outlier-detector',
        name: 'OutlierDetector',
        component: () => import('@/views/tools/OutlierDetector.vue'),
        meta: {
            title: 'Outlier Detector',
            description: 'Species River Distribution Outlier Analysis Tool'
        }
    },
    
    // 用户相关页面
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
            title: 'User Profile',
            description: 'User Profile Settings',
            requiresAuth: true
        }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/user/Settings.vue'),
        meta: {
            title: 'Settings',
            description: 'Application Settings',
            requiresAuth: true
        }
    },
    
    // 认证回调
    {
        path: '/gate/callback',
        name: 'GateCallback',
        component: () => import('@/views/auth/AuthCallback.vue'),
        meta: {
            title: 'Processing',
            description: 'Processing...'
        }
    },
    
    // 错误页面
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: {
            title: 'Access Denied',
            description: 'Insufficient permissions'
        }
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: () => import('@/views/error/401.vue'),
        meta: {
            title: 'Authentication Required',
            description: 'Please sign in to continue'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: {
            title: 'Page Not Found',
            description: 'The page you are looking for does not exist'
        }
    }
    // {
    //     path: '/browse/:type',
    //     name: 'Browse',
    //     component: BrowseView
    // }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.PROD ? '/dist/' : '/'),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else if (to.hash) {
            return { el: to.hash, behavior: 'smooth' }
        } else {
            return { top: 0 }
        }
    }
});

export default router;
