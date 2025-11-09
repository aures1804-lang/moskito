from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# Crear instancia global de SQLAlchemy
db = SQLAlchemy()

def create_app():
    """Factory function para crear la aplicación Flask"""
    
    # Crear instancia de Flask
    app = Flask(__name__)
    
    # Configuración
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # CORS
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "https://moskito-tur4.onrender.com",
                "https://*.onrender.com",
            ],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Inicializar SQLAlchemy con la app
    db.init_app(app)
    
    # Crear tablas dentro del contexto de la aplicación
    with app.app_context():
        # Importar modelos para que SQLAlchemy los conozca
        from . import models
        
        # Crear todas las tablas
        db.create_all()
        print("✓ Base de datos inicializada")
    
    # Registrar blueprints
    from .routes import api
    app.register_blueprint(api)
    
    return app