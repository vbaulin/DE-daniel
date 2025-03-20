from flask import Flask
from flask_cors import CORS
from routes.flask_check import flask_check_bp
from routes.subscribe import subscribe_bp
from routes.chat import chat_bp

app = Flask(__name__)
CORS(app)

# Register blueprints under a common url_prefix if desired
app.register_blueprint(flask_check_bp, url_prefix="/api")
app.register_blueprint(subscribe_bp, url_prefix="/api")
app.register_blueprint(chat_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
