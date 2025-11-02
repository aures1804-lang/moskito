from . import db  # Import relativo desde el paquete app
from datetime import datetime

class Caso(db.Model):
    __tablename__ = 'casos'
   
    id = db.Column(db.Integer, primary_key=True)
    sintomas = db.Column(db.JSON)
    probabilidades = db.Column(db.JSON)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
   
    municipio = db.Column(db.String(100))
    barrio = db.Column(db.String(100))
    edad = db.Column(db.Integer)
    genero = db.Column(db.String(10))
    estado = db.Column(db.String(20), default='pendiente')
   
    def __repr__(self):
        return f'<Caso {self.id} - {self.timestamp}>'
   
    def to_dict(self):
        return {
            'id': self.id,
            'sintomas': self.sintomas,
            'probabilidades': self.probabilidades,
            'lat': self.lat,
            'lon': self.lon,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'municipio': self.municipio,
            'barrio': self.barrio,
            'edad': self.edad,
            'genero': self.genero,
            'estado': self.estado
        }
    
    