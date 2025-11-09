from flask import Blueprint, jsonify, request
from datetime import datetime
from . import db
from .models import Caso
from .utils.scoring import calcular_probabilidades

api = Blueprint('api', __name__)
# ==================== RUTA PRINCIPAL ====================
@api.route('/')
def home():
    return jsonify({
        "message": "🦟 API Moskito - Sistema de Vigilancia Epidemiológica",
        "status": "online",
        "version": "2.0",
        "endpoints": {
            "health": "/api/health",
            "evaluar": "/evaluar-sintomas",
            "casos": "/api/casos",
            "estadisticas": "/api/estadisticas"
        }
    })

# ==================== RUTA DE SALUD ====================
@api.route('/api/health', methods=['GET'])
def health():
    try:
        db.session.execute('SELECT 1')
        return jsonify({
            "status": "ok", 
            "message": "API funcionando correctamente",
            "database": "conectada"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error en la base de datos",
            "error": str(e)
        }), 500

# ==================== EVALUAR SÍNTOMAS ====================
@api.route('/evaluar-sintomas', methods=['POST'])
def evaluar_sintomas():
    try:
        data = request.json
        print(f"📥 Datos recibidos para evaluación: {data}")
        
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
        print(f"❌ Error en evaluar_sintomas: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== REGISTRAR CASO ====================
@api.route('/api/casos', methods=['POST'])
def registrar_caso():
    try:
        data = request.json
        print(f"\n{'='*60}")
        print(f"📥 DATOS RECIBIDOS PARA REGISTRO DE CASO")
        print(f"{'='*60}")
        print(f"🆔 Identificación: {data.get('identificacion')}")
        print(f"👤 Nombre: {data.get('nombre')} {data.get('apellido')}")
        print(f"📱 Teléfono: {data.get('telefono')}")
        print(f"🎂 Edad: {data.get('edad')}")
        print(f"⚧ Género: {data.get('genero')}")
        print(f"🏥 EPS: {data.get('eps')}")
        print(f"🏘️ Barrio: {data.get('barrio')}")
        print(f"🏠 Residencia Permanente: {data.get('es_residencia_permanente')}")
        print(f"🌾 Zona Rural: {data.get('es_zona_rural')}")
        if data.get('es_zona_rural'):
            print(f"🌳 Nombre Zona: {data.get('nombre_zona_rural')}")
        print(f"🏙️ Municipio: {data.get('municipio')}")
        print(f"🩺 Síntomas: {data.get('sintomas')}")
        print(f"📊 Probabilidades: {data.get('probabilidades')}")
        print(f"📍 Ubicación: lat={data.get('lat')}, lon={data.get('lon')}")
        print(f"📋 Estado: {data.get('estado')}")
        print(f"{'='*60}\n")
        
        # ============ VALIDACIONES ============
        
        # 1. Validar identificación (OBLIGATORIO)
        if not data.get('identificacion') or not data.get('identificacion').strip():
            return jsonify({'error': 'El número de identificación es requerido'}), 400
        
        identificacion = data.get('identificacion').strip()
        
        # Verificar si la identificación ya existe
        caso_existente = Caso.query.filter_by(identificacion=identificacion).first()
        if caso_existente:
            return jsonify({
                'error': f'Ya existe un caso registrado con la identificación {identificacion}',
                'caso_existente': {
                    'id': caso_existente.id,
                    'nombre': f"{caso_existente.nombre} {caso_existente.apellido or ''}",
                    'fecha': caso_existente.timestamp.isoformat()
                }
            }), 400
        
        # 2. Validar nombre (OBLIGATORIO)
        if not data.get('nombre') or not data.get('nombre').strip():
            return jsonify({'error': 'El nombre es requerido'}), 400
        
        # 3. Validar edad (OBLIGATORIO)
        edad = data.get('edad')
        if not edad:
            return jsonify({'error': 'La edad es requerida'}), 400
        
        try:
            edad = int(edad)
            if edad < 1 or edad > 120:
                return jsonify({'error': 'La edad debe estar entre 1 y 120 años'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'La edad debe ser un número válido'}), 400
        
        # 4. Validar coordenadas (OBLIGATORIO)
        if not data.get('lat') or not data.get('lon'):
            return jsonify({'error': 'Latitud y longitud son requeridas'}), 400
        
        # 5. Validar síntomas (OBLIGATORIO)
        if not data.get('sintomas'):
            return jsonify({'error': 'Los síntomas son requeridos'}), 400
        
        # 6. Validar teléfono (opcional pero con formato)
        telefono = data.get('telefono', '').strip() if data.get('telefono') else None
        if telefono and len(telefono) < 7:
            return jsonify({'error': 'El teléfono debe tener al menos 7 dígitos'}), 400
        
        # ============ CREAR CASO ============
        nuevo_caso = Caso(
            # Identificación
            identificacion=identificacion,
            
            # Datos personales
            nombre=data.get('nombre').strip(),
            apellido=data.get('apellido', '').strip() if data.get('apellido') else None,
            telefono=telefono,
            edad=edad,
            genero=data.get('genero') if data.get('genero') else None,
            
            # Datos de salud
            eps=data.get('eps'),
            sintomas=data.get('sintomas'),
            probabilidades=data.get('probabilidades'),
            estado=data.get('estado', 'pendiente'),
            
            # Ubicación GPS
            lat=float(data.get('lat')),
            lon=float(data.get('lon')),
            
            # Ubicación geográfica
            municipio=data.get('municipio', 'Buenaventura').strip(),
            barrio=data.get('barrio', '').strip() if data.get('barrio') else None,
            es_residencia_permanente=data.get('es_residencia_permanente', True),
            
            # Zona rural
            es_zona_rural=data.get('es_zona_rural', False),
            nombre_zona_rural=data.get('nombre_zona_rural').strip() if data.get('nombre_zona_rural') and data.get('es_zona_rural') else None
        )
        
        # Guardar en la base de datos
        db.session.add(nuevo_caso)
        db.session.commit()
        
        print(f"✅ Caso registrado exitosamente:")
        print(f"   ID Interno: {nuevo_caso.id}")
        print(f"   Identificación: {nuevo_caso.identificacion}")
        print(f"   Paciente: {nuevo_caso.nombre} {nuevo_caso.apellido or ''}")
        print(f"   Teléfono: {nuevo_caso.telefono or 'No proporcionado'}")
        print(f"   EPS: {nuevo_caso.eps or 'No especificada'}")
        print(f"   Timestamp: {nuevo_caso.timestamp}")
        print(f"{'='*60}\n")
        print(f"🌾 Zona Rural: {data.get('es_zona_rural')}")
        if data.get('es_zona_rural'):
            print(f"🌳 Nombre Zona: {data.get('nombre_zona_rural')}")
        
        return jsonify({
            'mensaje': 'Caso registrado exitosamente',
            'caso': nuevo_caso.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"\n{'='*60}")
        print(f"❌ ERROR AL REGISTRAR CASO")
        print(f"{'='*60}")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        return jsonify({'error': f'Error al registrar caso: {str(e)}'}), 500

# ==================== OBTENER TODOS LOS CASOS ====================
@api.route('/api/casos', methods=['GET'])
def get_casos():
    try:
        # Parámetros de filtrado opcionales
        identificacion = request.args.get('identificacion')
        municipio = request.args.get('municipio')
        estado = request.args.get('estado')
        eps = request.args.get('eps')
        zona_rural = request.args.get('zona_rural')
        limit = request.args.get('limit', type=int)
        
        # Query base
        query = Caso.query
        
        # Aplicar filtros
        if identificacion:
            query = query.filter_by(identificacion=identificacion)
        if municipio:
            query = query.filter_by(municipio=municipio)
        if estado:
            query = query.filter_by(estado=estado)
        if eps:
            query = query.filter_by(eps=eps)
        if zona_rural:
            query = query.filter_by(es_zona_rural=(zona_rural.lower() == 'true'))
        
        # Ordenar por más reciente
        query = query.order_by(Caso.timestamp.desc())
        
        # Aplicar límite si se especifica
        if limit:
            query = query.limit(limit)
        
        casos = query.all()
        
        return jsonify({
            'total': len(casos),
            'casos': [caso.to_dict() for caso in casos]
        })
    except Exception as e:
        print(f"❌ Error al obtener casos: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== BUSCAR CASO POR IDENTIFICACIÓN ====================
@api.route('/api/casos/buscar/<string:identificacion>', methods=['GET'])
def buscar_por_identificacion(identificacion):
    try:
        caso = Caso.query.filter_by(identificacion=identificacion).first()
        if caso:
            return jsonify({
                'encontrado': True,
                'caso': caso.to_dict()
            })
        else:
            return jsonify({
                'encontrado': False,
                'mensaje': f'No se encontró ningún caso con la identificación {identificacion}'
            }), 404
    except Exception as e:
        print(f"❌ Error al buscar caso: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== OBTENER UN CASO ESPECÍFICO ====================
@api.route('/api/casos/<int:caso_id>', methods=['GET'])
def get_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        return jsonify(caso.to_dict())
    except Exception as e:
        return jsonify({'error': 'Caso no encontrado'}), 404

# ==================== ACTUALIZAR ESTADO DE UN CASO ====================
@api.route('/api/casos/<int:caso_id>', methods=['PUT', 'PATCH'])
def actualizar_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        data = request.json
        
        # Campos actualizables
        if 'estado' in data:
            caso.estado = data['estado']
        if 'eps' in data:
            caso.eps = data['eps']
        if 'telefono' in data:
            caso.telefono = data['telefono']
        if 'es_residencia_permanente' in data:
            caso.es_residencia_permanente = data['es_residencia_permanente']
        
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Caso actualizado exitosamente',
            'caso': caso.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ELIMINAR UN CASO ====================
@api.route('/api/casos/<int:caso_id>', methods=['DELETE'])
def eliminar_caso(caso_id):
    try:
        caso = Caso.query.get_or_404(caso_id)
        db.session.delete(caso)
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Caso eliminado exitosamente',
            'id': caso_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ESTADÍSTICAS ====================
@api.route('/api/estadisticas', methods=['GET'])
def estadisticas():
    try:
        # Total de casos
        total_casos = Caso.query.count()
        
        # Casos por municipio
        casos_por_municipio = db.session.query(
            Caso.municipio, 
            db.func.count(Caso.id)
        ).group_by(Caso.municipio).all()
        
        # Casos por estado
        casos_por_estado = db.session.query(
            Caso.estado,
            db.func.count(Caso.id)
        ).group_by(Caso.estado).all()
        
        # Casos por género
        casos_por_genero = db.session.query(
            Caso.genero,
            db.func.count(Caso.id)
        ).group_by(Caso.genero).all()
        
        # Casos por EPS
        casos_por_eps = db.session.query(
            Caso.eps,
            db.func.count(Caso.id)
        ).group_by(Caso.eps).all()
        
        # Casos en zona rural
        casos_zona_rural = Caso.query.filter_by(es_zona_rural=True).count()
        casos_zona_urbana = Caso.query.filter_by(es_zona_rural=False).count()
        
        # Promedio de edad
        edad_promedio = db.session.query(
            db.func.avg(Caso.edad)
        ).scalar()
        
        return jsonify({
            'total_casos': total_casos,
            'por_municipio': dict(casos_por_municipio),
            'por_estado': dict(casos_por_estado),
            'por_genero': dict(casos_por_genero),
            'por_eps': dict(casos_por_eps),
            'por_zona': {
                'rural': casos_zona_rural,
                'urbana': casos_zona_urbana
            },
            'edad_promedio': round(edad_promedio, 1) if edad_promedio else None
        })
    except Exception as e:
        print(f"❌ Error al obtener estadísticas: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== MANEJO DE ERRORES ====================
@api.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Recurso no encontrado'}), 404

@api.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Error interno del servidor'}), 500
