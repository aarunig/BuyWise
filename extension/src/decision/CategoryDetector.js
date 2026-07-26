/**
 * ==========================================================
 * BuyWise Category Detector v2
 * ----------------------------------------------------------
 * Determines the product family and category using only
 * information extracted from the current product.
 *
 * This file DOES NOT judge products.
 * It only identifies what the product is.
 * ==========================================================
 */

const CATEGORY_RULES = [

    /* ======================================================
       TOPWEAR
    ====================================================== */

    {

        family: "TOPWEAR",

        category: "T_SHIRT",

        keywords: [

            "t-shirt",
            "t shirt",
            "tee",
            "crew neck",
            "crewneck",
            "round neck",
            "graphic tee"

        ]

    },

    {

        family: "TOPWEAR",

        category: "POLO",

        keywords: [

            "polo",

            "polo shirt"

        ]

    },

    {

        family: "TOPWEAR",

        category: "SHIRT",

        keywords: [

            "shirt",

            "formal shirt",

            "casual shirt",

            "oxford shirt",

            "linen shirt"

        ]

    },

    {

        family: "TOPWEAR",

        category: "HOODIE",

        keywords: [

            "hoodie",

            "hooded sweatshirt"

        ]

    },

    {

        family: "TOPWEAR",

        category: "JACKET",

        keywords: [

            "jacket",

            "bomber",

            "windcheater",

            "blazer"

        ]

    },

    {

        family: "TOPWEAR",

        category: "SWEATSHIRT",

        keywords: [

            "sweatshirt",

            "pullover"

        ]

    },    /* ======================================================
       FOOTWEAR
    ====================================================== */

    {

        family: "FOOTWEAR",

        category: "RUNNING_SHOE",

        keywords: [

            "running shoe",

            "running shoes",

            "running"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "SNEAKER",

        keywords: [

            "sneaker",

            "sneakers"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "CASUAL_SHOE",

        keywords: [

            "casual shoe",

            "casual shoes"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "TRAINER",

        keywords: [

            "trainer",

            "training shoe",

            "gym shoe"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "BOOT",

        keywords: [

            "boot",

            "boots"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "LOAFER",

        keywords: [

            "loafer",

            "loafers"

        ]

    },

    {

        family: "FOOTWEAR",

        category: "SANDAL",

        keywords: [

            "sandal",

            "sandals",

            "slides",

            "flip flop",

            "slipper"

        ]

    },

    /* ======================================================
       SMARTPHONES
    ====================================================== */

    {

        family: "SMARTPHONE",

        category: "PHONE",

        keywords: [

            "iphone",

            "smartphone",

            "mobile phone",

            "android phone",

            "oneplus",

            "pixel",

            "galaxy",

            "redmi",

            "xiaomi",

            "realme",

            "nothing phone",

            "motorola",

            "vivo",

            "oppo"

        ]

    },

    /* ======================================================
       LAPTOPS
    ====================================================== */

    {

        family: "LAPTOP",

        category: "LAPTOP",

        keywords: [

            "laptop",

            "macbook",

            "thinkpad",

            "ideapad",

            "vivobook",

            "zenbook",

            "inspiron",

            "xps",

            "notebook"

        ]

    },

    /* ======================================================
       AUDIO
    ====================================================== */

    {

        family: "AUDIO",

        category: "HEADPHONES",

        keywords: [

            "headphone",

            "headphones",

            "over ear",

            "on ear"

        ]

    },

    {

        family: "AUDIO",

        category: "EARBUDS",

        keywords: [

            "earbuds",

            "buds",

            "tws",

            "airpods",

            "neckband"

        ]

    },

    {

        family: "AUDIO",

        category: "SPEAKER",

        keywords: [

            "speaker",

            "bluetooth speaker",

            "soundbar"

        ]

    },

    /* ======================================================
       WEARABLES
    ====================================================== */

    {

        family: "WEARABLE",

        category: "SMARTWATCH",

        keywords: [

            "smartwatch",

            "watch",

            "fitness watch",

            "fitbit",

            "garmin"

        ]

    },

    {

        family: "WEARABLE",

        category: "FITNESS_BAND",

        keywords: [

            "fitness band",

            "smart band",

            "mi band"

        ]

    },

    /* ======================================================
       ACCESSORIES
    ====================================================== */

    {

        family: "ACCESSORY",

        category: "BACKPACK",

        keywords: [

            "backpack",

            "bag",

            "rucksack"

        ]

    },

    {

        family: "ACCESSORY",

        category: "WALLET",

        keywords: [

            "wallet"

        ]

    },

    {

        family: "ACCESSORY",

        category: "BELT",

        keywords: [

            "belt"

        ]

    },

    {

        family: "ACCESSORY",

        category: "SUNGLASSES",

        keywords: [

            "sunglasses",

            "eyewear"

        ]

    },

    /* ======================================================
       BEAUTY
    ====================================================== */

    {

        family: "BEAUTY",

        category: "SKINCARE",

        keywords: [

            "face wash",

            "cleanser",

            "moisturizer",

            "serum",

            "sunscreen"

        ]

    },

    {

        family: "BEAUTY",

        category: "FRAGRANCE",

        keywords: [

            "perfume",

            "deodorant",

            "cologne",

            "fragrance"

        ]

    },

    /* ======================================================
       HOME
    ====================================================== */

    {

        family: "HOME",

        category: "HOME_PRODUCT",

        keywords: [

            "chair",

            "table",

            "lamp",

            "pillow",

            "bedsheet",

            "blanket",

            "curtain"

        ]

    }

];/* ==========================================================
   Detection Engine
========================================================== */

function buildSearchText(product) {

    const features = Array.isArray(product.features)
        ? product.features
        : [];

    let specifications = [];

    if (Array.isArray(product.specifications)) {

        specifications = product.specifications;

    } else if (
        product.specifications &&
        typeof product.specifications === "object"
    ) {

        specifications = Object.entries(product.specifications)
            .flatMap(([key, value]) => [key, String(value)]);

    }

    return [

        product.title,

        product.brand,

        product.category,

        product.description,

        ...features,

        ...specifications

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

}

export function detectCategory(product) {

    if (!product) {

        return {

            family: "UNKNOWN",

            category: "UNKNOWN",

            confidence: 0,

            matchedBy: []

        };

    }

    const text = buildSearchText(product);

    let bestMatch = null;

    let highestScore = 0;

    CATEGORY_RULES.forEach(rule => {

        let score = 0;

        const matchedBy = [];

        rule.keywords.forEach(keyword => {

            if (text.includes(keyword.toLowerCase())) {

                score++;

                matchedBy.push(keyword);

            }

        });

        if (score > highestScore) {

            highestScore = score;

            bestMatch = {

                family: rule.family,

                category: rule.category,

                matchedBy

            };

        }

    });

    if (!bestMatch) {

        return {

            family: "GENERIC",

            category: "UNKNOWN",

            confidence: 0.15,

            matchedBy: []

        };

    }

    const confidence = Math.min(

        1,

        0.45 + highestScore * 0.18

    );

    return {

        family: bestMatch.family,

        category: bestMatch.category,

        confidence,

        matchedBy: bestMatch.matchedBy

    };

}

/* ==========================================================
   Utility
========================================================== */

export function canCompareCategories(

    productA,

    productB

) {

    const categoryA = detectCategory(productA);

    const categoryB = detectCategory(productB);

    return {

        comparable:

            categoryA.family === categoryB.family,

        family: categoryA.family,

        categoryA,

        categoryB

    };

}
