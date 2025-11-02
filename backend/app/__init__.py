from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Inicializar SQLAlchemy sin app
db = SQLAlchemy()

def create_app():
    """Factory function para crear la aplicación Flask"""
    
    # Cargar variables de entorno
    load_dotenv()
    
    # Crear instancia de Flask
    app = Flask(__name__)
    
    # Configuración
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Habilitar CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Inicializar extensiones
    db.init_app(app)
    
    # Registrar blueprints
    from .routes import api
    app.register_blueprint(api)
    
    # Crear tablas
    with app.app_context():
        db.create_all()
        print("✓ Base de datos inicializada")
    
    return app
