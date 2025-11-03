from backend.app import create_app
import os
import sys

# Asegurar que la carpeta raíz esté en el path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("🦟 MOSKITO - Sistema de Vigilancia Epidemiológica")
print("=" * 50)

# Verificar que existe el archivo .env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')

print(f"📁 Directorio de trabajo: {current_dir}")
print(f"🔍 Buscando .env en: {env_path}")
print(f"{'✓' if os.path.exists(env_path) else '✗'} Archivo .env {'encontrado' if os.path.exists(env_path) else 'NO encontrado'}")

if not os.path.exists(env_path):
    print("\n❌ ERROR: Archivo .env no encontrado")
    print("Crea un archivo .env con:")
    print("DATABASE_URL=postgresql://vigilancia_user:Alfa$1234@localhost:5432/vigilancia_db")
    print("SECRET_KEY=tu_clave_secreta")
    sys.exit(1)

print("\n" + "=" * 50)
print("🚀 Iniciando servidor Flask...")
print("=" * 50)

# Crear la aplicación usando el factory pattern
app = create_app()

if __name__ == '__main__':
    print("\n✓ Servidor corriendo en: http://127.0.0.1:5000")
    print("✓ CORS habilitado para: http://localhost:3000")
    print("✓ Presiona CTRL+C para detener\n")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        use_reloader=True
    )