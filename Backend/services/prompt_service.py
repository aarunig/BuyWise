import json
from typing import Dict, Any, List


# ============================================================
# BUYWISE PROMPT ENGINE
# ============================================================


CONFIG = {
    "max_history": 5,
    "max_features": 5,           # reduced from 8
    "max_specs": 8,              # reduced from 12
    "max_strengths": 3,
    "max_weaknesses": 3,
    "max_tradeoffs": 3,
    "high_confidence_threshold": 85,
    "medium_confidence_threshold": 60,
    "intent_weights": {
        "keyword": {
            "durability": 4,
            "value": 5,
            "comparison": 4,
            "usage": 3,
            "default": 2,
        },
        "phrase": {
            "durability": 4,
            "usage": 3,
            "value": 4,
            "default": 3,
        },
        "synonym": {
            "durability": 2,
            "value": 2,
            "comfort": 2,
            "usage": 2,
            "default": 2,
        },
    },
}


INTENTS = {
    "alternatives": [
        "alternative",
        "alternatives",
        "better",
        "instead",
        "other option",
        "other options",
        "competitor",
        "similar product",
        "recommend another",
    ],
    "durability": [
        "durable",
        "durability",
        "last",
        "long lasting",
        "lifespan",
        "quality",
        "wear",
        "tear",
        "build quality",
        "survive daily use",
        "daily college use",
        "everyday commute",
        "hold up",
        "built to last",
        "semester",
    ],
    "value": [
        "worth",
        "price",
        "expensive",
        "cheap",
        "value",
        "money",
        "budget",
        "cost",
        "pricing",
        "worth paying extra",
        "worth the extra",
    ],
    "comfort": [
        "comfortable",
        "comfort",
        "walking",
        "daily use",
        "cushion",
        "padding",
        "lectures",
        "long days",
    ],
    "fit": [
        "fit",
        "size",
        "tight",
        "loose",
        "true to size",
        "runs small",
        "runs large",
    ],
    "style": [
        "style",
        "fashion",
        "look",
        "looks",
        "match",
        "outfit",
        "design",
        "color",
        "colour",
        "appearance",
    ],
    "maintenance": [
        "clean",
        "cleaning",
        "wash",
        "washing",
        "maintain",
        "maintenance",
        "care",
        "easy to clean",
    ],
    "authenticity": [
        "original",
        "fake",
        "authentic",
        "genuine",
        "real",
        "replica",
    ],
    "comparison": [
        "compare",
        "comparison",
        "vs",
        "versus",
        "difference",
        "which",
        "better than",
    ],
    "gift": [
        "gift",
        "present",
        "birthday",
        "anniversary",
        "for him",
        "for her",
    ],
    "usage": [
        "running",
        "gym",
        "office",
        "college",
        "travel",
        "trek",
        "sports",
        "daily",
        "commute",
        "lectures",
        "work",
    ],
    "materials": [
        "material",
        "leather",
        "canvas",
        "fabric",
        "rubber",
        "cotton",
        "mesh",
    ],
}


INTENT_PHRASES = {
    "durability": {
        "hold up": 3,
        "built to last": 4,
        "last long": 3,
        "survive daily use": 4,
        "every weekday": 3,
        "for a semester": 3,
    },
    "usage": {
        "everyday commute": 3,
        "office daily": 3,
        "college lectures": 3,
        "wear every day": 3,
    },
    "value": {
        "worth paying extra": 4,
        "worth the extra": 4,
    },
}


INTENT_SYNONYMS = {
    "durability": ["last", "lifespan", "wear", "tear", "hold up", "built to last"],
    "value": ["worth", "price", "expensive", "cheap", "worth paying extra"],
    "comfort": ["comfortable", "comfort", "lectures", "long days"],
    "usage": ["daily", "commute", "office", "college", "running", "gym"],
}


CATEGORY_MAP = {
    "running shoes": "shoes",
    "sneakers": "shoes",
    "footwear": "shoes",
    "casual shoes": "shoes",
    "sports shoes": "shoes",
    "shoe": "shoes",
    "smartphone": "electronics",
    "mobile phone": "electronics",
    "phone": "electronics",
    "laptop": "electronics",
    "notebook": "electronics",
    "t-shirt": "clothing",
    "shirt": "clothing",
    "jacket": "clothing",
    "clothing": "clothing",
    "watch": "watch",
}


PRODUCT_SCHEMAS = {
    "shoes": ["material", "warranty", "waterproofRating"],
    "electronics": ["batteryLife", "warranty", "waterproofRating"],
    "clothing": ["material", "countryOfOrigin", "warranty"],
    "watch": ["waterproofRating", "warranty"],
    "default": ["material", "warranty"],
}


GENERAL_KNOWLEDGE = {
    "shoes": {
        "durability": [
            "In general, shoes with reinforced stitching and rubber outsoles tend to last longer in daily use."
        ],
        "comfort": [
            "Extra cushioning and breathable uppers usually improve comfort for long days and commutes."
        ],
    },
    "clothing": {
        "materials": [
            "Cotton is usually more breathable than synthetic fabrics, but may shrink if not cared for properly."
        ],
    },
    "electronics": {
        "durability": [
            "Electronics with better build quality and reputable brands tend to last longer under regular use."
        ],
    },
}


# ============================================================
# FORMATTERS
# ============================================================


def format_json(data):
    if data in (None, {}, [], ""):
        return "None"

    return json.dumps(
        data,
        indent=2,
        ensure_ascii=False,
    )


def clean(value):
    if value is None:
        return ""

    if isinstance(value, str):
        value = value.strip()

    return value


# ============================================================
# INTENT ROUTER (token-based, configurable weights)
# ============================================================


def normalize_question(question: str) -> str:
    q = (question or "").lower()
    replacements = {
        "worth paying extra": "worth",
        "worth the extra": "worth",
        "daily commute": "daily",
        "everyday commute": "daily",
        "good for lectures": "lectures",
    }
    for src, dst in replacements.items():
        q = q.replace(src, dst)
    return q


def _tokenize(q: str) -> List[str]:
    for ch in [",", ".", "?", "!", ":", ";"]:
        q = q.replace(ch, " ")
    tokens = [t for t in q.split() if t]
    return tokens


def _ngrams(tokens: List[str], n: int) -> List[str]:
    return [" ".join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]


def detect_intent(question: str):
    q = normalize_question(question)
    if not q:
        return "general"

    tokens = _tokenize(q)
    unigrams = set(tokens)
    bigrams = set(_ngrams(tokens, 2))

    scores = {intent: 0 for intent in INTENTS.keys()}

    # Keyword scoring (unigrams)
    for intent, keywords in INTENTS.items():
        for keyword in keywords:
            kw_tokens = keyword.split()
            if len(kw_tokens) == 1:
                if keyword in unigrams:
                    w = CONFIG["intent_weights"]["keyword"].get(
                        intent, CONFIG["intent_weights"]["keyword"]["default"]
                    )
                    scores[intent] += w
            else:
                # multi-word keyword; treat as phrase
                if keyword in bigrams:
                    w = CONFIG["intent_weights"]["phrase"].get(
                        intent, CONFIG["intent_weights"]["phrase"]["default"]
                    )
                    scores[intent] += w

    # Phrase scoring (explicit phrases)
    for intent, phrases in INTENT_PHRASES.items():
        for phrase, weight in phrases.items():
            if phrase in bigrams:
                scores[intent] += weight

    # Synonym scoring
    for intent, syns in INTENT_SYNONYMS.items():
        for s in syns:
            syn_tokens = s.split()
            if len(syn_tokens) == 1:
                if s in unigrams:
                    w = CONFIG["intent_weights"]["synonym"].get(
                        intent, CONFIG["intent_weights"]["synonym"]["default"]
                    )
                    scores[intent] += w
            else:
                if s in bigrams:
                    w = CONFIG["intent_weights"]["synonym"].get(
                        intent, CONFIG["intent_weights"]["synonym"]["default"]
                    )
                    scores[intent] += w

    best_intent, best_score = max(scores.items(), key=lambda kv: kv[1])
    return best_intent if best_score > 0 else "general"


# ============================================================
# LEGACY SUMMARIES (preview_context only)
# ============================================================


def build_product_summary(product: Dict[str, Any]):
    if not product:
        return "No product information available."

    lines: List[str] = []

    def add(label, *keys):
        for key in keys:
            value = clean(product.get(key))
            if value:
                lines.append(f"{label}: {value}")
                return

    add("Title", "title", "name")
    add("Brand", "brand")
    add("Category", "category")
    add("Price", "price")
    add("MRP", "mrp")
    add("Discount", "discount")
    add("Rating", "rating")
    add("Reviews", "reviewCount", "reviews")
    add("Seller", "seller")
    add("Availability", "availability")

    features = (
        product.get("features")
        or product.get("highlights")
        or []
    )

    if isinstance(features, list) and features:
        lines.append("")
        lines.append("Key Features:")
        for feature in features[:CONFIG["max_features"]]:
            lines.append(f"• {feature}")

    specs = product.get("specifications", {})

    if isinstance(specs, dict) and specs:
        lines.append("")
        lines.append("Specifications:")

        count = 0
        for key, value in specs.items():
            if value in ("", None):
                continue

            lines.append(f"- {key}: {value}")
            count += 1

            if count >= CONFIG["max_specs"]:
                break

    return "\n".join(lines)


def build_decision_summary(decision):
    if not decision:
        return "No BuyWise decision available."

    lines: List[str] = []

    score = decision.get("buyScore")
    if score is not None:
        lines.append(f"Buy Score: {score}")

    verdict = decision.get("verdict")
    if verdict:
        lines.append(f"Verdict: {verdict}")

    confidence = decision.get("confidence")
    if confidence:
        lines.append(f"Confidence: {confidence}")

    strengths = decision.get("strengths", [])
    if strengths:
        lines.append("")
        lines.append("Strengths:")
        for item in strengths[:CONFIG["max_strengths"]]:
            lines.append(f"• {item}")

    weaknesses = decision.get("weaknesses", [])
    if weaknesses:
        lines.append("")
        lines.append("Weaknesses:")
        for item in weaknesses[:CONFIG["max_weaknesses"]]:
            lines.append(f"• {item}")

    return "\n".join(lines)


def build_metrics_summary(metrics):
    if not metrics:
        return "No product metrics available."

    lines: List[str] = []

    for key, value in metrics.items():
        if value in ("", None, [], {}):
            continue

        pretty = key.replace("_", " ").title()
        lines.append(f"{pretty}: {value}")

    return "\n".join(lines)


def build_memory_summary(memory):
    if not memory:
        return "No shopping memory available."

    lines: List[str] = []

    for key, value in memory.items():
        if value in ("", None, [], {}):
            continue

        pretty = key.replace("_", " ").title()
        lines.append(f"{pretty}: {value}")

    return "\n".join(lines)


def build_compare_summary(compare_basket):
    if not compare_basket:
        return "No comparison products selected."

    lines: List[str] = []

    for index, product in enumerate(compare_basket, start=1):
        title = (
            product.get("title")
            or product.get("name")
            or "Unnamed Product"
        )

        brand = product.get("brand", "")
        price = product.get("price", "")

        lines.append(f"{index}. {title}")

        if brand:
            lines.append(f"   Brand: {brand}")

        if price:
            lines.append(f"   Price: {price}")

    return "\n".join(lines)


def build_history_summary(history):
    if not history:
        return "No previous conversation."

    history = history[-CONFIG["max_history"]:]

    lines: List[str] = []

    for item in history:
        role = item.get("role", "user").capitalize()
        message = item.get("message", "").strip()

        if not message:
            continue

        lines.append(f"{role}: {message}")

    return "\n".join(lines)


# ============================================================
# PRODUCT FACTS LAYER & ANALYSIS
# ============================================================


def _category_key(product: Dict[str, Any]) -> str:
    raw = (product.get("category") or "").lower().strip()
    if raw in CATEGORY_MAP:
        return CATEGORY_MAP[raw]
    for label, key in CATEGORY_MAP.items():
        if label in raw:
            return key
    return "default"


def build_product_facts(product: Dict[str, Any]) -> Dict[str, Any]:
    if not product:
        return {
            "confirmedListingFacts": {},
            "unavailableInformation": [],
            "generalProductKnowledge": [],
            "categoryKey": "default",
        }

    confirmed = {
        "Title": clean(product.get("title") or product.get("name")),
        "Brand": clean(product.get("brand")),
        "Category": clean(product.get("category")),
        "Price": clean(product.get("price")),
        "MRP": clean(product.get("mrp")),
        "Discount": clean(product.get("discount")),
        "Rating": clean(product.get("rating")),
        "Reviews": clean(product.get("reviewCount") or product.get("reviews")),
        "Seller": clean(product.get("seller")),
        "Availability": clean(product.get("availability")),
        "Features": product.get("features") or product.get("highlights") or [],
        "Specifications": product.get("specifications") or {},
    }

    key = _category_key(product)
    fields = PRODUCT_SCHEMAS.get(key, PRODUCT_SCHEMAS["default"])

    unavailable: List[str] = []
    for field in fields:
        if not product.get(field):
            if field == "waterproofRating":
                unavailable.append("Waterproof Rating")
            elif field == "batteryLife":
                unavailable.append("Battery Life")
            elif field == "countryOfOrigin":
                unavailable.append("Country Of Origin")
            else:
                unavailable.append(field.capitalize())

    return {
        "confirmedListingFacts": confirmed,
        "unavailableInformation": unavailable,
        "generalProductKnowledge": [],
        "categoryKey": key,
    }


def build_analysis(decision: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "verdict": decision.get("verdict"),
        "buyScore": decision.get("buyScore"),
        "confidence": decision.get("confidence"),
        "strengths": decision.get("strengths", []),
        "weaknesses": decision.get("weaknesses", []),
        "tradeoffs": decision.get("tradeoffs", []),
        "hiddenInsights": decision.get("hiddenInsights", []),
        "metrics": metrics or {},
        "concerns": decision.get("concerns", []),
    }


# ============================================================
# CONTEXT EXTRACTOR
# ============================================================


def extract_context(data: Dict[str, Any]) -> Dict[str, Any]:
    product = data.get("product", {}) or {}
    decision = data.get("decision", {}) or {}
    metrics = data.get("metrics", {}) or {}
    memory = data.get("shoppingMemory", {}) or {}
    basket = data.get("compareBasket", []) or []
    history = data.get("chatHistory", []) or []

    product_facts = build_product_facts(product)
    analysis = build_analysis(decision, metrics)

    return {
        "product": product,
        "productFacts": product_facts,
        "decision": decision,
        "analysis": analysis,
        "metrics": metrics,
        "memory": memory,
        "basket": basket,
        "history": history,
    }


# ============================================================
# INTENT PROFILES & MEMORY RELEVANCE
# ============================================================


INTENT_PROFILES: Dict[str, Dict[str, bool]] = {
    "durability": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": False,
        "include_history": False,
        "include_metrics": True,
    },
    "value": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": True,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "comparison": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": True,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "alternatives": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": True,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "usage": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "fit": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "comfort": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "style": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": False,
        "include_metrics": True,
    },
    "gift": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": False,
        "include_metrics": False,
    },
    "authenticity": {
        "include_product_facts": True,
        "include_analysis": False,
        "include_comparison": False,
        "include_memory": False,
        "include_history": False,
        "include_metrics": False,
    },
    "materials": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": False,
        "include_history": False,
        "include_metrics": True,
    },
    "general": {
        "include_product_facts": True,
        "include_analysis": True,
        "include_comparison": False,
        "include_memory": True,
        "include_history": True,
        "include_metrics": True,
    },
}


def is_memory_relevant(question: str, memory: Dict[str, Any]) -> bool:
    if not memory:
        return False

    q = normalize_question(question)

    brands = (memory.get("preferred_brands") or [])
    if any(b and b.lower() in q for b in brands):
        return True

    if any(word in q for word in ["worth", "price", "budget", "expensive", "cheap"]):
        if memory.get("preferred_price_range"):
            return True

    if any(word in q for word in ["size", "fit", "tight", "loose"]):
        if memory.get("fit_preferences"):
            return True

    if any(word in q for word in ["colour", "color", "style", "look", "appearance"]):
        if memory.get("preferred_colours") or memory.get("preferred_categories"):
            return True

    return False


def filter_context(context: Dict[str, Any], intent: str, question: str) -> Dict[str, Any]:
    profile = INTENT_PROFILES.get(intent, INTENT_PROFILES["general"])

    filtered = {
        "productFacts": context["productFacts"] if profile["include_product_facts"] else {},
        "analysis": context["analysis"] if profile["include_analysis"] else {},
        "metrics": context["metrics"] if profile["include_metrics"] else {},
        "memory": None,
        "basket": None,
        "history": None,
    }

    if profile["include_comparison"]:
        filtered["basket"] = context["basket"]

    if profile["include_history"] and context["history"]:
        filtered["history"] = context["history"][-CONFIG["max_history"]:]

    if profile["include_memory"] and is_memory_relevant(question, context["memory"]):
        filtered["memory"] = context["memory"]

    return filtered


# ============================================================
# RICH COMPARISON BUILDER (tabular)
# ============================================================


def build_rich_comparison_table(basket: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not basket:
        return []

    rows: List[Dict[str, Any]] = []

    for product in basket:
        metrics = product.get("metrics", {}) or {}
        decision = product.get("decision", {}) or {}

        rows.append(
            {
                "Title": product.get("title") or product.get("name") or "Unnamed Product",
                "Brand": product.get("brand") or "",
                "Price": product.get("price") or "",
                "Rating": product.get("rating") or "",
                "Build": metrics.get("quality") or "",
                "BuyScore": decision.get("buyScore") or metrics.get("overallScore") or "",
                "Confidence": decision.get("confidence") or metrics.get("confidence") or "",
            }
        )

    return rows


def format_comparison_block(basket) -> str:
    rows = build_rich_comparison_table(basket or [])
    if not rows:
        return ""

    attributes = ["Price", "Rating", "BuyScore", "Confidence", "Build"]
    lines: List[str] = []

    headers = ["ATTRIBUTE"] + [f"P{idx}" for idx in range(1, len(rows) + 1)]
    lines.append(" | ".join(headers))

    for attr in attributes:
        values = [str(row.get(attr, "")) for row in rows]
        lines.append(" | ".join([attr] + values))

    lines.append("")
    for idx, row in enumerate(rows, start=1):
        lines.append(f"P{idx}: {row['Title']} ({row['Brand']})")

    return "\n".join(lines).strip()


# ============================================================
# EVIDENCE BUILDER & REASONING TRACE (non-mutating)
# ============================================================


def compute_evidence_quality(
    analysis: Dict[str, Any],
    product_facts: Dict[str, Any],
    basket: Any,
) -> str:
    conf = analysis.get("confidence") or 0
    missing_fields = len(product_facts.get("unavailableInformation") or [])
    specs = product_facts.get("confirmedListingFacts", {}).get("Specifications") or {}
    has_specs = bool(specs)
    has_comparison = bool(basket)

    strengths = len(analysis.get("strengths") or [])
    weaknesses = len(analysis.get("weaknesses") or analysis.get("concerns") or [])
    tradeoffs = len(analysis.get("tradeoffs") or [])
    metrics = analysis.get("metrics") or {}
    has_metrics = bool(metrics)

    score = 0

    if conf >= CONFIG["high_confidence_threshold"]:
        score += 2
    elif conf >= CONFIG["medium_confidence_threshold"]:
        score += 1

    if missing_fields <= 1:
        score += 2
    elif missing_fields <= 3:
        score += 1

    if has_specs:
        score += 1
    if has_comparison:
        score += 1

    if strengths >= 2:
        score += 1
    if weaknesses >= 1:
        score += 1
    if tradeoffs >= 1:
        score += 1
    if has_metrics:
        score += 1

    if score >= 7:
        return "High"
    if score >= 4:
        return "Medium"
    return "Low"


def maybe_add_general_knowledge(product_facts: Dict[str, Any], intent: str) -> List[str]:
    key = product_facts.get("categoryKey", "default")
    return GENERAL_KNOWLEDGE.get(key, {}).get(intent, [])


def build_evidence(filtered_context: Dict[str, Any], intent: str) -> Dict[str, Any]:
    original_facts = filtered_context["productFacts"]
    product_facts = dict(original_facts)  # shallow copy
    notes = maybe_add_general_knowledge(original_facts, intent)
    product_facts["generalProductKnowledge"] = notes

    analysis = filtered_context["analysis"]
    basket = filtered_context["basket"]
    memory = filtered_context["memory"]

    evidence_quality = compute_evidence_quality(analysis, product_facts, basket)
    conf = analysis.get("confidence") or 0

    missing = product_facts.get("unavailableInformation") or []
    missing_critical = ", ".join(missing) if missing else "None"

    reasoning_trace = f"""
Primary user goal: {intent.capitalize()}
Evidence quality: {evidence_quality}
Missing critical data: {missing_critical}
Recommendation confidence: {conf}
Relevant memory: {"Present" if memory else "None"}
Comparison mode: {"Enabled" if basket else "Disabled"}
""".strip()

    return {
        "productFacts": product_facts,
        "analysis": analysis,
        "basket": basket,
        "memory": memory,
        "reasoningTrace": reasoning_trace,
    }


# ============================================================
# PROMPT COMPOSER HELPERS (trimmed for Gemini)
# ============================================================


def format_confirmed_facts(facts: Dict[str, Any]) -> str:
    lines: List[str] = []

    for key, value in facts.items():
        if key in ("Features", "Specifications"):
            continue
        if value:
            lines.append(f"- {key}: {value}")

    features = facts.get("Features") or []
    specs = facts.get("Specifications") or {}

    if features:
        lines.append("")
        lines.append("Features:")
        for f in features[:CONFIG["max_features"]]:
            lines.append(f"• {f}")

    if specs:
        lines.append("")
        lines.append("Specifications:")
        count = 0
        for k, v in specs.items():
            if not v:
                continue
            lines.append(f"- {k}: {v}")
            count += 1
            if count >= CONFIG["max_specs"]:
                break

    return "\n".join(lines) or "None"


def format_analysis_block(analysis: Dict[str, Any]) -> str:
    lines: List[str] = []

    verdict = analysis.get("verdict")
    score = analysis.get("buyScore")
    conf = analysis.get("confidence")

    if score is not None:
        lines.append(f"Overall Buy Score: {score}")
    if verdict:
        lines.append(f"Overall Recommendation: {verdict}")
    if conf is not None:
        lines.append(f"Confidence: {conf}")

    strengths = analysis.get("strengths", [])
    if strengths:
        lines.append("")
        lines.append("Top Reasons (max 3):")
        for s in strengths[:CONFIG["max_strengths"]]:
            lines.append(f"• {s}")

    tradeoffs = analysis.get("tradeoffs", [])
    if tradeoffs:
        lines.append("")
        lines.append("Key Trade-offs (max 3):")
        for t in tradeoffs[:CONFIG["max_tradeoffs"]]:
            title = t.get("title") if isinstance(t, dict) else str(t)
            lines.append(f"• {title}")

    risks = analysis.get("weaknesses", []) or analysis.get("concerns", [])
    if risks:
        lines.append("")
        lines.append("Main Concerns (max 3):")
        for r in risks[:CONFIG["max_weaknesses"]]:
            lines.append(f"• {r}")

    return "\n".join(lines) or "None"


def format_memory_block(memory) -> str:
    if not memory:
        return ""
    return build_memory_summary(memory)


def _compose_prompt(
    question: str,
    intent: str,
    product_facts: Dict[str, Any],
    analysis: Dict[str, Any],
    basket: Any,
    memory: Any,
    reasoning_trace: str,
) -> str:
    """
    Trimmed prompt for Gemini.

    Shape:
    QUESTION
    PRODUCT DATA
    TASK
    Intent hint is kept short; behavior & personality come from system_prompt.txt.
    """

    confirmed = product_facts.get("confirmedListingFacts") or {}
    unavailable = product_facts.get("unavailableInformation") or []
    general_knowledge = product_facts.get("generalProductKnowledge") or []

    unavailable_text = (
        f"Listing omits: {', '.join(unavailable)}"
        if unavailable
        else "Listing omits: None"
    )

    general_knowledge_text = (
        "\n".join(f"- {item}" for item in general_knowledge)
        if general_knowledge
        else ""
    )

    sections: List[str] = []

    # QUESTION
    sections.append("QUESTION")
    sections.append(question or "The user has not asked a question.")

    # PRODUCT DATA
    sections.append("PRODUCT DATA")
    sections.append("Confirmed product facts:")
    sections.append(format_confirmed_facts(confirmed))
    sections.append("")
    sections.append("Unavailable information:")
    sections.append(unavailable_text)

    if general_knowledge_text:
        sections.append("")
        sections.append("General product knowledge (not specific to this listing):")
        sections.append(general_knowledge_text)

    sections.append("")
    sections.append("BuyWise analysis:")
    sections.append(format_analysis_block(analysis))

    if basket:
        comp_block = format_comparison_block(basket)
        if comp_block:
            sections.append("")
            sections.append("Comparison products (if relevant):")
            sections.append(comp_block)

    if memory:
        mem_block = format_memory_block(memory)
        if mem_block:
            sections.append("")
            sections.append("Relevant shopping memory:")
            sections.append(mem_block)

    # TASK (short, delegates behavior to system prompt)
    sections.append("")
    sections.append("TASK")
    sections.append(
        "Using your BuyWise system instructions, answer the question above in a conversational, advisor-like way. "
        "Lead with the 2–3 strongest reasons behind your recommendation, explain one meaningful trade-off, "
        "and finish with a clear verdict: BUY, CONSIDER, WAIT, or SKIP."
    )

    # INTENT hint (optional, short)
    sections.append("")
    sections.append("INTENT")
    sections.append(f"Primary intent: {intent}")

    # NOTE: reasoning_trace is kept for server-side debugging; no longer sent as instructions
    # to avoid wasting tokens on meta information.

    prompt = "\n\n".join(sections).strip()
    return prompt


# ============================================================
# MAIN PROMPT BUILDER (public API)
# ============================================================


def build_prompt(data: Dict[str, Any]) -> str:
    """
    Public API: build the per-request prompt for Gemini.

    Relies on system_prompt.txt for behavior and personality,
    and only sends question + product data + a short task.
    """

    context = extract_context(data)
    question = (data.get("question", "") or "").strip()
    intent = detect_intent(question)

    filtered = filter_context(context, intent, question)
    evidence = build_evidence(filtered, intent)

    return _compose_prompt(
        question=question,
        intent=intent,
        product_facts=evidence["productFacts"],
        analysis=evidence["analysis"],
        basket=evidence["basket"],
        memory=evidence["memory"],
        reasoning_trace=evidence["reasoningTrace"],
    )


# ============================================================
# OPTIONAL DEBUG HELPERS
# ============================================================


def preview_prompt(data: Dict[str, Any]) -> str:
    """
    Returns the generated prompt.
    Useful while debugging Gemini responses.
    """
    return build_prompt(data)


def preview_context(data: Dict[str, Any]) -> str:
    """
    Returns only the summarized shopping context.
    Uses legacy context summary for human debugging.
    """
    return build_context_summary(
        data.get("product", {}),
        data.get("decision", {}),
        data.get("metrics", {}),
        data.get("shoppingMemory", {}),
        data.get("compareBasket", []),
        data.get("chatHistory", []),
    )


def build_context_summary(
    product,
    decision,
    metrics,
    memory,
    basket,
    history,
) -> str:
    sections = [
        ("CURRENT PRODUCT", build_product_summary(product)),
        ("BUYWISE ANALYSIS", build_decision_summary(decision)),
        ("PRODUCT METRICS", build_metrics_summary(metrics)),
    ]

    if memory:
        sections.append(("SHOPPING MEMORY", build_memory_summary(memory)))

    if basket:
        sections.append(("COMPARE BASKET", build_compare_summary(basket)))

    if history:
        sections.append(("RECENT CONVERSATION", build_history_summary(history)))

    text: List[str] = []

    for title, body in sections:
        if not body:
            continue

        text.append("=" * 60)
        text.append(title)
        text.append("=" * 60)
        text.append(body)
        text.append("")

    return "\n".join(text)


def preview_intent(question: str) -> str:
    """
    Returns the detected intent for a question.
    """
    return detect_intent(question)