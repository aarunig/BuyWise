from google import genai
from google.genai import types

from config import GEMINI_API_KEY

MODEL_NAME = "gemini-2.5-flash"

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def ask_gemini(system_prompt, user_prompt):
    """
    Sends a request to Gemini and returns BuyWise's reply.
    """

    try:

        response = client.models.generate_content(

            model=MODEL_NAME,

            config=types.GenerateContentConfig(

                system_instruction=system_prompt,

                temperature=0.5,

                top_p=0.9,

                max_output_tokens=5000,

            ),

            contents=user_prompt

        )

        if response and getattr(response, "text", None):

            text = response.text.strip()

            # Debug (remove before production)
            print("=" * 80)
            print("Gemini Response:")
            print(text)
            print("=" * 80)
            print("Characters:", len(text))
            print("=" * 80)

            return text

        return (
            "I couldn't come to a confident recommendation this time. "
            "Could you try asking that again?"
        )

    except Exception as error:

        print(f"Gemini Error: {error}")

        return (
            "Sorry, I'm having trouble thinking through that right now. "
            "Please try again in a moment."
        )