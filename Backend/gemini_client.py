"""
BuyWise Gemini Client

Handles all communication with Google's Gemini API.

Responsibilities
----------------
• Connect to Gemini
• Send prompts
• Return responses

Prompt building lives in:
ai/gemini.py
"""

from google import genai
from google.genai import types

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL
)

from ai.gemini import (
    SYSTEM_PROMPT,
    build_product_prompt,
    build_comparison_prompt
)


# ==========================================================
# CLIENT
# ==========================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ==========================================================
# GENERATION SETTINGS
# ==========================================================

GENERATION_CONFIG = types.GenerateContentConfig(

    system_instruction=SYSTEM_PROMPT,

    temperature=0.6,

    top_p=0.9,

    max_output_tokens=500,

)


# ==========================================================
# INTERNAL
# ==========================================================

def _generate(prompt: str) -> str:
    """
    Sends a prompt to Gemini and returns BuyWise's response.
    """

    try:

        response = client.models.generate_content(

            model=GEMINI_MODEL,

            config=GENERATION_CONFIG,

            contents=prompt

        )

        if (
            response
            and hasattr(response, "text")
            and response.text
        ):
            return response.text.strip()

        return (
            "I couldn't come to a confident recommendation this time. "
            "Could you try asking that another way?"
        )

    except Exception as error:

        print(f"Gemini Error: {error}")

        return (
            "Sorry, I'm having trouble thinking through that right now. "
            "Please try again in a moment."
        )


# ==========================================================
# PRODUCT ANALYSIS
# ==========================================================

def ask_product(
    product,
    metrics,
    decision,
    shopping_memory,
    question
):
    """
    Ask BuyWise about a single product.
    """

    prompt = build_product_prompt(

        product=product,

        metrics=metrics,

        decision=decision,

        shopping_memory=shopping_memory,

        question=question

    )

    return _generate(prompt)


# ==========================================================
# PRODUCT COMPARISON
# ==========================================================

def ask_comparison(
    product_a,
    product_b,
    comparison,
    shopping_memory,
    question
):
    """
    Ask BuyWise to compare two products.
    """

    prompt = build_comparison_prompt(

        product_a=product_a,

        product_b=product_b,

        comparison=comparison,

        shopping_memory=shopping_memory,

        question=question

    )

    return _generate(prompt)


# ==========================================================
# GENERAL CHAT
# ==========================================================

def ask_chat(prompt: str):
    """
    General BuyWise conversation.
    """

    return _generate(prompt)