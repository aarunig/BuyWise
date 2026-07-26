/**
 * BuyWise Narrative Engine
 *
 * Converts AI reasoning into natural,
 * editorial-style explanations.
 */

export function generateNarrative(product, metrics, decision) {

    let headline = "";
    let explanation = "";
    let watchOut = "";

    // ---------------------------------------
    // Headline
    // ---------------------------------------

    switch (decision.verdict) {

        case "BUY":

            headline = "I'd confidently recommend this purchase.";

            break;

        case "WAIT":

            headline = "I'd compare a few more options first.";

            break;

        case "SKIP":

            headline = "I'd probably keep looking.";

            break;

        default:

            headline = "Here's what I found.";

    }

    // ---------------------------------------
    // Executive Summary
    // ---------------------------------------

    let executiveSummary = "";

    if (decision.verdict === "BUY") {

        executiveSummary =
            "After evaluating value, quality, durability, customer confidence and long-term usefulness, BuyWise believes this product offers a strong overall purchase with very few compromises.";

    }

    else if (decision.verdict === "WAIT") {

        executiveSummary =
            "This product shows several positive signals, but the overall value isn't convincing enough to recommend immediately. Comparing similar alternatives may help you make a better decision.";

    }

    else {

        executiveSummary =
            "Although this product has a few positive qualities, the overall balance between value, quality and confidence isn't strong enough for BuyWise to recommend.";

    }

    // ---------------------------------------
    // Hero Note
    // ---------------------------------------

    const executiveHeroNote =
        "Generated using product specifications, customer feedback, quality signals, long-term value estimates and your shopping preferences.";

    // ---------------------------------------
    // Explanation
    // ---------------------------------------

    if (decision.strengths.length >= 3) {

        explanation =
            "Most of the important signals point in the right direction. This looks like a considered purchase rather than an impulse buy.";

    }

    else if (decision.strengths.length >= 2) {

        explanation =
            "There are several encouraging signs here, although comparing one or two similar products would still be worthwhile.";

    }

    else {

        explanation =
            "The product doesn't currently stand out strongly enough to receive an immediate recommendation.";

    }

    // ---------------------------------------
    // Watch Out
    // ---------------------------------------

    if (decision.concerns.length === 0) {

        watchOut =
            "No significant concerns were identified during the current analysis.";

    }

    else {

        watchOut = decision.concerns[0];

    }

    // ---------------------------------------
    // Bottom Line
    // ---------------------------------------

    let bottomLine = "";

    if (decision.verdict === "BUY") {

        bottomLine =
            "Overall, BuyWise believes this is a purchase that should provide excellent long-term satisfaction and value.";

    }

    else if (decision.verdict === "WAIT") {

        bottomLine =
            "The product is promising, but checking prices or comparing similar alternatives could lead to a better buying decision.";

    }

    else {

        bottomLine =
            "BuyWise recommends continuing your search, as stronger alternatives are likely available.";

    }

    // ---------------------------------------
    // Decision Strength
    // ---------------------------------------

    let decisionStrength = "Moderate";

    if (decision.confidence >= 90) {

        decisionStrength = "Very Strong";

    }

    else if (decision.confidence >= 80) {

        decisionStrength = "Strong";

    }

    else if (decision.confidence >= 65) {

        decisionStrength = "Moderate";

    }

    else {

        decisionStrength = "Weak";

    }

    // ---------------------------------------
    // Future-ready fields
    // ---------------------------------------

    const story = explanation;

    return {

        // Existing fields (backward compatible)
        headline,
        explanation,
        watchOut,

        // New UI fields
        executiveSummary,
        executiveHeroNote,
        bottomLine,
        decisionStrength,
        story

    };

}