/**
 * BuyWise Reasoning Engine
 *
 * Converts shopping signals into
 * human-friendly advice.
 */

export function analyzeDecision(product, metrics) {
  // --------------------------------
  // Existing arrays (backward compatible)
  // --------------------------------
  const strengths = [];
  const concerns = [];
  const reasoning = [];

  // New structured arrays (existing names)
  const structuredStrengths = [];
  const tradeoffs = [];
  const hiddenInsights = [];
  const bestFor = [];
  const avoidIf = [];

  // Evidence buckets (new, additive)
  const positiveEvidence = [];
  const negativeEvidence = [];
  const unknownEvidence = [];

  const confidenceReasons = [];

  // Normalize metrics with safe defaults (same names as before)
  const {
    value = 0,
    versatility = 0,
    longevity = 0,
    maintenance = 0,
    confidence: baseConfidence = 0,
    quality = 0,
    durability = 0,
    reviewScore = 0,
    brandScore = 0,
    styleMatch = 0,
    priceScore = 0,
    overallScore = 0,
    // Optional category-specific signals (additive)
    battery = 0,
    comfort = 0,
    grip = 0,
    breathability = 0,
    camera = 0,
    performance = 0,
    display = 0,
  } = metrics || {};

  // --------------------------------
  // Category normalization (new, additive)
  // --------------------------------

  function normalizeCategory(raw) {
    const category = (raw || "").toLowerCase().trim();

    if (!category) return "generic";

    if (
      category.includes("shoe") ||
      category.includes("sneaker") ||
      category.includes("footwear")
    ) {
      return "shoes";
    }

    if (
      category.includes("phone") ||
      category.includes("smartphone") ||
      category.includes("mobile")
    ) {
      return "phone";
    }

    if (
      category.includes("laptop") ||
      category.includes("notebook") ||
      category.includes("macbook")
    ) {
      return "laptop";
    }

    if (
      category.includes("shirt") ||
      category.includes("t-shirt") ||
      category.includes("clothing") ||
      category.includes("apparel")
    ) {
      return "fashion";
    }

    if (category.includes("watch")) {
      return "watch";
    }

    return "generic";
  }

  const categoryKey = normalizeCategory(product?.category);

  // --------------------------------
  // Fusion weights for concepts (multi-signal reasoning)
  // --------------------------------

  const fusionWeights = {
    premiumBuild: {
      quality: 0.30,
      durability: 0.25,
      reviewScore: 0.25,
      brandScore: 0.20,
    },
    reliableProduct: {
      quality: 0.25,
      durability: 0.30,
      reviewScore: 0.25,
      brandScore: 0.20,
    },
    strongValue: {
      value: 0.35,
      priceScore: 0.30,
      overallScore: 0.35,
    },
  };

  function computeFusionScore(name, metricsObj) {
    const weights = fusionWeights[name];
    if (!weights) return 0;

    let sum = 0;
    let weightSum = 0;

    for (const key in weights) {
      const w = weights[key];
      const val = metricsObj[key] ?? 0;
      sum += w * val;
      weightSum += w;
    }

    return weightSum > 0 ? sum / weightSum : 0;
  }

  const premiumBuildScore = computeFusionScore("premiumBuild", {
    quality,
    durability,
    reviewScore,
    brandScore,
  });

  const reliableProductScore = computeFusionScore("reliableProduct", {
    quality,
    durability,
    reviewScore,
    brandScore,
  });

  const strongValueScore = computeFusionScore("strongValue", {
    value,
    priceScore,
    overallScore,
  });

  const concepts = {
    premiumBuild: premiumBuildScore,
    reliableProduct: reliableProductScore,
    strongValue: strongValueScore,
  };

  // --------------------------------
  // CONFIDENCE AGGREGATION (weighted, explainable)
  // --------------------------------

  const confidenceWeights = {
    positive: {
      Overall: 3,
      Quality: 3,
      Reviews: 3,
      Brand: 3,
    },
    negative: {
      Overall: -4,
      Quality: -4,
      Reviews: -4,
      Brand: -4,
    },
    contradiction: -5,
  };

  let confidence = Math.round(baseConfidence);

  const positiveSignals = [
    overallScore >= 85 && {
      factor: "overallScore",
      label: "Overall",
      detail: "High overall performance.",
      score: overallScore,
    },
    quality >= 85 && {
      factor: "Quality",
      label: "Quality",
      detail: "Premium build quality.",
      score: quality,
    },
    reviewScore >= 85 && {
      factor: "Reviews",
      label: "Reviews",
      detail: "Strong customer satisfaction.",
      score: reviewScore,
    },
    brandScore >= 80 && {
      factor: "Brand",
      label: "Brand",
      detail: "Trusted brand reputation.",
      score: brandScore,
    },
  ].filter(Boolean);

  const negativeSignals = [
    overallScore > 0 &&
      overallScore <= 70 && {
        factor: "overallScore",
        label: "Overall",
        detail: "Weak overall performance.",
        score: overallScore,
      },
    quality > 0 &&
      quality <= 70 && {
        factor: "Quality",
        label: "Quality",
        detail: "Average or weak build quality.",
        score: quality,
      },
    reviewScore > 0 &&
      reviewScore <= 70 && {
        factor: "Reviews",
        label: "Reviews",
        detail: "Mixed or weak customer feedback.",
        score: reviewScore,
      },
    brandScore > 0 &&
      brandScore <= 65 && {
        factor: "Brand",
        label: "Brand",
        detail: "Limited brand strength.",
        score: brandScore,
      },
  ].filter(Boolean);

  positiveSignals.forEach((s) => {
    const w = confidenceWeights.positive[s.label] ?? 2;
    confidence += w;
    confidenceReasons.push({
      type: "positive",
      detail: `${s.label}: ${s.detail}`,
    });
    positiveEvidence.push({
      factor: s.label,
      polarity: "positive",
      strength: s.score >= 90 ? "strong" : "moderate",
      certainty: Math.round(confidence),
      source: "metrics",
      contributesTo: ["Recommendation"],
      detail: s.detail,
      score: s.score,
    });
  });

  negativeSignals.forEach((s) => {
    const w = confidenceWeights.negative[s.label] ?? -3;
    confidence += w;
    confidenceReasons.push({
      type: "negative",
      detail: `${s.label}: ${s.detail}`,
    });
    negativeEvidence.push({
      factor: s.label,
      polarity: "negative",
      strength: s.score <= 60 ? "strong" : "moderate",
      certainty: Math.round(confidence),
      source: "metrics",
      contributesTo: ["Recommendation"],
      detail: s.detail,
      score: s.score,
    });
  });

  // --------------------------------
  // Contradiction validator
  // --------------------------------

  function validateContradictions(metricsObj, conceptsObj) {
    const issues = [];

    const { quality, priceScore, reviewScore, durability, styleMatch, versatility } =
      metricsObj;

    if (priceScore >= 85 && quality <= 70) {
      issues.push("Premium pricing with only average quality.");
    }
    if (reviewScore >= 85 && durability <= 70) {
      issues.push("Excellent reviews but weak durability signals.");
    }
    if (styleMatch >= 85 && versatility <= 60) {
      issues.push("Highly stylish but limited versatility.");
    }
    if (conceptsObj.premiumBuild >= 85 && conceptsObj.strongValue < 70) {
      issues.push("Premium build but weaker value signals.");
    }

    return issues;
  }

  const contradictionsList = validateContradictions(
    { quality, priceScore, reviewScore, durability, styleMatch, versatility },
    concepts
  );

  contradictionsList.forEach((c) => {
    confidence += confidenceWeights.contradiction;
    confidenceReasons.push({
      type: "contradiction",
      detail: c,
    });
    negativeEvidence.push({
      factor: "Signal Alignment",
      polarity: "negative",
      strength: "mixed",
      certainty: Math.round(confidence),
      source: "fusion",
      contributesTo: ["Recommendation"],
      detail: c,
      score: 0,
    });
  });

  confidence = Math.max(0, Math.min(100, confidence));

  // --------------------------------
  // MODULAR ANALYSIS FUNCTIONS (same names, enriched)
  // --------------------------------

  function analyzeValue() {
    if (value >= 90 && priceScore >= 85) {
      strengths.push(
        "The asking price feels justified for what you're getting."
      );
      structuredStrengths.push({
        title: "Excellent Value For Money",
        description:
          "Pricing and features together suggest you’re getting strong value for the cost.",
        confidence: Math.min(100, Math.round((value + priceScore) / 2)),
      });
      reasoning.push({
        factor: "Value",
        impact: "High",
        score: value,
      });
      positiveEvidence.push({
        factor: "Value",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["StrongValue", "Recommendation"],
        detail: "Strong value and price alignment.",
        score: value,
      });
    } else if (value >= 80) {
      strengths.push("The price feels fair for the overall quality.");
      structuredStrengths.push({
        title: "Fair Overall Pricing",
        description:
          "The product is reasonably priced relative to its feature set and build quality.",
        confidence: Math.round(value),
      });
      positiveEvidence.push({
        factor: "Value",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["StrongValue", "Recommendation"],
        detail: "Fair value for money.",
        score: value,
      });
    } else if (value > 0) {
      concerns.push("You may be paying a slight premium for this product.");
      tradeoffs.push({
        title: "Higher Initial Cost",
        description:
          "The upfront price is on the higher side compared with similar options.",
        delta:
          "Costs more than typical alternatives; check if the extra features matter to you.",
      });
      reasoning.push({
        factor: "Value",
        impact: "Low",
        score: value,
      });
      negativeEvidence.push({
        factor: "Value",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["StrongValue", "Recommendation"],
        detail: "Weaker price-to-performance ratio.",
        score: value,
      });
    }
  }

  function analyzeQuality() {
    if (quality >= 90) {
      strengths.push("Build quality appears premium for this category.");
      structuredStrengths.push({
        title: "Premium Build Quality",
        description:
          "Materials and construction suggest a high standard of craftsmanship.",
        confidence: Math.round(quality),
      });
      reasoning.push({
        factor: "Quality",
        impact: "High",
        score: quality,
      });
      positiveEvidence.push({
        factor: "Quality",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["PremiumBuild", "ReliableProduct", "Recommendation"],
        detail: "Premium build quality.",
        score: quality,
      });
    } else if (quality >= 75) {
      structuredStrengths.push({
        title: "Solid Everyday Quality",
        description:
          "Quality looks good enough for regular use, with no major weaknesses.",
        confidence: Math.round(quality),
      });
      positiveEvidence.push({
        factor: "Quality",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["PremiumBuild", "ReliableProduct"],
        detail: "Good everyday build quality.",
        score: quality,
      });
    } else if (quality > 0) {
      concerns.push("Build quality may feel average compared with alternatives.");
      tradeoffs.push({
        title: "Average Build Quality",
        description:
          "If you prioritize premium finish and materials, there may be stronger options.",
      });
      reasoning.push({
        factor: "Quality",
        impact: "Concern",
        score: quality,
      });
      negativeEvidence.push({
        factor: "Quality",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["PremiumBuild", "ReliableProduct"],
        detail: "Average or weak build quality.",
        score: quality,
      });
    }
  }

  function analyzeDurability() {
    if (durability >= 90 || longevity >= 90) {
      strengths.push(
        "It looks like a purchase that should stay useful for a long time."
      );
      structuredStrengths.push({
        title: "Excellent Long-Term Durability",
        description:
          "Construction and expected lifespan make this a strong long-term purchase.",
        confidence: Math.round((durability + longevity) / 2),
      });
      reasoning.push({
        factor: "Durability",
        impact: "High",
        score: durability || longevity,
      });
      positiveEvidence.push({
        factor: "Durability",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct", "LongTermValue", "Recommendation"],
        detail: "Excellent expected lifespan.",
        score: durability || longevity,
      });
    } else if (durability >= 75 || longevity >= 75) {
      structuredStrengths.push({
        title: "Good Expected Lifespan",
        description:
          "The product should remain useful for several years under normal use.",
        confidence:
          Math.round((durability + longevity) / 2) || durability || longevity,
      });
      positiveEvidence.push({
        factor: "Durability",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct", "LongTermValue"],
        detail: "Good long-term value.",
        score: durability || longevity,
      });
    } else if (durability > 0 || longevity > 0) {
      concerns.push(
        "Long-term value might be weaker than alternatives with better durability."
      );
      tradeoffs.push({
        title: "Questionable Longevity",
        description:
          "If you tend to keep products for many years, more durable options may be preferable.",
      });
      reasoning.push({
        factor: "Durability",
        impact: "Concern",
        score: durability || longevity,
      });
      negativeEvidence.push({
        factor: "Durability",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct", "LongTermValue"],
        detail: "Uncertain long-term lifespan.",
        score: durability || longevity,
      });
    }
  }

  function analyzeVersatilityAndStyle() {
    if (versatility >= 85 && styleMatch >= 80) {
      strengths.push("This looks like something you'll use regularly.");
      structuredStrengths.push({
        title: "Strong Everyday Versatility",
        description:
          "Styling and features make it suitable for multiple occasions and use cases.",
        confidence: Math.round((versatility + styleMatch) / 2),
      });
      reasoning.push({
        factor: "Versatility",
        impact: "High",
        score: versatility,
      });
      positiveEvidence.push({
        factor: "Versatility",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["EverydayUse", "Recommendation"],
        detail: "Works well across multiple contexts.",
        score: versatility,
      });
    } else if (versatility >= 70) {
      structuredStrengths.push({
        title: "Good Single-Use Fit",
        description:
          "Best suited to specific scenarios, but still useful beyond occasional use.",
        confidence: Math.round(versatility),
      });
      positiveEvidence.push({
        factor: "Versatility",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["SpecificUse"],
        detail: "Good fit for specific use cases.",
        score: versatility,
      });
    } else if (versatility > 0 || styleMatch > 0) {
      concerns.push(
        "This feels more suited to specific situations than everyday use."
      );
      tradeoffs.push({
        title: "Limited Versatility",
        description:
          "If you want something that works across many contexts, this may feel more niche.",
      });
      reasoning.push({
        factor: "Versatility",
        impact: "Concern",
        score: versatility,
      });
      negativeEvidence.push({
        factor: "Versatility",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["EverydayUse"],
        detail: "More niche than everyday.",
        score: versatility,
      });
    }

    if (styleMatch >= 85) {
      hiddenInsights.push({
        tag: "Design",
        title: "Timeless Design",
        description:
          "Because it uses neutral colours and simple styling, it is likely to remain relevant longer than trend-driven alternatives.",
      });
    } else if (styleMatch >= 70) {
      hiddenInsights.push({
        tag: "Design",
        title: "Easy To Style",
        description:
          "The design should pair well with most everyday outfits or setups, without feeling overly specific.",
      });
    }
  }

  function analyzeMaintenance() {
    if (maintenance < 65 && maintenance > 0) {
      concerns.push("It may need a little more care than similar products.");
      tradeoffs.push({
        title: "Higher Maintenance Needs",
        description:
          "Cleaning, servicing or upkeep may require more effort than simpler alternatives.",
      });
      reasoning.push({
        factor: "Maintenance",
        impact: "Concern",
        score: maintenance,
      });
      negativeEvidence.push({
        factor: "Maintenance",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["OwnershipEffort"],
        detail: "Higher-than-average upkeep.",
        score: maintenance,
      });
    } else if (maintenance >= 80) {
      structuredStrengths.push({
        title: "Low Maintenance",
        description:
          "The product appears easy to maintain, with minimal ongoing effort.",
        confidence: Math.round(maintenance),
      });
      positiveEvidence.push({
        factor: "Maintenance",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["OwnershipEffort"],
        detail: "Easy to keep in good condition.",
        score: maintenance,
      });
    }
  }

  function analyzeReviews() {
    if (reviewScore >= 90) {
      strengths.push("Buyer feedback is consistently positive.");
      structuredStrengths.push({
        title: "Strong Customer Satisfaction",
        description:
          "Reviews suggest most buyers are happy with performance, quality and overall experience.",
        confidence: Math.round(reviewScore),
      });
      reasoning.push({
        factor: "Reviews",
        impact: "High",
        score: reviewScore,
      });
      positiveEvidence.push({
        factor: "Reviews",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct", "StrongValue", "Recommendation"],
        detail: "Very strong customer feedback.",
        score: reviewScore,
      });
      hiddenInsights.push({
        tag: "Market Trend",
        title: "Large Verified Review Base",
        description:
          "A substantial number of verified buyers increases trust in the overall rating.",
      });
    } else if (reviewScore >= 75) {
      structuredStrengths.push({
        title: "Generally Positive Reviews",
        description:
          "Customer feedback is mostly positive, with only minor recurring issues.",
        confidence: Math.round(reviewScore),
      });
      positiveEvidence.push({
        factor: "Reviews",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Generally positive customer feedback.",
        score: reviewScore,
      });
    } else if (reviewScore > 0) {
      concerns.push(
        "I'd feel better with stronger or more consistent customer reviews before recommending it."
      );
      tradeoffs.push({
        title: "Limited Review Confidence",
        description:
          "Existing reviews raise some questions about satisfaction or reliability.",
      });
      reasoning.push({
        factor: "Reviews",
        impact: "Concern",
        score: reviewScore,
      });
      negativeEvidence.push({
        factor: "Reviews",
        polarity: "negative",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Mixed or weak customer feedback.",
        score: reviewScore,
      });
      hiddenInsights.push({
        tag: "Market Trend",
        title: "Limited Review Data",
        description:
          "A smaller or more mixed review base reduces confidence in overall satisfaction.",
      });
    } else {
      unknownEvidence.push({
        factor: "Reviews",
        polarity: "unknown",
        strength: "unknown",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Meaningful review data not available.",
        score: 0,
      });
    }
  }

  function analyzeBrand() {
    if (brandScore >= 90) {
      structuredStrengths.push({
        title: "Trusted Manufacturer",
        description:
          "Brand reputation and track record support a confident recommendation.",
        confidence: Math.round(brandScore),
      });
      hiddenInsights.push({
        tag: "Brand",
        title: "Established Brand Reputation",
        description:
          "A long-standing presence in this category adds extra confidence in support and reliability.",
      });
      reasoning.push({
        factor: "Brand",
        impact: "High",
        score: brandScore,
      });
      positiveEvidence.push({
        factor: "Brand",
        polarity: "positive",
        strength: "strong",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct", "Recommendation"],
        detail: "Strong brand trust.",
        score: brandScore,
      });
    } else if (brandScore >= 75) {
      structuredStrengths.push({
        title: "Established Brand",
        description:
          "The brand is reasonably well-known and trusted in this space.",
        confidence: Math.round(brandScore),
      });
      positiveEvidence.push({
        factor: "Brand",
        polarity: "positive",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Reasonably trusted brand.",
        score: brandScore,
      });
    } else if (brandScore > 0) {
      tradeoffs.push({
        title: "Emerging Brand",
        description:
          "If you prefer established names, this newer brand may require a bit more research.",
      });
      hiddenInsights.push({
        tag: "Brand",
        title: "Growing Brand",
        description:
          "A newer brand with potential; consider how much you value proven track records.",
      });
      reasoning.push({
        factor: "Brand",
        impact: "Mixed",
        score: brandScore,
      });
      negativeEvidence.push({
        factor: "Brand",
        polarity: "negative",
        strength: "moderate",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Less established brand.",
        score: brandScore,
      });
    } else {
      unknownEvidence.push({
        factor: "Brand",
        polarity: "unknown",
        strength: "unknown",
        certainty: Math.round(confidence),
        source: "metrics",
        contributesTo: ["ReliableProduct"],
        detail: "Brand strength not clearly available.",
        score: 0,
      });
    }
  }

  function buildBestForAndAvoidIf() {
    if (versatility >= 80 && durability >= 80) {
      bestFor.push({
        label: "Daily Use",
        reason:
          "Balances comfort, reliability and ease of use for everyday routines.",
        confidence: Math.round((versatility + durability) / 2),
      });
    }
    if (durability >= 85) {
      bestFor.push({
        label: "Long-Term Ownership",
        reason: "Designed to remain useful and reliable over several years.",
        confidence: Math.round(durability),
      });
    }
    if (styleMatch >= 80) {
      bestFor.push({
        label: "Multiple Occasions",
        reason: "Styling works across casual, work and travel contexts.",
        confidence: Math.round(styleMatch),
      });
    }

    if (value < 75 || priceScore < 75) {
      avoidIf.push({
        title: "Budget Shopping",
        description:
          "If lowest possible price is your priority, cheaper alternatives likely exist.",
      });
    }
    if (overallScore < 80 && reviewScore < 75) {
      avoidIf.push({
        title: "Risk-Averse Buyers",
        description:
          "If you prefer products with very strong reviews and proven performance, this may feel risky.",
      });
    }
  }

  function analyzeCategorySpecificSignals() {
    if (categoryKey === "shoes") {
      if (comfort >= 80) {
        positiveEvidence.push({
          factor: "Comfort",
          polarity: "positive",
          strength: "moderate",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["EverydayUse"],
          detail: "Comfort signals look strong for daily wear.",
          score: comfort,
        });
      }
      if (grip > 0 && grip < 70) {
        negativeEvidence.push({
          factor: "Grip",
          polarity: "negative",
          strength: "moderate",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["EverydayUse"],
          detail: "Grip may be weaker for demanding surfaces.",
          score: grip,
        });
        concerns.push("Grip may feel less secure on challenging surfaces.");
      }
      if (breathability === 0) {
        unknownEvidence.push({
          factor: "Breathability",
          polarity: "unknown",
          strength: "unknown",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["Comfort"],
          detail:
            "Breathability is not clearly specified in available data.",
          score: 0,
        });
      }
    }

    if (categoryKey === "phone") {
      if (battery >= 80) {
        positiveEvidence.push({
          factor: "Battery",
          polarity: "positive",
          strength: "moderate",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["EverydayUse"],
          detail: "Battery life looks strong for everyday use.",
          score: battery,
        });
      }
      if (camera > 0 && camera < 70) {
        negativeEvidence.push({
          factor: "Camera",
          polarity: "negative",
          strength: "moderate",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["EverydayUse"],
          detail: "Camera performance may be weaker than alternatives.",
          score: camera,
        });
      }
      if (display === 0) {
        unknownEvidence.push({
          factor: "Display",
          polarity: "unknown",
          strength: "unknown",
          certainty: Math.round(confidence),
          source: "metrics",
          contributesTo: ["EverydayUse"],
          detail: "Display quality details are not fully specified.",
          score: 0,
        });
      }
    }
  }

  // --------------------------------
  // Run modular analyses
  // --------------------------------

  analyzeValue();
  analyzeQuality();
  analyzeDurability();
  analyzeVersatilityAndStyle();
  analyzeMaintenance();
  analyzeReviews();
  analyzeBrand();
  buildBestForAndAvoidIf();
  analyzeCategorySpecificSignals();

  // --------------------------------
  // VERDICT BASED ON concepts + overallScore
  // --------------------------------

  let verdict = "WAIT";

  if (strongValueScore >= 88 && reliableProductScore >= 85) {
    verdict = "BUY";
  } else if (overallScore < 75 && overallScore > 0) {
    verdict = "SKIP";
  }

  if (verdict === "BUY" && confidence < 70) {
    verdict = "WAIT";
  }

  if (verdict === "WAIT" && strongValueScore >= 82 && confidence >= 80) {
    verdict = "BUY";
  }

  if (verdict === "SKIP" && quality >= 80 && reviewScore >= 80) {
    verdict = "WAIT";
  }

  // Richer labels (additive)
  let verdictLabel = "";
  switch (verdict) {
    case "BUY":
      verdictLabel = "Excellent Buy";
      break;
    case "WAIT":
      verdictLabel = "Worth Comparing";
      break;
    case "SKIP":
      verdictLabel = "Not Recommended";
      break;
    default:
      verdictLabel = "Situational Choice";
  }

  // --------------------------------
  // Human-friendly messaging
  // --------------------------------

  let title = "";
  let explanation = "";
  let headline = "";

  switch (verdict) {
    case "BUY":
      title = "Excellent Overall Purchase";
      headline =
        "Strong long-term value with confident quality and satisfaction.";
      explanation =
        "After evaluating quality, long-term ownership, customer satisfaction and overall value, BuyWise believes this product delivers excellent performance for its price category.";
      break;
    case "WAIT":
      title = "Worth Considering, With Caveats";
      headline =
        "Promising choice, but there are a few trade-offs to weigh.";
      explanation =
        "There are clear strengths in value, quality or durability, but BuyWise recommends comparing prices and alternatives before deciding.";
      break;
    case "SKIP":
      title = "Not The Strongest Option";
      headline =
        "Better alternatives likely exist in this category.";
      explanation =
        "Based on value, reviews and long-term ownership, BuyWise does not see this as the strongest available choice for most buyers.";
      break;
    default:
      title = "Let’s Take A Closer Look";
      headline =
        "Mixed signals that warrant a bit more evaluation.";
      explanation =
        "Some factors look positive, but BuyWise would prefer more clarity before making a strong recommendation.";
  }

  // --------------------------------
  // Bottom Line & Personal Decision
  // --------------------------------

  let bottomLine = "";
  let personalDecision = {
    decision: verdict,
    reason: "",
  };

  if (verdict === "BUY") {
    bottomLine =
      "Although it may not be the cheapest option, its durability, quality and satisfaction signals make it a strong long-term purchase for most buyers.";
    personalDecision.reason =
      "I think the overall value and long-term performance justify the price.";
  } else if (verdict === "WAIT") {
    bottomLine =
      "This product is worth considering, but comparing prices and alternatives could help you secure a better overall deal.";
    personalDecision.reason =
      "I’d want to compare a few similar options before deciding.";
  } else if (verdict === "SKIP") {
    bottomLine =
      "Given the available signals, there are likely alternatives that offer better value, satisfaction or long-term performance.";
    personalDecision.reason =
      "I’d prefer to look for a product with stronger value or review signals.";
  }

  // Advisor perspective (new, additive)
  const advisorPerspective = {
    recommendation: verdictLabel,
    rationale:
      verdict === "BUY"
        ? "Multiple strong signals for reliability, value and satisfaction support a confident recommendation."
        : verdict === "WAIT"
        ? "There are clear positives, but trade-offs and missing details mean it's worth comparing similar options."
        : verdict === "SKIP"
        ? "Weaker value, satisfaction or long-term signals suggest better alternatives are likely available."
        : "Signals are mixed; more information would help make a clearer recommendation.",
    uncertainty:
      confidenceReasons.length > 0
        ? confidenceReasons
            .map((c) => {
              const prefix =
                c.type === "positive"
                  ? "Positive: "
                  : c.type === "negative"
                  ? "Negative: "
                  : c.type === "contradiction"
                  ? "Contradiction: "
                  : "Unknown: ";
              return prefix + c.detail;
            })
            .join("; ")
        : "Confidence is based on available metrics; some information may be missing.",
    nextBestAction:
      verdict === "BUY"
        ? "Proceed to purchase if it fits your budget."
        : verdict === "WAIT"
        ? "Compare similar options with stronger value or clearer specs."
        : "Explore alternative products with better value or review signals.",
  };

  // --------------------------------
  // Executive Summary object (dynamic generation)
  // --------------------------------

  const summary = {
    executiveSummary: "",
    executiveHeroNote:
      "Generated after analysing quality, pricing, reviews, brand trust and long-term ownership signals.",
  };

  const primaryConcern = concerns[0] || "";

  // --------------------------------
  // Decision Risks (new, additive)
  // --------------------------------

  const decisionRisks = [];

  if (!product?.material) {
    decisionRisks.push("Material is not clearly disclosed.");
    unknownEvidence.push({
      factor: "Material",
      polarity: "unknown",
      strength: "unknown",
      certainty: Math.round(confidence),
      source: "facts",
      contributesTo: ["DecisionRisk"],
      detail: "Material details are not specified.",
      score: 0,
    });
  }

  if (!product?.warranty) {
    decisionRisks.push("Warranty information is limited or not specified.");
    unknownEvidence.push({
      factor: "Warranty",
      polarity: "unknown",
      strength: "unknown",
      certainty: Math.round(confidence),
      source: "facts",
      contributesTo: ["DecisionRisk"],
      detail: "Warranty terms are not clearly stated.",
      score: 0,
    });
  }

  if (reviewScore > 0 && reviewScore < 75) {
    decisionRisks.push(
      "Customer satisfaction appears mixed based on existing reviews."
    );
  }

  // --------------------------------
  // Counterfactual Reasoning (new, additive)
  // --------------------------------

  const counterfactuals = [];

  if (verdict === "WAIT" && value < 80) {
    counterfactuals.push(
      "If the price were meaningfully lower, this could move into a clear 'BUY' zone."
    );
  }
  if (!product?.warranty) {
    counterfactuals.push(
      "If warranty coverage were clearly stated and reasonable, confidence would increase."
    );
  }
  if (reviewScore > 0 && reviewScore < 75) {
    counterfactuals.push(
      "If review scores improved above ~4.2, the recommendation confidence would be stronger."
    );
  }

  // --------------------------------
  // Decision Summary Object (new, additive)
  // --------------------------------

  const strongestEvidence =
    positiveEvidence[0]?.detail ||
    structuredStrengths[0]?.title ||
    "No single factor dominates the decision.";
  const biggestRisk =
    decisionRisks[0] ||
    negativeEvidence[0]?.detail ||
    "No major risks identified beyond normal product variation.";

  const recommendationReason =
    verdict === "BUY"
      ? "Multiple strong signals for quality, value, durability and satisfaction outweigh the identified trade-offs."
      : verdict === "WAIT"
      ? "There are clear positives, but price, reviews or missing details mean it's worth comparing similar options."
      : verdict === "SKIP"
      ? "Weaker value, satisfaction or long-term signals suggest better alternatives are likely available."
      : "Signals are mixed; more information would help make a clearer recommendation.";

  const confidenceReason =
    confidenceReasons.length > 0
      ? confidenceReasons
          .map((c) => {
            const prefix =
              c.type === "positive"
                ? "Positive: "
                : c.type === "negative"
                ? "Negative: "
                : c.type === "contradiction"
                ? "Contradiction: "
                : "Unknown: ";
            return prefix + c.detail;
          })
          .join("; ")
      : "Confidence is based on available metrics; some information may be missing.";

  const decisionSummary = {
    positives: positiveEvidence,
    negatives: negativeEvidence,
    unknowns: unknownEvidence,
    strongestEvidence,
    biggestRisk,
    recommendationReason,
    confidenceReason,
  };

  // Dynamic executive summary from top evidence
  const topPositive = positiveEvidence[0];
  const topNegative = negativeEvidence[0];
  const topUnknown = unknownEvidence[0];

  const executiveSummaryPieces = [];

  if (topPositive) {
    executiveSummaryPieces.push(topPositive.detail);
  }
  if (topNegative) {
    executiveSummaryPieces.push(
      `At the same time, ${topNegative.detail.toLowerCase()}.`
    );
  }
  if (topUnknown) {
    executiveSummaryPieces.push(
      `Note that ${topUnknown.detail.toLowerCase()}.`
    );
  }

  summary.executiveSummary =
    executiveSummaryPieces.length > 0
      ? executiveSummaryPieces.join(" ")
      : "Based on all available buying signals, BuyWise believes this product offers balanced value with typical trade-offs for its category.";

  // --------------------------------
  // Return Object (backward compatible + new fields)
  // --------------------------------

  return {
    verdict,
    title,
    headline,
    explanation,
    confidence,

    // Legacy fields
    strengths,
    concern: primaryConcern,
    concerns,
    reasoning,

    // New structured reasoning (existing names)
    structuredStrengths,
    tradeoffs,
    hiddenInsights,
    bestFor,
    avoidIf,

    summary,
    bottomLine,
    personalDecision,

    // New evidence model (additive)
    positiveEvidence,
    negativeEvidence,
    unknownEvidence,
    decisionRisks,
    counterfactuals,
    decisionSummary,
    categoryKey,
    verdictLabel,
    advisorPerspective,
  };
}