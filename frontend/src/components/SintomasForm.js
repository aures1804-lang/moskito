import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Card, Alert, Spinner } from 'react-bootstrap';

const SintomasForm = () => {
  const [sintomas, setSintomas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listaSintomas = [
    { value: 'fiebre_alta', label: 'Fiebre alta (>38°C)' },
    { value: 'fiebre_baja', label: 'Fiebre baja' },
    { value: 'fiebre_ciclica', label: 'Fiebre cíclica' },
    { value: 'dolor_cabeza', label: 'Dolor de cabeza intenso' },
    { value: 'dolor_muscular', label: 'Dolor muscular' },
    { value: 'dolor_articular', label: 'Dolor articular' },
    { value: 'dolor_abdominal', label: 'Dolor abdominal' },
    { value: 'erupciones', label: 'Erupciones en la piel' },
    { value: 'conjuntivitis', label: 'Conjuntivitis (ojos rojos)' },
    { value: 'nauseas', label: 'Náuseas' },
    { value: 'vomitos', label: 'Vómitos' },
    { value: 'fatiga', label: 'Fatiga extrema' },
    { value: 'escalofrios', label: 'Escalofríos' },
    { value: 'sudoracion', label: 'Sudoración excesiva' },
    { value: 'ictericia', label: 'Ictericia (piel/ojos amarillos)' },
    { value: 'sangrado', label: 'Sangrado inusual' }
  ];

  const handleCheckbox = (e) => {
    const value = e.target.value;
    setSintomas(prev => 
      e.target.checked ? [...prev, value] : prev.filter(s => s !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    if (sintomas.length === 0) {
      setError('Por favor selecciona al menos un síntoma');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/evaluar-sintomas', { 
        sintomas 
      });
      setResultado(res.data);
    } catch (error) {
      console.error('Error al evaluar síntomas:', error);
      setError('Error al conectar con el servidor. Verifica que el backend esté corriendo en el puerto 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
  console.log('🚀 Iniciando registro de caso...');
  console.log('📊 Datos actuales:', {
    sintomas,
    resultado,
    tieneResultado: !!resultado,
    tieneProbabilidades: !!resultado?.probabilidades
  });

  if (!navigator.geolocation) {
    console.error('❌ Navegador no soporta geolocalización');
    alert('Tu navegador no soporta geolocalización');
    return;
  }

  console.log('🔍 Solicitando ubicación al navegador...');

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        console.log('✅ Ubicación obtenida:', { lat, lon });
        
        const datosEnviar = {
          sintomas,
          probabilidades: resultado.probabilidades,
          lat,
          lon,
          municipio: 'Buenaventura',
          estado: 'pendiente'
        };
        
        console.log('📤 Enviando datos al servidor:', datosEnviar);
        console.log('🌐 URL del servidor:', 'http://localhost:5000/api/casos');
        
        const response = await axios.post('http://localhost:5000/api/casos', datosEnviar);
        
        console.log('✅ Respuesta exitosa del servidor:', response.data);
        alert('✅ Caso registrado exitosamente con ID: ' + response.data.caso?.id);
        
        // Limpiar formulario
        setSintomas([]);
        setResultado(null);
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        
      } catch (error) {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('📋 Error.message:', error.message);
        console.error('📋 Error.response:', error.response);
        console.error('📋 Error.response.data:', error.response?.data);
        console.error('📋 Error.response.status:', error.response?.status);
        
        const mensajeError = error.response?.data?.error || error.message || 'Error desconocido';
        alert(`❌ Error al registrar el caso: ${mensajeError}`);
      }
    },
    (error) => {
      console.error('❌ Error de geolocalización:', error);
      console.error('📋 Código de error:', error.code);
      console.error('📋 Mensaje:', error.message);
      
      const mensajes = {
        1: 'Permiso denegado. Por favor permite el acceso a tu ubicación.',
        2: 'Posición no disponible. Verifica tu conexión GPS.',
        3: 'Tiempo de espera agotado.'
      };
      
      alert(`⚠️ ${mensajes[error.code] || error.message}`);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

  return (
    <Card className="shadow-lg">
      <Card.Body className="p-4">
        <Card.Title className="text-center mb-4">
          <h3>📋 Evaluación de Síntomas</h3>
          <p className="text-muted small">Selecciona los síntomas que presentas actualmente</p>
        </Card.Title>

        <Form onSubmit={handleSubmit}>
          <div className="row">
            {listaSintomas.map((sintoma, index) => (
              <div key={index} className="col-md-6 mb-2">
                <Form.Check
                  type="checkbox"
                  label={sintoma.label}
                  value={sintoma.value}
                  onChange={handleCheckbox}
                  id={`sintoma-${index}`}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg"
              disabled={loading || sintomas.length === 0}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Evaluando...
                </>
              ) : (
                '🔍 Evaluar Síntomas'
              )}
            </Button>
          </div>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}

        {resultado && (
          <Card className="mt-4 border-primary">
            <Card.Body>
              <h5 className="text-primary mb-3">📊 Resultados de la Evaluación</h5>
              
              {resultado.probabilidades ? (
                <>
                  <div className="mb-3">
                    <strong>Probabilidades estimadas:</strong>
                    {Object.entries(resultado.probabilidades).map(([enfermedad, prob]) => (
                      <div key={enfermedad} className="mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-capitalize">{enfermedad.replace('_', ' ')}</span>
                          <span className="badge bg-primary">{prob.toFixed(1)}%</span>
                        </div>
                        <div className="progress mt-1" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${prob}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Alert variant="warning" className="mb-3">
                    <small>
                      ⚠️ {resultado.advertencia || 'Esta es una estimación preliminar. Consulta a un profesional de salud para un diagnóstico preciso.'}
                    </small>
                  </Alert>

                  <div className="text-center">
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleRegistrar}
                    >
                      📍 Registrar Caso con Ubicación
                    </Button>
                  </div>
                </>
              ) : (
                <Alert variant="info">
                  {resultado.mensaje || 'Baja probabilidad de enfermedades vectoriales. Monitorea tus síntomas.'}
                </Alert>
              )}
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default SintomasForm;

