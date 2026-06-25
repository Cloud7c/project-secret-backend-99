
const productsDatabase = {

    // --- HOME PAGE SPECIFIC (index.html) ---
    "tractor": {
        title: "Mahindra Tractor",
        price: "USD 25,000",
        similarPrice: "USD 28,000",
        image: "tractor.jpg",
        features: [
            { icon: "fa-gauge", text: "New" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-gear", text: "Manual" },
            { icon: "fa-location-dot", text: "Mash Central" }
        ]
    },
    "cow": {
        title: "Brahman Cow",
        price: "USD 800",
        similarPrice: "USD 950",
        image: "cow.png",
        features: [
            { icon: "fa-notes-medical", text: "Vaccinated" },
            { icon: "fa-venus-mars", text: "Female" },
            { icon: "fa-weight-scale", text: "450kg" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    
    // --- VEHICLES (Root Folder) ---
    "hilux": {
        title: "2022 Toyota Hilux",
        price: "USD 45,000",
        similarPrice: "USD 48,000",
        image: "hilux.jpg",
        features: [
            { icon: "fa-gauge", text: "Used - Excellent" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-gear", text: "Manual" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "honda-fit": {
        title: "Honda Fit 1.3L Hybrid",
        price: "USD 5,500",
        similarPrice: "USD 6,000",
        image: "honda-fit.jpg",
        features: [
            { icon: "fa-gauge", text: "Used - Very Good" },
            { icon: "fa-gas-pump", text: "Hybrid" },
            { icon: "fa-gear", text: "Automatic" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "hondafit": {
        title: "Honda Fit 1.3L Hybrid",
        price: "USD 5,500",
        similarPrice: "USD 6,000",
        image: "honda-fit.jpg",
        features: [
            { icon: "fa-gauge", text: "Used - Very Good" },
            { icon: "fa-gas-pump", text: "Hybrid" },
            { icon: "fa-gear", text: "Automatic" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "fortuner": {
        title: "Toyota Fortuner 2.8 GD-6",
        price: "USD 52,000",
        similarPrice: "USD 55,000",
        image: "fortuner.jpg",
        features: [
            { icon: "fa-gauge", text: "Brand New" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-gear", text: "Automatic" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    "ford-ranger": {
        title: "Ford Ranger Wildtrak",
        price: "USD 48,000",
        similarPrice: "USD 50,000",
        image: "ford-ranger.jpg",
        features: [
            { icon: "fa-gauge", text: "Used - Excellent" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-gear", text: "Automatic" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },
    "fordranger": {
        title: "Ford Ranger Wildtrak",
        price: "USD 48,000",
        similarPrice: "USD 50,000",
        image: "ford-ranger.jpg",
        features: [
            { icon: "fa-gauge", text: "Used - Excellent" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-gear", text: "Automatic" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },

    // --- HEAVY MACHINERY (Root Folder) ---
    "bulldozer": {
        title: "CAT D8T Bulldozer",
        price: "USD 120,000",
        similarPrice: "USD 135,000",
        image: "bulldozer.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "5,000 Hrs" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "loader": {
        title: "Komatsu WA380 Wheel Loader",
        price: "USD 85,000",
        similarPrice: "USD 90,000",
        image: "loader.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "3,200 Hrs" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    "excavator": {
        title: "Volvo EC210D Excavator",
        price: "USD 75,000",
        similarPrice: "USD 82,000",
        image: "excavator.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "4,500 Hrs" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },
    "grader": {
        title: "CAT 140G Motor Grader",
        price: "USD 65,000",
        similarPrice: "USD 70,000",
        image: "grader.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "6,000 Hrs" },
            { icon: "fa-location-dot", text: "Masvingo" }
        ]
    },

    // --- SPARES (Root Folder) ---
    "brakes": {
        title: "Carbon Ceramic Brake Disc & Caliper Set",
        price: "USD 450.00",
        similarPrice: "USD 550.00",
        image: "spare-brakes.png",
        features: [
            { icon: "fa-certificate", text: "Genuine OEM" },
            { icon: "fa-car", text: "Universal Fit" },
            { icon: "fa-box", text: "New in Box" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "engine": {
        title: "Performance V8 Engine Short Block",
        price: "USD 2,100.00",
        similarPrice: "USD 2,500.00",
        image: "spare-engine.png",
        features: [
            { icon: "fa-wrench", text: "Aftermarket" },
            { icon: "fa-truck", text: "Fits Hilux" },
            { icon: "fa-box", text: "Refurbished" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    "suspension": {
        title: "Heavy Duty Coilover Shock Absorber",
        price: "USD 185.00",
        similarPrice: "USD 220.00",
        image: "spare-suspension.png",
        features: [
            { icon: "fa-certificate", text: "Genuine OEM" },
            { icon: "fa-tractor", text: "Fits John Deere" },
            { icon: "fa-box", text: "New" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },
    "filters": {
        title: "Premium Oil & Air Filter Maintenance Kit",
        price: "USD 45.00",
        similarPrice: "USD 60.00",
        image: "spare-filters.png",
        features: [
            { icon: "fa-box", text: "New" },
            { icon: "fa-car", text: "Universal Fit" },
            { icon: "fa-oil-can", text: "Includes Oil" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },

    // --- AGRIC EQUIPMENTS (Root Folder - using ../ in HTML) ---
    "johndeere": {
        title: "2020 John Deere 5075E",
        price: "USD 35,000",
        similarPrice: "USD 38,000",
        image: "tractor-johndeere.jpg",
        features: [
            { icon: "fa-gauge", text: "New" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "1,200 Hrs" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "massey": {
        title: "Massey Ferguson 240",
        price: "USD 12,500",
        similarPrice: "USD 14,000",
        image: "tractor-massey.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "8,000 Hrs" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },
    "mahindra": {
        title: "Mahindra 575 DI",
        price: "USD 15,000",
        similarPrice: "USD 16,500",
        image: "tractor-mahindra.jpg",
        features: [
            { icon: "fa-gauge", text: "Brand New" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "0 Hrs" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    "caseih": {
        title: "CASE IH Harvester",
        price: "USD 85,000",
        similarPrice: "USD 92,000",
        image: "harvester-caseih.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "3,500 Hrs" },
            { icon: "fa-location-dot", text: "Chinhoyi" }
        ]
    },
    "newholland": {
        title: "New Holland T6.180",
        price: "USD 42,000",
        similarPrice: "USD 45,000",
        image: "tractor-newholland.jpg",
        features: [
            { icon: "fa-gauge", text: "Used" },
            { icon: "fa-gas-pump", text: "Diesel" },
            { icon: "fa-clock", text: "850 Hrs" },
            { icon: "fa-location-dot", text: "Gweru" }
        ]
    },

    // --- LIVESTOCK (Root Folder - using ../ in HTML) ---
    "angus": {
        title: "ANGUS HEIFER",
        price: "USD 2,850",
        similarPrice: "USD 3,000",
        image: "cow-angus.jpg",
        features: [
            { icon: "fa-calendar", text: "18 Months" },
            { icon: "fa-weight-scale", text: "1050 lbs" },
            { icon: "fa-tractor", text: "Willow Creek Farm" },
            { icon: "fa-location-dot", text: "Montana" }
        ]
    },
    "boer": {
        title: "BOER DOE",
        price: "USD 950",
        similarPrice: "USD 1,100",
        image: "goat-boer.jpg",
        features: [
            { icon: "fa-calendar", text: "2 Yrs" },
            { icon: "fa-weight-scale", text: "160 lbs" },
            { icon: "fa-tractor", text: "Sunrise Caprines" },
            { icon: "fa-location-dot", text: "Texas" }
        ]
    },
    "hereford": {
        title: "HEREFORD STEER",
        price: "USD 2,400",
        similarPrice: "USD 2,600",
        image: "cow-hereford.jpg",
        features: [
            { icon: "fa-calendar", text: "14 Months" },
            { icon: "fa-weight-scale", text: "920 lbs" },
            { icon: "fa-tractor", text: "Green Valley Ranch" },
            { icon: "fa-location-dot", text: "Kansas" }
        ]
    },
    "nigerian": {
        title: "NIGERIAN DWARF",
        price: "USD 650",
        similarPrice: "USD 750",
        image: "goat-nigerian.jpg",
        features: [
            { icon: "fa-calendar", text: "8 Months" },
            { icon: "fa-weight-scale", text: "45 lbs" },
            { icon: "fa-tractor", text: "Happy Tails Dairy" },
            { icon: "fa-location-dot", text: "Oregon" }
        ]
    },
    "brahman": {
        title: "BRAHMAN BULL",
        price: "USD 3,200",
        similarPrice: "USD 3,500",
        image: "cow-brahman.jpg",
        features: [
            { icon: "fa-calendar", text: "3 Yrs" },
            { icon: "fa-weight-scale", text: "1850 lbs" },
            { icon: "fa-tractor", text: "Elite Genetics" },
            { icon: "fa-location-dot", text: "Bulawayo" }
        ]
    },
    "holstein": {
        title: "HOLSTEIN MILKER",
        price: "USD 1,500",
        similarPrice: "USD 1,700",
        image: "cow-holstein.jpg",
        features: [
            { icon: "fa-calendar", text: "4 Yrs" },
            { icon: "fa-weight-scale", text: "1400 lbs" },
            { icon: "fa-tractor", text: "Morning Dew Dairy" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "boran": {
        title: "BORAN HEIFER",
        price: "USD 1,800",
        similarPrice: "USD 1,950",
        image: "cow-boran.jpg",
        features: [
            { icon: "fa-calendar", text: "20 Months" },
            { icon: "fa-weight-scale", text: "950 lbs" },
            { icon: "fa-tractor", text: "Savannah Breeders" },
            { icon: "fa-location-dot", text: "Masvingo" }
        ]
    },
    "charolais": {
        title: "CHAROLAIS STEER",
        price: "USD 2,100",
        similarPrice: "USD 2,300",
        image: "cow-charolais.jpg",
        features: [
            { icon: "fa-calendar", text: "16 Months" },
            { icon: "fa-weight-scale", text: "1100 lbs" },
            { icon: "fa-tractor", text: "High Veldt Farms" },
            { icon: "fa-location-dot", text: "Midlands" }
        ]
    },

    // --- CROP & PRODUCE (Agriculture Folder) ---
    "tomatoes": {
        title: "VINE-RIPENED TOMATOES",
        price: "USD 12.00 / Crate",
        similarPrice: "USD 15.00 / Crate",
        image: "agriculture/tomatoes.png",
        features: [
            { icon: "fa-leaf", text: "Fresh Crop" },
            { icon: "fa-weight-scale", text: "10kg Crate" },
            { icon: "fa-tractor", text: "Sunrise Farms" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "maize": {
        title: "PREMIUM WHITE MAIZE",
        price: "USD 280 / Ton",
        similarPrice: "USD 300 / Ton",
        image: "agriculture/maize.png",
        features: [
            { icon: "fa-seedling", text: "Dried Crop" },
            { icon: "fa-droplet-slash", text: "<12% Moisture" },
            { icon: "fa-tractor", text: "Valley Agritrade" },
            { icon: "fa-location-dot", text: "Chinhoyi" }
        ]
    },
    "cabbage": {
        title: "GIANT GREEN CABBAGES",
        price: "USD 1.50 / Head",
        similarPrice: "USD 2.00 / Head",
        image: "agriculture/cabbage.png",
        features: [
            { icon: "fa-leaf", text: "Fresh Crop" },
            { icon: "fa-shield", text: "No Pesticides" },
            { icon: "fa-tractor", text: "Green Leaf Estates" },
            { icon: "fa-location-dot", text: "Mutare" }
        ]
    },
    "sugarbeans": {
        title: "SUGAR BEANS",
        price: "USD 65.00 / Sack",
        similarPrice: "USD 75.00 / Sack",
        image: "agriculture/sugarbeans.png",
        features: [
            { icon: "fa-seedling", text: "Dried Crop" },
            { icon: "fa-weight-scale", text: "50kg Sack" },
            { icon: "fa-tractor", text: "Midlands Grain Co." },
            { icon: "fa-location-dot", text: "Gweru" }
        ]
    },
    "onions": {
        title: "RED & WHITE ONIONS",
        price: "USD 8.00 / Pocket",
        similarPrice: "USD 10.00 / Pocket",
        image: "agriculture/onions.png",
        features: [
            { icon: "fa-leaf", text: "Fresh Crop" },
            { icon: "fa-box", text: "Cured for Storage" },
            { icon: "fa-tractor", text: "Highland Growers" },
            { icon: "fa-location-dot", text: "Nyanga" }
        ]
    },
    "groundnuts": {
        title: "SHELLED GROUNDNUTS",
        price: "USD 25.00 / Bucket",
        similarPrice: "USD 30.00 / Bucket",
        image: "agriculture/groundnuts.png",
        features: [
            { icon: "fa-seedling", text: "Dried Crop" },
            { icon: "fa-weight-scale", text: "20kg Bucket" },
            { icon: "fa-tractor", text: "Village Harvests" },
            { icon: "fa-location-dot", text: "Masvingo" }
        ]
    },
    "carrots": {
        title: "CRUNCHY CARROTS",
        price: "USD 5.00 / Bunch",
        similarPrice: "USD 7.00 / Bunch",
        image: "agriculture/carrots.png",
        features: [
            { icon: "fa-leaf", text: "Fresh Crop" },
            { icon: "fa-hands-bubbles", text: "Washed & Ready" },
            { icon: "fa-tractor", text: "Riverside Organics" },
            { icon: "fa-location-dot", text: "Harare" }
        ]
    },
    "potatoes": {
        title: "IRISH POTATOES (BP1)",
        price: "USD 10.00 / Pocket",
        similarPrice: "USD 13.00 / Pocket",
        image: "agriculture/potatoes.png",
        features: [
            { icon: "fa-leaf", text: "Fresh Crop" },
            { icon: "fa-certificate", text: "BP1 Grade" },
            { icon: "fa-tractor", text: "Nyanga Farms" },
            { icon: "fa-location-dot", text: "Nyanga" }
        ]
    }
};

export default productsDatabase;