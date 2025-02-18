// browseMock.js
export const taxonomyData = {
    family: [
        {
            id: 'f1',
            name: 'Cyprinidae',
            type: 'family',
            description: 'The largest family of freshwater fish, including carps and minnows',
            children: ['g1', 'g2', 'g3', 'g4']
        },
        {
            id: 'f2',
            name: 'Cichlidae',
            type: 'family',
            description: 'A diverse family of freshwater fish, including cichlids and tilapias',
            children: ['g5', 'g6']
        },
        {
            id: 'f3',
            name: 'Ictaluridae',
            type: 'family',
            description: 'North American catfish family',
            children: ['g7', 'g8']
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
        g6: {
            id: 'g6',
            name: 'Cichla',
            type: 'genus',
            parentId: 'f2',
            description: 'Genus of large predatory cichlids, including peacock bass',
            children: ['s11', 's12']
        },
        g7: {
            id: 'g7',
            name: 'Ictalurus',
            type: 'genus',
            parentId: 'f3',
            description: 'North American catfish genus',
            children: ['s13', 's14']
        },
        g8: {
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