export const mockData = {
    species: {
        treeData: [
            {
                label: "Family A",
                children: [
                    {
                        label: "Genus A1",
                        children: [{ label: "Species A1-1" }, { label: "Species A1-2" }]
                    },
                    {
                        label: "Genus A2",
                        children: [{ label: "Species A2-1" }]
                    }
                ]
            },
            {
                label: "Family B",
                children: [{ label: "Genus B1", children: [{ label: "Species B1-1" }] }]
            }
        ],
        charts: [
            {
                type: "pie",
                title: "Occurrences by Family",
                data: [
                    { label: "Family A", value: 120 },
                    { label: "Family B", value: 80 }
                ]
            }
        ],
        genus: {
            // Family A 的 Genus 数据
            "Family A": [
                { label: "Genus A1", value: 80 },
                { label: "Genus A2", value: 40 }
            ],
            // Family B 的 Genus 数据
            "Family B": [
                { label: "Genus B1", value: 50 },
                { label: "Genus B2", value: 30 }
            ]
        },
        species: {
            // Genus A1 的 Species 数据
            "Genus A1": [
                { label: "Species A1-1", value: 50 },
                { label: "Species A1-2", value: 30 }
            ],
            // Genus A2 的 Species 数据
            "Genus A2": [
                { label: "Species A2-1", value: 40 }
            ],
            // Genus B1 的 Species 数据
            "Genus B1": [
                { label: "Species B1-1", value: 20 },
                { label: "Species B1-2", value: 30 }
            ]
        },
        table:[
            {
                InstitutionCode: "AKPM",
                CollectionCode: "COL01",
                CatalogNumber: "CAT123",
                IndividualCount: 5,
                ScientificName: "Notropis atherinoides",
                Family: "Leuciscidae",
                PreparationType: "Wet",
                Tissues: "Liver",
                Latitude: 34.05,
                Longitude: -118.25,
                CoordinateUncertaintyInMeters: 50,
                HorizontalDatum: "WGS84",
                Country: "USA",
                StateProvince: "California",
                County: "Los Angeles",
                Island: "",
                IslandGroup: "",
                Locality: "Los Angeles River",
                VerbatimElevation: "100 m",
                VerbatimDepth: "",
                YearCollected: 2021,
                MonthCollected: 5,
                DayCollected: 15,
                Collector: "John Doe",
                GeorefMethod: "GPS",
                LatLongComments: "",
                BasisOfRecord: "PreservedSpecimen",
                Remarks: "Good condition",
                DateLastModified: "2023-01-10"
            },
            {
                InstitutionCode: "AM",
                CollectionCode: "COL02",
                CatalogNumber: "CAT124",
                IndividualCount: 10,
                ScientificName: "Cyprinella lutrensis",
                Family: "Leuciscidae",
                PreparationType: "Dry",
                Tissues: "Muscle",
                Latitude: 40.71,
                Longitude: -74.01,
                CoordinateUncertaintyInMeters: 100,
                HorizontalDatum: "NAD83",
                Country: "USA",
                StateProvince: "New York",
                County: "New York",
                Island: "",
                IslandGroup: "",
                Locality: "Hudson River",
                VerbatimElevation: "50 m",
                VerbatimDepth: "",
                YearCollected: 2020,
                MonthCollected: 6,
                DayCollected: 20,
                Collector: "Jane Smith",
                GeorefMethod: "GIS",
                LatLongComments: "Verified by survey",
                BasisOfRecord: "Observation",
                Remarks: "Specimen partially damaged",
                DateLastModified: "2023-02-01"
            }
        ]
    },
    countries: {
        treeData: [
            { label: "USA" },
            { label: "Canada" },
            { label: "Brazil" }
        ],
        charts: [
            {
                type: "bar",
                title: "Occurrences by Country",
                data: [
                    { label: "USA", value: 150 },
                    { label: "Canada", value: 100 },
                    { label: "Brazil", value: 80 }
                ]
            }
        ],
        table:[
            {
                InstitutionCode: "AKPM",
                CollectionCode: "COL01",
                CatalogNumber: "CAT123",
                IndividualCount: 5,
                ScientificName: "Notropis atherinoides",
                Family: "Leuciscidae",
                PreparationType: "Wet",
                Tissues: "Liver",
                Latitude: 34.05,
                Longitude: -118.25,
                CoordinateUncertaintyInMeters: 50,
                HorizontalDatum: "WGS84",
                Country: "USA",
                StateProvince: "California",
                County: "Los Angeles",
                Island: "",
                IslandGroup: "",
                Locality: "Los Angeles River",
                VerbatimElevation: "100 m",
                VerbatimDepth: "",
                YearCollected: 2021,
                MonthCollected: 5,
                DayCollected: 15,
                Collector: "John Doe",
                GeorefMethod: "GPS",
                LatLongComments: "",
                BasisOfRecord: "PreservedSpecimen",
                Remarks: "Good condition",
                DateLastModified: "2023-01-10"
            },
            {
                InstitutionCode: "AM",
                CollectionCode: "COL02",
                CatalogNumber: "CAT124",
                IndividualCount: 10,
                ScientificName: "Cyprinella lutrensis",
                Family: "Leuciscidae",
                PreparationType: "Dry",
                Tissues: "Muscle",
                Latitude: 40.71,
                Longitude: -74.01,
                CoordinateUncertaintyInMeters: 100,
                HorizontalDatum: "NAD83",
                Country: "USA",
                StateProvince: "New York",
                County: "New York",
                Island: "",
                IslandGroup: "",
                Locality: "Hudson River",
                VerbatimElevation: "50 m",
                VerbatimDepth: "",
                YearCollected: 2020,
                MonthCollected: 6,
                DayCollected: 20,
                Collector: "Jane Smith",
                GeorefMethod: "GIS",
                LatLongComments: "Verified by survey",
                BasisOfRecord: "Observation",
                Remarks: "Specimen partially damaged",
                DateLastModified: "2023-02-01"
            }
        ]
    },
    providers: {
        treeData: [
            {
                label: "Institution A (IA)"
            },
            {
                label: "Institution B (IB)"
            },
            {
                label: "Institution C (IC)"
            }
        ],
        charts: [
            {
                type: "pie",
                title: "Occurrences by Institution",
                data: [
                    { label: "Institution A", value: 150 },
                    { label: "Institution B", value: 120 },
                    { label: "Institution C", value: 90 }
                ]
            }
        ],
        table:[
            {
                InstitutionCode: "AKPM",
                CollectionCode: "COL01",
                CatalogNumber: "CAT123",
                IndividualCount: 5,
                ScientificName: "Notropis atherinoides",
                Family: "Leuciscidae",
                PreparationType: "Wet",
                Tissues: "Liver",
                Latitude: 34.05,
                Longitude: -118.25,
                CoordinateUncertaintyInMeters: 50,
                HorizontalDatum: "WGS84",
                Country: "USA",
                StateProvince: "California",
                County: "Los Angeles",
                Island: "",
                IslandGroup: "",
                Locality: "Los Angeles River",
                VerbatimElevation: "100 m",
                VerbatimDepth: "",
                YearCollected: 2021,
                MonthCollected: 5,
                DayCollected: 15,
                Collector: "John Doe",
                GeorefMethod: "GPS",
                LatLongComments: "",
                BasisOfRecord: "PreservedSpecimen",
                Remarks: "Good condition",
                DateLastModified: "2023-01-10"
            },
            {
                InstitutionCode: "AM",
                CollectionCode: "COL02",
                CatalogNumber: "CAT124",
                IndividualCount: 10,
                ScientificName: "Cyprinella lutrensis",
                Family: "Leuciscidae",
                PreparationType: "Dry",
                Tissues: "Muscle",
                Latitude: 40.71,
                Longitude: -74.01,
                CoordinateUncertaintyInMeters: 100,
                HorizontalDatum: "NAD83",
                Country: "USA",
                StateProvince: "New York",
                County: "New York",
                Island: "",
                IslandGroup: "",
                Locality: "Hudson River",
                VerbatimElevation: "50 m",
                VerbatimDepth: "",
                YearCollected: 2020,
                MonthCollected: 6,
                DayCollected: 20,
                Collector: "Jane Smith",
                GeorefMethod: "GIS",
                LatLongComments: "Verified by survey",
                BasisOfRecord: "Observation",
                Remarks: "Specimen partially damaged",
                DateLastModified: "2023-02-01"
            }
        ]
    }
};
export const chartMockData = {
    familyDistribution: [
        { label: "Family A", value: 120 },
        { label: "Family B", value: 80 }
    ],
    genusDistribution: {
        "Family A": [
            { label: "Genus A1", value: 70 },
            { label: "Genus A2", value: 50 }
        ],
        "Family B": [
            { label: "Genus B1", value: 50 },
            { label: "Genus B2", value: 30 }
        ]
    },
    speciesDistribution: {
        "Genus A1": [
            { label: "Species A1-1", value: 40 },
            { label: "Species A1-2", value: 30 }
        ],
        "Genus A2": [
            { label: "Species A2-1", value: 25 },
            { label: "Species A2-2", value: 25 }
        ],
        "Genus B1": [
            { label: "Species B1-1", value: 30 },
            { label: "Species B1-2", value: 20 }
        ],
        "Genus B2": [
            { label: "Species B2-1", value: 15 },
            { label: "Species B2-2", value: 15 }
        ]
    }
};
