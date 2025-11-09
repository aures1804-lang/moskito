from backend.app import db
from datetime import datetime

class Caso(db.Model):
    __tablename__ = 'casos'
   
    id = db.Column(db.Integer, primary_key=True)
    
    # ========== DATOS DE IDENTIFICACIÓN ==========
    identificacion = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    edad = db.Column(db.Integer, nullable=False)
    genero = db.Column(db.String(20))
    
    # ========== DATOS DE SALUD ==========
    eps = db.Column(db.String(100))
    sintomas = db.Column(db.JSON, nullable=False)
    probabilidades = db.Column(db.JSON)
    estado = db.Column(db.String(20), default='pendiente')
    
    # ========== DATOS DE UBICACIÓN ==========
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    municipio = db.Column(db.String(100))
    barrio = db.Column(db.String(100))
    es_residencia_permanente = db.Column(db.Boolean, default=True)
    
    # ========== ZONA RURAL ==========
    es_zona_rural = db.Column(db.Boolean, default=False)
    nombre_zona_rural = db.Column(db.String(200))
    
    # ========== METADATA ==========
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
   
    def __repr__(self):
        return f'<Caso {self.identificacion} - {self.nombre} {self.apellido}>'
   
    def to_dict(self):
        return {
            'id': self.id,
            'identificacion': self.identificacion,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'telefono': self.telefono,
            'edad': self.edad,
            'genero': self.genero,
            'eps': self.eps,
            'sintomas': self.sintomas,
            'probabilidades': self.probabilidades,
            'estado': self.estado,
            'lat': self.lat,
            'lon': self.lon,
            'municipio': self.municipio,
            'barrio': self.barrio,
            'es_residencia_permanente': self.es_residencia_permanente,
            'es_zona_rural': self.es_zona_rural,
            'nombre_zona_rural': self.nombre_zona_rural,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }