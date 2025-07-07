
// src/router/browse.js
export const browseRoutes = [
    {
        path: '/browse',
        name: 'Browse',
        redirect: '/browse/families'
    },
    {
        path: '/browse/families',
        name: 'AllFamilies',
        component: () => import('@/views/browse/AllFamilies.vue'),
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
    // {
    //     path: '/browse/species',
    //     name: 'AllSpecies',
    //     component: () => import('@/views/browse/AllSpecies.vue'),
    //     meta: {
    //         title: 'Browse All Fish Species',
    //         description: 'Search and explore all fish species'
    //     }
    // },
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
    // {
    //     path: '/browse/institutions',
    //     name: 'AllInstitutions',
    //     component: () => import('@/views/browse/AllInstitutions.vue'),
    //     meta: {
    //         title: 'Browse All Contributing Institutions',
    //         description: 'Explore data providers and their collections'
    //     }
    // },
    {
        path: '/browse/institutions/:institutionCode',
        name: 'InstitutionDetail',
        component: () => import('@/views/browse/InstitutionPage.vue'),
        props: route => ({
            institutionCode: route.params.institutionCode
        }),
        meta: {
            title: 'Institution Details',
            description: 'Detailed information about contributing institution'
        }
    }
]