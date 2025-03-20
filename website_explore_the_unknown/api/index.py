from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from dotenv import load_dotenv
import os
import re
import time
from supabase import create_client  # make sure you have the proper supabase package installed

# Specify the .env.local file
load_dotenv(dotenv_path=".env.local")

app = Flask(__name__)
CORS(app)

@app.route("/api/flask_check", methods=["GET"])
def flask_checker():
    return {"status": "success", "message": "Integrate Flask Framework with Next.js"}


# Get environment variables (adjust the names as needed)
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# Initialize the Python Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def is_valid_email(email: str) -> bool:
    # Basic regex check for an email address
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None

@app.route("/api/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json() or {}
    email = data.get("email")
    
    if not email or not is_valid_email(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    try:
        # Insert the email into the "waitlist" table
        response = supabase.table("waitlist").insert({"email": email}).execute()
        # The response is in the format:
        # data=[{'id': 16, 'email': 'test@email.com'}] count=None
        # Check if data is a non-empty list
        if not response.data or not isinstance(response.data, list) or len(response.data) == 0:
            return jsonify({
                "error": "Error adding email to the waitlist. Please try again later.",
                "details": response.data
            }), 500
    except Exception as ex:
        # Log the error if needed
        print("error:", ex)
        return jsonify({
            "error": "Internal server error. Please try again later"
        }), 500

    # Simulate a delay if needed
    time.sleep(0.2)
    return jsonify({
        "message": "Subscription successful! Thank you for joining our waitlist."
    }), 200


if __name__ == "__main__":
    app.run(debug=True)