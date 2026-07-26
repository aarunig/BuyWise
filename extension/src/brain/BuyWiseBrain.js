import { calculateMetrics } from "../decision/DecisionMetrics";
import { analyzeDecision } from "./ReasoningEngine";
import { compareProducts } from "../decision/ComparisonEngine";
import { generateNarrative } from "./NarrativeEngine";

/* ==========================================================
   Confidence Level Helper
========================================================== */

function getConfidenceLevel(score) {
    if (score >= 90) {
        return "Very High";
    }
    if (score >= 75) {
        return "High";
    }
    if (score >= 60) {
        return "Moderate";
    }
    return "Low";
}

/**
 * ------------------------------------------
 * Analyze a Single Product
 * ------------------------------------------
 */

export async function getBuyWiseDecision(product) {
    if (!product) {
        return {
            verdict: "WAIT",
            verdictLabel: "WAIT",
            confidence: 0,
            confidenceLevel: "Unavailable",
            title: "Nothing to analyze yet.",
            headline: "Nothing to analyze yet.",
            explanation:
                "Open any supported product page and BuyWise will explain whether it's worth buying.",
            reasonTitle: "Why BuyWise recommends this",
            concernTitle: "Worth knowing",
            concern: "",
            strengths: [],
            concerns: [],
            product: null,
            metrics: null,
            decision: null
        };
    }

    const metrics = calculateMetrics(product);
    const reasoning = analyzeDecision(product, metrics);
    const narrative = generateNarrative(product, metrics, reasoning);

    const headline =
        narrative.headline ||
        narrative.title ||
        "Recommendation";

    const confidenceLevel = getConfidenceLevel(
        reasoning.confidence
    );

    return {
        product,
        verdict: reasoning.verdict,
        verdictLabel: reasoning.verdict,
        confidence: reasoning.confidence,
        confidenceLevel,
        title: headline,
        headline,
        explanation: narrative.explanation || "",
        reasonTitle: "Why BuyWise recommends this",
        concernTitle: "Worth knowing",
        concern: narrative.watchOut || "",
        strengths: reasoning.strengths.map((item) =>
            typeof item === "string" ? item : item.reason
        ),
        concerns: reasoning.concerns.map((item) =>
            typeof item === "string" ? item : item.reason
        ),
        metrics,
        decision: reasoning
    };
}

/**
 * ------------------------------------------
 * Compare Two Products
 * ------------------------------------------
 */

export async function getComparisonDecision(productA, productB) {
    if (!productA || !productB) {
        return {
            verdict: "COMPARE",
            verdictLabel: "COMPARE",
            confidence: 0,
            confidenceLevel: "Unavailable",
            title: "Choose two products first.",
            headline: "Choose two products first.",
            explanation:
                "Select any two saved products and BuyWise will compare them.",
            reasonTitle: "Why BuyWise recommends this",
            concernTitle: "Worth knowing",
            concern: "",
            strengths: [],
            winner: null,
            loser: null
        };
    }

    const comparison = compareProducts(productA, productB);

    // Not comparable (different families, etc.)
    if (!comparison || !comparison.success) {
        return {
            verdict: "COMPARE",
            verdictLabel: "COMPARE",
            confidence: 0,
            confidenceLevel: "Unavailable",
            title: comparison?.reason || "Comparison unavailable.",
            headline: comparison?.reason || "Comparison unavailable.",
            explanation:
                "BuyWise currently compares products from the same category with sufficient data to ensure a fair recommendation.",
            reasonTitle: "Comparison unavailable",
            concernTitle: "Worth knowing",
            concern: "",
            strengths: [],
            winner: null,
            loser: null
        };
    }

    // Case 1: no clear winner (tie / insufficient data)
    if (!comparison.winner || !comparison.winner.url) {
        const headline = "These two products are too close to call.";

        return {
            verdict: "COMPARE",
            verdictLabel: "COMPARE",
            confidence: 0,
            confidenceLevel: "Unavailable",
            winner: null,
            loser: null,
            winnerMetrics: null,
            loserMetrics: null,
            difference: Math.abs(
                comparison.scoreA - comparison.scoreB
            ),
            title: headline,
            headline,
            explanation:
                "Based on price, reviews and available product information, BuyWise couldn't confidently pick a single winner. The best choice depends on your priorities and preferences.",
            reasonTitle: "No clear winner",
            concernTitle: "Worth knowing",
            strengths: [],
            concern:
                "Consider which matters more to you: price, brand, style, or specific features. Either product can be a reasonable choice.",
            decision: null,
            summary: comparison.summary,
            tradeoffs: comparison.tradeoffs
        };
    }

    // Case 2: clear winner
    const winnerIsA = comparison.winner.url === productA.url;

    const winnerMetrics = winnerIsA
        ? comparison.metricsA
        : comparison.metricsB;

    const loserMetrics = winnerIsA
        ? comparison.metricsB
        : comparison.metricsA;

    // Use your existing reasoning engine to analyze the winner
    const winnerDecision = analyzeDecision(
        comparison.winner,
        winnerMetrics
    );

    const confidenceLevel = getConfidenceLevel(
        winnerDecision.confidence
    );

    const loser = winnerIsA ? productB : productA;

    const headline = `BuyWise recommends ${comparison.winner.title}`;

    return {
        verdict: "COMPARE",
        verdictLabel: "COMPARE",
        confidence: winnerDecision.confidence,
        confidenceLevel,
        winner: comparison.winner,
        loser,
        winnerMetrics,
        loserMetrics,
        difference: Math.abs(
            comparison.scoreA - comparison.scoreB
        ),
        title: headline,
        headline,
        explanation:
            "After weighing value for money, build quality, customer feedback and long-term usefulness, this option stands out as the stronger overall purchase.",
        reasonTitle: "Why BuyWise recommends this",
        concernTitle: "Worth knowing",
        strengths: winnerDecision.strengths.map((item) =>
            typeof item === "string" ? item : item.reason
        ),
        concern:
            "The alternative may still be a better choice if your priorities or preferences differ.",
        decision: winnerDecision,
        // Pass through comparison summary & trade-offs for the AI layer
        summary: comparison.summary,
        tradeoffs: comparison.tradeoffs
    };
}