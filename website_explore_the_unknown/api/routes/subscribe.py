from flask import Blueprint, request, jsonify
import re, os, time
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables (you may also configure these via Vercel's Environment Variables settings)
load_dotenv(dotenv_path=".env.local")

# Create a blueprint for the subscribe endpoint
subscribe_bp = Blueprint("subscribe_bp", __name__)

# Get environment variables
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize the Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def is_valid_email(email: str) -> bool:
    # Basic regex check for an email address
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None

@subscribe_bp.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json() or {}
    email = data.get("email")
    
    if not email or not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    try:
        # Insert the email into the "waitlist" table
        response = supabase.table("waitlist").insert({"email": email}).execute()
        # Check response
        if not response.data or not isinstance(response.data, list) or len(response.data) == 0:
            return jsonify({
                "error": "Error adding email to the waitlist. Please try again later.",
                "details": response.data
            }), 500
    except Exception as ex:
        print("error:", ex)
        return jsonify({
            "error": "Internal server error. Please try again later"
        }), 500

    # Simulate a delay if needed
    time.sleep(0.5)
    return jsonify({
        "message": "Subscription successful! Thank you for joining our waitlist."
    }), 200 