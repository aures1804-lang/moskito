from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

db = SQLAlchemy()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✓ Base de datos inicializada")

    # 👇 Importa rutas después de crear la app y registrar la DB
    from backend.app.routes import api
    app.register_blueprint(api)

    return app
