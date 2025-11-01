from flask import jsonify, request
from run import app, db
from app.models import Caso
from datetime import datetime

# ==================== RUTAS PRINCIPALES ====================

@app.route('/')
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

@app.route('/api/health')
def health():
    try:
        db.session.execute(db.text('SELECT 1'))
        db_status = "connected"
        
        # Contar casos en la base de datos
        total_casos = Caso.query.count()
    except Exception as e:
        db_status = f"error: {str(e)}"
        total_casos = 0
    
    return jsonify({
        "status": "healthy",
        "database": db_status,
        "total_casos": total_casos,
        "server": "Flask",
        "timestamp": datetime.utcnow().isoformat()
    })

# ==================== CRUD DE CASOS ====================

# Listar todos los casos
@app.route('/api/casos', methods=['GET'])
def get_casos():
    try:
        # Parámetros de filtrado opcionales
        estado = request.args.get('estado')
        municipio = request.args.get('municipio')
        limit = request.args.get('limit', 100, type=int)
        
        query = Caso.query
        
        if estado:
            query = query.filter_by(estado=estado)
        if municipio:
            query = query.filter_by(municipio=municipio)
        
        casos = query.order_by(Caso.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            "success": True,
            "total": len(casos),
            "casos": [caso.to_dict() for caso in casos]
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Obtener un caso específico
@app.route('/api/casos/<int:caso_id>', methods=['GET'])
def get_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        return jsonify({
            "success": True,
            "caso": caso.to_dict()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Caso no encontrado"
        }), 404

# Crear un nuevo caso
@app.route('/api/casos', methods=['POST'])
def create_caso():
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('sintomas') or not data.get('lat') or not data.get('lon'):
            return jsonify({
                "success": False,
                "error": "Faltan campos requeridos: sintomas, lat, lon"
            }), 400
        
        nuevo_caso = Caso(
            sintomas=data.get('sintomas'),
            probabilidades=data.get('probabilidades', {}),
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
            "success": True,
            "message": "Caso creado exitosamente",
            "caso": nuevo_caso.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Actualizar un caso
@app.route('/api/casos/<int:caso_id>', methods=['PUT'])
def update_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        data = request.get_json()
        
        # Actualizar campos si están presentes
        if 'sintomas' in data:
            caso.sintomas = data['sintomas']
        if 'probabilidades' in data:
            caso.probabilidades = data['probabilidades']
        if 'estado' in data:
            caso.estado = data['estado']
        if 'municipio' in data:
            caso.municipio = data['municipio']
        if 'barrio' in data:
            caso.barrio = data['barrio']
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Caso actualizado exitosamente",
            "caso": caso.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Eliminar un caso
@app.route('/api/casos/<int:caso_id>', methods=['DELETE'])
def delete_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        db.session.delete(caso)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Caso {caso_id} eliminado exitosamente"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================== ESTADÍSTICAS ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        total = Caso.query.count()
        pendientes = Caso.query.filter_by(estado='pendiente').count()
        confirmados = Caso.query.filter_by(estado='confirmado').count()
        
        # Casos por municipio
        municipios = db.session.query(
            Caso.municipio, 
            db.func.count(Caso.id)
        ).group_by(Caso.municipio).all()
        
        return jsonify({
            "success": True,
            "stats": {
                "total": total,
                "pendientes": pendientes,
                "confirmados": confirmados,
                "por_municipio": {m[0]: m[1] for m in municipios if m[0]}
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================== MANEJO DE ERRORES ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Ruta no encontrada",
        "status": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Error interno del servidor",
        "status": 500
    }), 500