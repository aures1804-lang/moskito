from flask import Blueprint, jsonify, request
from app import db
from .models import Caso
from .utils.scoring import calcular_probabilidades
from datetime import datetime

api = Blueprint('api', __name__)

# Ruta para evaluar síntomas
@api.route('/evaluar-sintomas', methods=['POST'])
def evaluar_sintomas():
    try:
        data = request.json
        sintomas = data.get('sintomas', [])
        
        if not sintomas:
            return jsonify({
                'mensaje': 'No se proporcionaron síntomas',
                'advertencia': 'Selecciona al menos un síntoma'
            }), 400
        
        probabilidades = calcular_probabilidades(sintomas)
        
        if not probabilidades:
            return jsonify({
                'mensaje': 'Baja probabilidad de enfermedades vectoriales. Monitorea tus síntomas.',
                'advertencia': 'Esto es una estimación; consulta un médico.'
            })
        
        return jsonify({
            'probabilidades': probabilidades,
            'advertencia': 'Esto es una estimación; consulta un médico.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta principal
@api.route('/')
def home():
    return jsonify({
        "message": "🦟 API Moskito - Sistema de Vigilancia Epidemiológica",
        "status": "online",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "evaluar": "/evaluar-sintomas",
            "casos": "/api/casos"
        }
    })

# Ruta de salud
@api.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "API funcionando correctamente"})

# Ruta para registrar casos
@api.route('/api/casos', methods=['POST'])
def registrar_caso():
    try:
        data = request.json
        
        nuevo_caso = Caso(
            sintomas=data.get('sintomas'),
            probabilidades=data.get('probabilidades'),
            lat=data.get('lat'),
            lon=data.get('lon'),
            municipio=data.get('municipio'),
            barrio=data.get('barrio'),
            edad=data.get('edad'),
            genero=data.get('genero'),
            estado=data.get('estado', 'pendiente')
        )
        
        db.session.add(nuevo_caso)
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Caso registrado exitosamente',
            'caso': nuevo_caso.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Obtener todos los casos
@api.route('/api/casos', methods=['GET'])
def get_casos():
    try:
        casos = Caso.query.all()
        return jsonify([caso.to_dict() for caso in casos])
    except Exception as e:
        return jsonify({'error': str(e)}), 500