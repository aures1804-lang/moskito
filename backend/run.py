from flask import Flask
from dotenv import load_dotenv
import os
import sys

print("=" * 50)
print("DIAGNÓSTICO DE VARIABLES DE ENTORNO")
print("=" * 50)
# Mostrar el directorio actual
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Directorio actual: {current_dir}")
# Buscar el archivo .env
env_path = os.path.join(current_dir, '.env')
print(f"Buscando .env en: {env_path}")
print(f"¿Existe el archivo?: {os.path.exists(env_path)}")
if os.path.exists(env_path):
    # Mostrar contenido del .env (sin contraseñas)
    print("\nContenido del archivo .env:")
    with open(env_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key = line.split('=')[0]
                print(f" - {key}")
   
    # Cargar el archivo .env
    load_dotenv(dotenv_path=env_path)
    print("\n✓ Archivo .env cargado")
else:
    print("\n✗ ERROR: Archivo .env NO encontrado")
    print("Crea un archivo .env en:", current_dir)
    sys.exit(1)
# Verificar variables después de cargar
print("\nVariables cargadas:")
database_url = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
secret_key = os.getenv('SECRET_KEY')
print(f"DATABASE_URL: {database_url[:30] + '...' if database_url else 'NO CARGADA'}")
print(f"SECRET_KEY: {secret_key if secret_key else 'NO CARGADA'}")
print("=" * 50)
if not database_url:
    print("\n✗ ERROR: No se pudo cargar DATABASE_URL o SQLALCHEMY_DATABASE_URI")
    print("\nAsegúrate de que tu archivo .env contenga:")
    print("DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db")
    print("SECRET_KEY=tu_clave_secreta")
    sys.exit(1)

# Crear aplicación Flask
app = Flask(__name__)
# Configuración
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = secret_key

# Inicializar SQLAlchemy (después de config)
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

# Registrar blueprint de rutas (después de db)
from app.routes import api
app.register_blueprint(api)

# Importar modelos (después de db para evitar ciclos)
try:
    from app.models import *
    print("✓ Modelos importados correctamente")
except ImportError as e:
    print(f"⚠ Advertencia: No se pudieron importar modelos - {e}")

if __name__ == '__main__':
    # Crear todas las tablas
    with app.app_context():
        try:
            db.create_all()
            print("=" * 50)
            print("✓ Tablas creadas exitosamente")
            print("=" * 50)
        except Exception as e:
            print("=" * 50)
            print(f"✗ Error al crear tablas: {e}")
            print("=" * 50)
   
    # Iniciar servidor
    print("\n🚀 Servidor Flask iniciando en http://127.0.0.1:5000")
    print("Presiona CTRL+C para detener\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
    