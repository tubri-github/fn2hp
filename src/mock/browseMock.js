// browseMock.js
export const taxonomyData = {
    family: [
        {
            id: 'f1',
            name: 'Cyprinidae',
            type: 'family',
            description: 'The largest family of freshwater fish, including carps and minnows',
            children: [
                'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10',
                'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20',
                'g21', 'g22', 'g23', 'g24', 'g25', 'g26', 'g27', 'g28', 'g29', 'g30'
            ]
        },
        {
            id: 'f2',
            name: 'Cichlidae',
            type: 'family',
            description: 'A diverse family of freshwater fish, including cichlids and tilapias',
            children: ['g31', 'g32']
        },
        {
            id: 'f3',
            name: 'Ictaluridae',
            type: 'family',
            description: 'North American catfish family',
            children: ['g33']
        }
    ],

    genus: {
        g1: {
            id: 'g1',
            name: 'Cyprinus',
            type: 'genus',
            parentId: 'f1',
            description: 'Genus of freshwater fish including common carp',
            children: ['s1', 's2', 's3']
        },
        g2: {
            id: 'g2',
            name: 'Carassius',
            type: 'genus',
            parentId: 'f1',
            description: 'Genus including goldfish and crucian carp',
            children: ['s4', 's5']
        },
        g3: {
            id: 'g3',
            name: 'Danio',
            type: 'genus',
            parentId: 'f1',
            description: 'Small freshwater fish including zebrafish',
            children: ['s6', 's7']
        },
        g4: {
            id: 'g4',
            name: 'Labeo',
            type: 'genus',
            parentId: 'f1',
            description: 'Genus including freshwater sharks like the red-tailed black shark',
            children: ['s8']
        },
        g5: {
            id: 'g5',
            name: 'Oreochromis',
            type: 'genus',
            parentId: 'f2',
            description: 'A genus of tilapia species, widely cultivated for food',
            children: ['s9', 's10']
        },
        g6: { id: 'g6', name: 'Puntius', type: 'genus', parentId: 'f1', description: 'Barbs, often used in aquariums' },
        g7: { id: 'g7', name: 'Rasbora', type: 'genus', parentId: 'f1', description: 'Popular aquarium fish' },
        g8: { id: 'g8', name: 'Esomus', type: 'genus', parentId: 'f1', description: 'Flying barbs' },
        g9: { id: 'g9', name: 'Osteobrama', type: 'genus', parentId: 'f1', description: 'Indigenous freshwater fish' },
        g10: { id: 'g10', name: 'Tor', type: 'genus', parentId: 'f1', description: 'Mahseer fish' },
        g11: { id: 'g11', name: 'Acrossocheilus', type: 'genus', parentId: 'f1', description: 'Chinese barbs' },
        g12: { id: 'g12', name: 'Pethia', type: 'genus', parentId: 'f1', description: 'Small colorful barbs' },
        g13: { id: 'g13', name: 'Balantiocheilos', type: 'genus', parentId: 'f1', description: 'Bala shark' },
        g14: { id: 'g14', name: 'Chagunius', type: 'genus', parentId: 'f1', description: 'South Asian freshwater fish' },
        g15: { id: 'g15', name: 'Leptobarbus', type: 'genus', parentId: 'f1', description: 'Giant barbs' },
        g16: { id: 'g16', name: 'Scaphiodonichthys', type: 'genus', parentId: 'f1', description: 'Rare cyprinids' },
        g17: { id: 'g17', name: 'Epalzeorhynchos', type: 'genus', parentId: 'f1', description: 'Rainbow sharks' },
        g18: { id: 'g18', name: 'Neolissochilus', type: 'genus', parentId: 'f1', description: 'Asian mountain fish' },
        g19: { id: 'g19', name: 'Discherodontus', type: 'genus', parentId: 'f1', description: 'Little-known cyprinids' },
        g20: { id: 'g20', name: 'Spinibarbus', type: 'genus', parentId: 'f1', description: 'Large-scaled cyprinids' },
        g21: { id: 'g21', name: 'Schizothorax', type: 'genus', parentId: 'f1', description: 'Snow trouts' },
        g22: { id: 'g22', name: 'Sinocyclocheilus', type: 'genus', parentId: 'f1', description: 'Blind cave fish' },
        g23: { id: 'g23', name: 'Opsariichthys', type: 'genus', parentId: 'f1', description: 'Asian stream fish' },
        g24: { id: 'g24', name: 'Barbonymus', type: 'genus', parentId: 'f1', description: 'Tinfoil barbs' },
        g25: { id: 'g25', name: 'Leptobarbus', type: 'genus', parentId: 'f1', description: 'Southeast Asian large barbs' },
        g26: { id: 'g26', name: 'Parachela', type: 'genus', parentId: 'f1', description: 'Southeast Asian minnows' },
        g27: { id: 'g27', name: 'Pogobrama', type: 'genus', parentId: 'f1', description: 'Little-studied cyprinids' },
        g28: { id: 'g28', name: 'Cirrhinus', type: 'genus', parentId: 'f1', description: 'Grass carp relatives' },
        g29: { id: 'g29', name: 'Luciosoma', type: 'genus', parentId: 'f1', description: 'Torpedo-shaped cyprinids' },
        g30: { id: 'g30', name: 'Thryssocypris', type: 'genus', parentId: 'f1', description: 'Rare cyprinid fish' },
        g31: {
            id: 'g6',
            name: 'Cichla',
            type: 'genus',
            parentId: 'f2',
            description: 'Genus of large predatory cichlids, including peacock bass',
            children: ['s11', 's12']
        },
        g32: {
            id: 'g7',
            name: 'Ictalurus',
            type: 'genus',
            parentId: 'f3',
            description: 'North American catfish genus',
            children: ['s13', 's14']
        },
        g33: {
            id: 'g8',
            name: 'Pangasius',
            type: 'genus',
            parentId: 'f3',
            description: 'Asian catfish genus',
            children: ['s15']
        }
    },

    species: {
        s1: {
            id: 's1',
            name: 'Cyprinus carpio',
            commonName: 'Common Carp',
            type: 'species',
            parentId: 'g1',
            description: 'Widely cultivated freshwater fish',
            habitat: 'Lakes, large rivers',
            distribution: 'Europe, Asia',
            conservation: 'Least Concern',
            statistics: {
                averageLength: '60-90 cm',
                maxWeight: '40 kg',
                lifespan: '20 years'
            }
        },
        s2: {
            id: 's2',
            name: 'Cyprinus rubrofuscus',
            commonName: 'Asian Carp',
            type: 'species',
            parentId: 'g1',
            description: 'Important aquaculture species',
            habitat: 'Rivers, lakes',
            distribution: 'East Asia',
            conservation: 'Least Concern'
        },
        s3: {
            id: 's3',
            name: 'Cyprinus pellegrini',
            commonName: 'Kansu Carp',
            type: 'species',
            parentId: 'g1',
            description: 'Endemic to China',
            habitat: 'Rivers and streams',
            distribution: 'China',
            conservation: 'Vulnerable'
        },
        s4: {
            id: 's4',
            name: 'Carassius auratus',
            commonName: 'Goldfish',
            type: 'species',
            parentId: 'g2',
            description: 'Popular ornamental fish',
            habitat: 'Ponds, aquariums',
            distribution: 'Worldwide'
        },
        s5: {
            id: 's5',
            name: 'Carassius carassius',
            commonName: 'Crucian Carp',
            type: 'species',
            parentId: 'g2',
            description: 'Hardy freshwater fish',
            habitat: 'Lakes and slow-moving rivers',
            distribution: 'Europe'
        },
        s6: {
            id: 's6',
            name: 'Danio rerio',
            commonName: 'Zebrafish',
            type: 'species',
            parentId: 'g3',
            description: 'Popular model organism in research',
            habitat: 'Streams, ponds',
            distribution: 'South Asia'
        },
        s7: {
            id: 's7',
            name: 'Danio albolineatus',
            commonName: 'Pearl Danio',
            type: 'species',
            parentId: 'g3',
            description: 'A colorful freshwater species',
            habitat: 'Rivers, streams',
            distribution: 'Southeast Asia'
        },
        s8: {
            id: 's8',
            name: 'Labeo bicolor',
            commonName: 'Red-tailed Black Shark',
            type: 'species',
            parentId: 'g4',
            description: 'Popular aquarium fish',
            habitat: 'Rivers, lakes',
            distribution: 'Thailand' 
        },
        s9: {
            id: 's9',
            name: 'Oreochromis niloticus',
            commonName: 'Nile Tilapia',
            type: 'species',
            parentId: 'g5',
            description: 'Important food fish species',
            habitat: 'Lakes, rivers',
            distribution: 'Africa'
        },
        s10: {
            id: 's10',
            name: 'Oreochromis mossambicus',
            commonName: 'Mozambique Tilapia',
            type: 'species',
            parentId: 'g5',
            description: 'Invasive species in some regions',
            habitat: 'Rivers, estuaries',
            distribution: 'Africa, introduced elsewhere'
        },
        s11: {
            id: 's11',
            name: 'Cichla ocellaris',
            commonName: 'Peacock Bass',
            type: 'species',
            parentId: 'g6',
            description: 'Large predatory cichlid',
            habitat: 'Rivers, lakes',
            distribution: 'South America'
        },
        s12: {
            id: 's12',
            name: 'Cichla temensis',
            commonName: 'Speckled Peacock Bass',
            type: 'species',
            parentId: 'g6',
            description: 'One of the largest peacock bass species',
            habitat: 'Freshwater rivers',
            distribution: 'Amazon Basin'
        },
        s13: {
            id: 's13',
            name: 'Ictalurus punctatus',
            commonName: 'Channel Catfish',
            type: 'species',
            parentId: 'g7',
            description: 'Popular aquaculture fish',
            habitat: 'Rivers, lakes',
            distribution: 'North America'
        },
        s14: {
            id: 's14',
            name: 'Ictalurus furcatus',
            commonName: 'Blue Catfish',
            type: 'species',
            parentId: 'g7',
            description: 'Largest species of North American catfish',
            habitat: 'Larger rivers',
            distribution: 'United States'
        },
        s15: {
            id: 's15',
            name: 'Pangasius hypophthalmus',
            commonName: 'Iridescent Shark',
            type: 'species',
            parentId: 'g8',
            description: 'Commonly farmed freshwater fish',
            habitat: 'Large rivers',
            distribution: 'Southeast Asia'
        }
    }
};


// Helper function to get children of a specific node
export const getChildren = (nodeId, type) => {
    try {
        if (!nodeId || !type) return [];

        const node = type === 'family'
            ? taxonomyData.family.find(p => p.id === nodeId)
            : taxonomyData[type][nodeId];

        if (!node || !node.children) return [];

        const childType = type === 'family' ? 'genus' : 'species';
        return node.children
            .map(childId => taxonomyData[childType][childId])
            .filter(child => child != null); // Filter out any undefined children
    } catch (error) {
        console.error('Error in getChildren:', error);
        return [];
    }
}

// Search function
export const searchTaxonomy = (query) => {
    if (!query) return [];

    try {
        query = query.toLowerCase();
        const results = [];

        // Search in phylum
        taxonomyData.phylum.forEach(p => {
            if (p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)) {
                results.push(p);
            }
        });

        // Search in genus
        Object.values(taxonomyData.genus).forEach(g => {
            if (g.name.toLowerCase().includes(query) ||
                g.description.toLowerCase().includes(query)) {
                results.push(g);
            }
        });

        // Search in species
        Object.values(taxonomyData.species).forEach(s => {
            if (s.name.toLowerCase().includes(query) ||
                (s.commonName && s.commonName.toLowerCase().includes(query)) ||
                s.description.toLowerCase().includes(query)) {
                results.push(s);
            }
        });

        return results;
    } catch (error) {
        console.error('Error in searchTaxonomy:', error);
        return [];
    }
}