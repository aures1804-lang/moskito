from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

db = SQLAlchemy()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    
    # ✅ CORS ampliado para permitir Render
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "https://moskito-tur4.onrender.com",
                "https://moskito-1.onrender.com",
                "https://*.onrender.com",  # Cualquier subdominio de Render
            ],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✓ Base de datos inicializada")

    from backend.app.routes import api
    app.register_blueprint(api)

    return app