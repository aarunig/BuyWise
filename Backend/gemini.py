"""
BuyWise Prompt Engine

Responsible for building prompts sent to Gemini.

Responsibilities
----------------
• Load BuyWise's personality
• Build product prompts
• Build comparison prompts

This module NEVER calls Gemini directly.
"""

import json
from pathlib import Path


# ==========================================================
# SYSTEM PROMPT
# ==========================================================

SYSTEM_PROMPT_PATH = Path("prompts") / "system_prompt.txt"

with open(
    SYSTEM_PROMPT_PATH,
    "r",
    encoding="utf-8"
) as file:

    SYSTEM_PROMPT = file.read()


# ==========================================================
# HELPERS
# ==========================================================

def _pretty(value):
    """
    Convert Python values into readable text.
    """

    if value in (None, "", {}, []):
        return "Unknown"

    if isinstance(value, (dict, list)):
        return json.dumps(
            value,
            indent=2,
            ensure_ascii=False
        )

    return str(value)


# ==========================================================
# PRODUCT PROMPT
# ==========================================================

def build_product_prompt(
    product,
    metrics,
    decision,
    shopping_memory,
    question
):

    return f"""
==================================================
CURRENT PRODUCT

{_pretty(product)}

==================================================
BUYWISE DECISION

{_pretty(decision)}

==================================================
PRODUCT METRICS

{_pretty(metrics)}

==================================================
SHOPPING MEMORY

{_pretty(shopping_memory)}

==================================================
USER QUESTION

{question}

==================================================

Answer using the BuyWise system instructions.

Use the supplied information as the primary source.

If information is missing,
say so naturally.

Translate technical information into practical advice.

Explain your reasoning clearly.

Do not invent details.
"""


# ==========================================================
# COMPARISON PROMPT
# ==========================================================

def build_comparison_prompt(
    product_a,
    product_b,
    comparison,
    shopping_memory,
    question
):

    return f"""
==================================================
PRODUCT A

{_pretty(product_a)}

==================================================
PRODUCT B

{_pretty(product_b)}

==================================================
COMPARISON ANALYSIS

{_pretty(comparison)}

==================================================
SHOPPING MEMORY

{_pretty(shopping_memory)}

==================================================
USER QUESTION

{question}

==================================================

Answer using the BuyWise system instructions.

Explain the trade-offs.

Do not simply declare a winner.

Use Shopping Memory naturally if it improves the recommendation.

Do not invent facts.
"""