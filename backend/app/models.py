from app import db
from datetime import datetime

class Caso(db.Model):
    __tablename__ = 'casos'
   
    id = db.Column(db.Integer, primary_key=True)
    sintomas = db.Column(db.JSON)
    probabilidades = db.Column(db.JSON)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
   
    # Datos personales
    nombre = db.Column(db.String(100))           # ← NUEVO
    apellido = db.Column(db.String(100))         # ← NUEVO
    edad = db.Column(db.Integer)
    genero = db.Column(db.String(20))
    
    # Datos de ubicación
    municipio = db.Column(db.String(100))
    barrio = db.Column(db.String(100))
    
    # Estado del caso
    estado = db.Column(db.String(20), default='pendiente')
   
    def __repr__(self):
        return f'<Caso {self.id} - {self.nombre} {self.apellido}>'
   
    def to_dict(self):
        return {
            'id': self.id,
            'sintomas': self.sintomas,
            'probabilidades': self.probabilidades,
            'lat': self.lat,
            'lon': self.lon,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'edad': self.edad,
            'genero': self.genero,
            'municipio': self.municipio,
            'barrio': self.barrio,
            'estado': self.estado
        }
    