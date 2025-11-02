from flask import Blueprint, jsonify, request
from . import db
from .models import Caso
from .utils.scoring import calcular_probabilidades
from datetime import datetime

api = Blueprint('api', __name__)

# Ruta para evaluar síntomas (core: identificación de enfermedades)
@api.route('/evaluar-sintomas', methods=['POST'])
def evaluar_sintomas():
    data = request.json
    sintomas = data.get('sintomas', [])
    probabilidades = calcular_probabilidades(sintomas)
    if not probabilidades:
        return jsonify({'mensaje': 'Baja probabilidad de enfermedades vectoriales. Monitorea tus síntomas.', 'advertencia': 'Esto es una estimación; consulta un médico.'})
    return jsonify({'probabilidades': probabilidades, 'advertencia': 'Esto es una estimación; consulta un médico.'})

# Resto de sus rutas (home, health, get_casos, etc.) adaptadas a Blueprint con @api.route en lugar de @app.route
@api.route('/')
def home():
    return jsonify({
        "message": "🦟 API Moskito - Sistema de Vigilancia Epidemiológica",
        "status": "online",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "docs": "/api/docs",
            "casos": "/api/casos"
        }
    })

# ... (incluya todas las otras rutas como @api.route('/health'), etc., sin cambiar su lógica)

# Manejo de errores se mueve a run.py o se registra en el app principal
