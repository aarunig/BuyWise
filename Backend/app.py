from flask import Flask, jsonify
from flask_cors import CORS

from routes.chat import chat_bp


app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


app.register_blueprint(
    chat_bp,
    url_prefix="/api"
)


@app.route("/")
def home():
    return jsonify({
        "status": "BuyWise Backend Running",
        "version": "1.0.0"
    })


@app.route("/health")
def health():
    return jsonify({
        "success": True,
        "message": "BuyWise backend is healthy."
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )