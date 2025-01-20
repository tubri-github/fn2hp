import { providersTreeData } from "@/mock/providersTreeData"; // 引入 providers 数据

// 模拟物种数据
export const speciesTreeData = [
    {
        label: "Family: Leuciscidae",
        children: [
            {
                label: "Genus: Notropis",
                children: [
                    { label: "Species: Notropis atherinoides" },
                    { label: "Species: Notropis chrosomus" },
                    { label: "Species: Notropis procne" }
                ]
            },
            {
                label: "Genus: Cyprinella",
                children: [
                    { label: "Species: Cyprinella lutrensis" },
                    { label: "Species: Cyprinella venusta" }
                ]
            }
        ]
    },
    {
        label: "Family: Cyprinidae",
        children: [
            {
                label: "Genus: Pimephales",
                children: [
                    { label: "Species: Pimephales promelas" },
                    { label: "Species: Pimephales notatus " }
                ]
            },
            {
                label: "Genus: Luxilus",
                children: [
                    { label: "Species: Luxilus chrysocephalus " },
                    { label: "Species: Luxilus cornutus" }
                ]
            }
        ]
    }
];


// 模拟国家数据
export const countriesTreeData = [
    {
        label: "USA",
        children: [
            { label: "California" },
            { label: "Texas" },
            { label: "Florida" },
            { label: "New York" },
            { label: "Ohio" }
        ]
    },
    { label: "Canada" },
    { label: "Brazil" },
    { label: "Australia" },
    { label: "Mexico" },
    { label: "United Kingdom" },
    { label: "Germany" },
    { label: "France" },
    { label: "China" },
    { label: "India" },
    { label: "Japan" }
];


// 根据类型返回数据
export const getTreeDataByType = (type) => {
    switch (type) {
        case "species":
            return speciesTreeData;
        case "countries":
            return countriesTreeData;
        case "providers":
            return providersTreeData;
        default:
            return [];
    }
};
