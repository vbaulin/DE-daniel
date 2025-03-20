from flask import Blueprint

# Create a blueprint for the flask check endpoint
flask_check_bp = Blueprint("flask_check_bp", __name__)

@flask_check_bp.route("/flask_check", methods=["GET"])
def flask_check():
    return {"status": "success", "message": "Integrate Flask Framework with Next.js"} 