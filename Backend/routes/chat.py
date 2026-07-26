from pathlib import Path
import traceback

from flask import Blueprint, jsonify, request

from services.gemini_service import ask_gemini
from services.prompt_service import build_prompt


chat_bp = Blueprint("chat", __name__)


# Load the system prompt once when the server starts
SYSTEM_PROMPT_PATH = Path("prompts") / "system_prompt.txt"

try:
    with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as file:
        SYSTEM_PROMPT = file.read()
except Exception as error:
    print("Failed to load system prompt:", error)
    SYSTEM_PROMPT = ""


@chat_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True)

        if data is None:
            return jsonify({
                "success": False,
                "reply": "No request data received."
            }), 400

        message = data.get("message")

        if not message or not str(message).strip():
            return jsonify({
                "success": False,
                "reply": "No user message was provided."
            }), 400

        prompt = build_prompt(data)

        reply = ask_gemini(
            SYSTEM_PROMPT,
            prompt
        )

        return jsonify({
            "success": True,
            "reply": reply
        })

    except Exception:
        traceback.print_exc()

        return jsonify({
            "success": False,
            "reply": "Sorry, something went wrong while talking to BuyWise."
        }), 500