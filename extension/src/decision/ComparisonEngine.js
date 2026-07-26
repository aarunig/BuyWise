import { detectCategory } from "./CategoryDetector";
import { calculateMetrics } from "./DecisionMetrics";

/**
 * ==========================================================
 * BuyWise Comparison Engine v2
 * ----------------------------------------------------------
 * Responsible for comparing two products.
 *
 * This file is the intelligence layer.
 *
 * It DOES:
 * ✓ Compare facts
 * ✓ Build evidence
 * ✓ Build trade-offs
 * ✓ Decide if products are comparable
 * ✓ Recommend a purchase
 *
 * It NEVER:
 * ✗ Generates UI text
 * ✗ Hardcodes opinions
 * ✗ Returns fake AI responses
 * ==========================================================
 */

export function compareProducts(productA, productB) {
    if (!productA || !productB) {
        return {
            success: false,
            reason: "Two products are required."
        };
    }

    const categoryA = detectCategory(productA);
    const categoryB = detectCategory(productB);

    if (categoryA.family !== categoryB.family) {
        return {
            success: false,
            reason: "These products belong to different product families.",
            categoryA,
            categoryB
        };
    }

    const metricsA = calculateMetrics(productA);
    const metricsB = calculateMetrics(productB);

    const evidence = [];
    const tradeoffs = [];

    comparePricing(metricsA, metricsB, evidence, tradeoffs);
    compareReviews(metricsA, metricsB, evidence, tradeoffs);
    compareMaterials(metricsA, metricsB, evidence);
    compareBrand(metricsA, metricsB, evidence);

    return buildComparison(
        productA,
        productB,
        categoryA,
        metricsA,
        metricsB,
        evidence,
        tradeoffs
    );
}

/* ==========================================================
   Pricing
========================================================== */

function comparePricing(metricsA, metricsB, evidence, tradeoffs) {
    const priceA = metricsA.facts.pricing.currentPrice;
    const priceB = metricsB.facts.pricing.currentPrice;

    if (priceA === null || priceB === null) {
        return;
    }

    const difference = Math.abs(priceA - priceB);

    evidence.push({
        type: "price",
        better: priceA < priceB ? "A" : "B",
        values: {
            productA: priceA,
            productB: priceB,
            difference
        }
    });

    tradeoffs.push({
        type: "price",
        cheaper: priceA < priceB ? "A" : "B",
        difference
    });
}

/* ==========================================================
   Reviews
========================================================== */

function compareReviews(metricsA, metricsB, evidence, tradeoffs) {
    const ratingA = metricsA.facts.reviews.rating;
    const ratingB = metricsB.facts.reviews.rating;
    const reviewsA = metricsA.facts.reviews.reviewCount;
    const reviewsB = metricsB.facts.reviews.reviewCount;

    if (ratingA !== null && ratingB !== null) {
        evidence.push({
            type: "rating",
            better: ratingA > ratingB ? "A" : "B",
            values: {
                productA: ratingA,
                productB: ratingB
            }
        });
    }

    if (reviewsA !== null && reviewsB !== null) {
        evidence.push({
            type: "reviewCount",
            better: reviewsA > reviewsB ? "A" : "B",
            values: {
                productA: reviewsA,
                productB: reviewsB
            }
        });
    }
}

/* ==========================================================
   Material
========================================================== */

function compareMaterials(metricsA, metricsB, evidence) {
    const materialA = metricsA.facts.material.value;
    const materialB = metricsB.facts.material.value;

    if (!materialA || !materialB) {
        return;
    }

    evidence.push({
        type: "material",
        values: {
            productA: materialA,
            productB: materialB
        }
    });
}

/* ==========================================================
   Brand
========================================================== */

function compareBrand(metricsA, metricsB, evidence) {
    const brandA = metricsA.facts.brand.name;
    const brandB = metricsB.facts.brand.name;

    if (!brandA || !brandB) {
        return;
    }

    evidence.push({
        type: "brand",
        values: {
            productA: brandA,
            productB: brandB
        }
    });
}

/* ==========================================================
   Final Decision
========================================================== */

function buildComparison(
    productA,
    productB,
    category,
    metricsA,
    metricsB,
    evidence,
    tradeoffs
) {
    const summary = summarizeEvidence(evidence);
    const recommendation = determineRecommendation(summary);

    // Simple scores based on evidence counts
    const scoreA = summary.favourA;
    const scoreB = summary.favourB;

    let winnerProduct = null;
    let loserProduct = null;

    if (recommendation.winner === "A") {
        winnerProduct = productA;
        loserProduct = productB;
    } else if (recommendation.winner === "B") {
        winnerProduct = productB;
        loserProduct = productA;
    } else {
        winnerProduct = null;
        loserProduct = null;
    }

    return {
        success: true,
        category,
        productA,
        productB,
        metricsA,
        metricsB,
        evidence,
        tradeoffs,
        summary,
        recommendation,
        scoreA,
        scoreB,
        winner: winnerProduct,
        loser: loserProduct
    };
}

/* ==========================================================
   Evidence Summary
========================================================== */

function summarizeEvidence(evidence) {
    let favourA = 0;
    let favourB = 0;
    let unknown = 0;

    evidence.forEach((item) => {
        if (item.better === "A" || item.favours === "A") {
            favourA++;
        } else if (item.better === "B" || item.favours === "B") {
            favourB++;
        } else {
            unknown++;
        }
    });

    return {
        favourA,
        favourB,
        unknown,
        totalEvidence: evidence.length
    };
}

/* ==========================================================
   Recommendation
========================================================== */

function determineRecommendation(summary) {
    const gap = Math.abs(summary.favourA - summary.favourB);

    if (summary.totalEvidence === 0) {
        return {
            winner: null,
            confidence: "LOW",
            strength: "INSUFFICIENT_DATA"
        };
    }

    if (gap === 0) {
        return {
            winner: null,
            confidence: "MEDIUM",
            strength: "TOO_CLOSE_TO_CALL"
        };
    }

    const winner =
        summary.favourA > summary.favourB ? "A" : "B";

    let confidence = "LOW";

    if (summary.totalEvidence >= 5 && gap >= 3) {
        confidence = "HIGH";
    } else if (gap >= 2) {
        confidence = "MEDIUM";
    }

    return {
        winner,
        confidence,
        strength: gap >= 3 ? "STRONG" : "SLIGHT"
    };
}