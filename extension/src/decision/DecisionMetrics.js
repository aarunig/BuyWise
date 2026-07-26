import { detectCategory } from "./CategoryDetector";

/**
 * ==========================================================
 * BuyWise Decision Metrics v4
 * ----------------------------------------------------------
 * This file NEVER makes decisions.
 *
 * Responsibilities
 * • Normalize scraped product data
 * • Extract structured facts
 * • Calculate derived values (discount, etc.)
 * • Report available and missing information
 *
 * It DOES NOT:
 * ✗ Recommend products
 * ✗ Score products
 * ✗ Compare products
 * ✗ Generate explanations
 * ==========================================================
 */

export function calculateMetrics(product) {

    if (!product) {

        return createEmptyMetrics();

    }

    const category = detectCategory(product);

    const normalized = normalizeProduct(product);

    return {

        category,

        product: normalized,

        facts: extractFacts(normalized),

        completeness: buildCompleteness(

            normalized

        )

    };

}

/* ==========================================================
   Empty State
========================================================== */

function createEmptyMetrics() {

    return {

        category: {

            family: "GENERIC",

            category: "UNKNOWN",

            confidence: 0

        },

        product: {},

        facts: {},

        completeness: {

            availableFields: 0,

            totalFields: 0,

            percentage: 0,

            missing: []

        }

    };

}

/* ==========================================================
   Product Normalization
========================================================== */

function normalizeProduct(product) {

    return {

        title:

            normalizeText(

                product.title

            ),

        brand:

            normalizeText(

                product.brand

            ),

        description:

            normalizeText(

                product.description

            ),

        material:

            normalizeText(

                product.material

            ),

        colour:

            normalizeText(

                product.colour ||

                product.color

            ),

        fit:

            normalizeText(

                product.fit

            ),

        style:

            normalizeText(

                product.style

            ),

        seller:

            normalizeText(

                product.seller

            ),

        availability:

            normalizeText(

                product.availability

            ),

        url:

            normalizeText(

                product.url

            ),

        image:

            normalizeText(

                product.image

            ),

        rating:

            normalizeRating(

                product.rating

            ),

        reviewCount:

            normalizeReviewCount(

                product.reviewCount

            ),

        price:

            normalizePrice(

                product.price

            ),

        originalPrice:

            normalizePrice(

                product.originalPrice

            ),

        features:

            normalizeArray(

                product.features

            ),

        specifications:

            normalizeArray(

                product.specifications

            )

    };

}

/* ==========================================================
   Normalizers
========================================================== */

function normalizeText(value) {

    if (

        value === null ||

        value === undefined

    ) {

        return "";

    }

    return value

        .toString()

        .trim();

}

function normalizeArray(value) {

    if (!Array.isArray(value)) {

        return [];

    }

    return value

        .map(item =>

            normalizeText(item)

        )

        .filter(Boolean);

}

function normalizePrice(value) {

    if (

        value === null ||

        value === undefined ||

        value === ""

    ) {

        return null;

    }

    const number = Number(

        value

            .toString()

            .replace(/[^0-9.]/g, "")

    );

    return Number.isFinite(number)

        ? number

        : null;

}

function normalizeRating(value) {

    const rating = parseFloat(value);

    if (!Number.isFinite(rating)) {

        return null;

    }

    return Math.max(

        0,

        Math.min(5, rating)

    );

}

function normalizeReviewCount(value) {

    if (!value) {

        return null;

    }

    const reviews = Number(

        value

            .toString()

            .replace(/[^0-9]/g, "")

    );

    return Number.isFinite(reviews)

        ? reviews

        : null;

}
/* ==========================================================
   Facts Extraction
========================================================== */

function extractFacts(product) {

    return {

        pricing:

            extractPricing(product),

        reviews:

            extractReviews(product),

        brand:

            extractBrand(product),

        material:

            extractMaterial(product),

        seller:

            extractSeller(product),

        availability:

            extractAvailability(product),

        content:

            extractContent(product),

        product:

            extractProductFacts(product)

    };

}

/* ==========================================================
   Pricing
========================================================== */

function extractPricing(product) {

    const hasPrice =

        product.price !== null;

    const hasOriginalPrice =

        product.originalPrice !== null;

    let discountAmount = null;

    let discountPercentage = null;

    if (

        hasPrice &&

        hasOriginalPrice &&

        product.originalPrice > product.price

    ) {

        discountAmount =

            product.originalPrice -

            product.price;

        discountPercentage = Math.round(

            (

                discountAmount /

                product.originalPrice

            ) * 100

        );

    }

    return {

        available: hasPrice,

        currentPrice: product.price,

        originalPrice: product.originalPrice,

        hasDiscount:

            discountPercentage !== null,

        discountAmount,

        discountPercentage

    };

}

/* ==========================================================
   Reviews
========================================================== */

function extractReviews(product) {

    return {

        hasRating:

            product.rating !== null,

        rating:

            product.rating,

        hasReviewCount:

            product.reviewCount !== null,

        reviewCount:

            product.reviewCount

    };

}

/* ==========================================================
   Brand
========================================================== */

function extractBrand(product) {

    return {

        available:

            product.brand.length > 0,

        name:

            product.brand

    };

}

/* ==========================================================
   Material
========================================================== */

function extractMaterial(product) {

    return {

        available:

            product.material.length > 0,

        value:

            product.material

    };

}

/* ==========================================================
   Seller
========================================================== */

function extractSeller(product) {

    return {

        available:

            product.seller.length > 0,

        name:

            product.seller

    };

}

/* ==========================================================
   Availability
========================================================== */

function extractAvailability(product) {

    return {

        available:

            product.availability.length > 0,

        status:

            product.availability

    };

}
/* ==========================================================
   Product Content
========================================================== */

function extractContent(product) {

    return {

        hasDescription:

            product.description.length > 0,

        description:

            product.description,

        hasFeatures:

            product.features.length > 0,

        features:

            product.features,

        featureCount:

            product.features.length,

        hasSpecifications:

            product.specifications.length > 0,

        specifications:

            product.specifications,

        specificationCount:

            product.specifications.length

    };

}

/* ==========================================================
   Product Facts
========================================================== */

function extractProductFacts(product) {

    return {

        title:

            product.title,

        colour:

            product.colour,

        fit:

            product.fit,

        style:

            product.style,

        image:

            product.image,

        url:

            product.url

    };

}

/* ==========================================================
   Information Completeness
========================================================== */

function buildCompleteness(product) {

    const fields = {

        title: product.title,

        brand: product.brand,

        description: product.description,

        material: product.material,

        colour: product.colour,

        fit: product.fit,

        style: product.style,

        seller: product.seller,

        availability: product.availability,

        price: product.price,

        originalPrice: product.originalPrice,

        rating: product.rating,

        reviewCount: product.reviewCount,

        image: product.image,

        url: product.url,

        features:

            product.features.length

                ? product.features

                : null,

        specifications:

            product.specifications.length

                ? product.specifications

                : null

    };

    const available = [];

    const missing = [];

    Object.entries(fields).forEach(

        ([key, value]) => {

            const exists =

                value !== null &&

                value !== undefined &&

                value !== "";

            if (exists) {

                available.push(key);

            } else {

                missing.push(key);

            }

        }

    );

    return {

        availableFields:

            available.length,

        totalFields:

            Object.keys(fields).length,

        percentage:

            available.length /

            Object.keys(fields).length,

        available,

        missing

    };

}