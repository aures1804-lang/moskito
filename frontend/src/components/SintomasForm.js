import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Card, Alert, Spinner, Collapse } from 'react-bootstrap';
import config from '../config';

const SintomasForm = () => {
  const [sintomas, setSintomas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para mostrar/ocultar formulario de datos personales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    genero: '',
    barrio: '',
    municipio: 'Buenaventura'
  });

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
      const res = await axios.post(`${config.API_URL}/evaluar-sintomas`, { 
         sintomas 
      });
      setResultado(res.data);
      setMostrarFormulario(false); // Ocultar formulario al evaluar nuevos síntomas
    } catch (error) {
      console.error('Error al evaluar síntomas:', error);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario de datos personales
  const handleDatosChange = (e) => {
    setDatosPersonales({
      ...datosPersonales,
      [e.target.name]: e.target.value
    });
  };

  // Mostrar formulario de datos personales
  const handleMostrarFormulario = () => {
    console.log('🔔 Mostrando formulario de datos personales');
    setMostrarFormulario(true);
  };

  // Registrar caso con datos personales
  const handleRegistrarConDatos = async () => {
    console.log('🚀 Iniciando registro de caso con datos personales...');
    console.log('📋 Datos a enviar:', datosPersonales);
    
    // Validar campos requeridos
    if (!datosPersonales.nombre.trim()) {
      alert('⚠️ Por favor ingresa tu nombre');
      return;
    }
    
    if (!datosPersonales.edad || datosPersonales.edad < 1 || datosPersonales.edad > 120) {
      alert('⚠️ Por favor ingresa una edad válida (1-120)');
      return;
    }

    if (!navigator.geolocation) {
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
            nombre: datosPersonales.nombre.trim(),
            apellido: datosPersonales.apellido.trim() || null,
            edad: parseInt(datosPersonales.edad),
            genero: datosPersonales.genero || null,
            barrio: datosPersonales.barrio.trim() || null,
            municipio: datosPersonales.municipio,
            estado: 'pendiente'
          };
          
          console.log('📤 Enviando datos al servidor:', datosEnviar);
          
          const response = await axios.post(`${config.API_URL}/api/casos`, datosEnviar);
          
          console.log('✅ Respuesta exitosa del servidor:', response.data);
          alert(`✅ Caso registrado exitosamente con ID: ${response.data.caso?.id}\n\nGracias ${datosPersonales.nombre} por reportar tus síntomas.`);
          
          // Limpiar todo
          setMostrarFormulario(false);
          setSintomas([]);
          setResultado(null);
          setDatosPersonales({
            nombre: '',
            apellido: '',
            edad: '',
            genero: '',
            barrio: '',
            municipio: 'Buenaventura'
          });
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          
        } catch (error) {
          console.error('❌ ERROR COMPLETO:', error);
          console.error('📋 Error.response.data:', error.response?.data);
          
          const mensajeError = error.response?.data?.error || error.message || 'Error desconocido';
          alert(`❌ Error al registrar el caso: ${mensajeError}`);
        }
      },
      (error) => {
        console.error('❌ Error de geolocalización:', error);
        
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
                      ⚠️ {resultado.advertencia || 'Esta es una estimación preliminar. Consulta a un profesional de salud.'}
                    </small>
                  </Alert>

                  <div className="text-center mb-3">
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleMostrarFormulario}
                    >
                      📍 Registrar Caso con Ubicación
                    </Button>
                  </div>

                  {/* Formulario colapsable de datos personales */}
                  <Collapse in={mostrarFormulario}>
                    <div>
                      <hr />
                      <h5 className="text-center mb-3">👤 Datos Personales</h5>
                      
                      <Form>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="nombre"
                              value={datosPersonales.nombre}
                              onChange={handleDatosChange}
                              placeholder="Ingresa tu nombre"
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control
                              type="text"
                              name="apellido"
                              value={datosPersonales.apellido}
                              onChange={handleDatosChange}
                              placeholder="Ingresa tu apellido"
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Form.Label>Edad <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="number"
                              name="edad"
                              value={datosPersonales.edad}
                              onChange={handleDatosChange}
                              placeholder="Ingresa tu edad"
                              min="1"
                              max="120"
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <Form.Label>Género</Form.Label>
                            <Form.Select
                              name="genero"
                              value={datosPersonales.genero}
                              onChange={handleDatosChange}
                            >
                              <option value="">Selecciona...</option>
                              <option value="masculino">Masculino</option>
                              <option value="femenino">Femenino</option>
                              <option value="otro">Otro</option>
                              <option value="prefiero_no_decir">Prefiero no decir</option>
                            </Form.Select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Form.Label>Barrio</Form.Label>
                            <Form.Control
                              type="text"
                              name="barrio"
                              value={datosPersonales.barrio}
                              onChange={handleDatosChange}
                              placeholder="Ingresa tu barrio"
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <Form.Label>Municipio</Form.Label>
                            <Form.Control
                              type="text"
                              name="municipio"
                              value={datosPersonales.municipio}
                              onChange={handleDatosChange}
                              placeholder="Municipio"
                            />
                          </div>
                        </div>

                        <Alert variant="info" className="small mb-3">
                          <strong>📍 Nota:</strong> Tu ubicación GPS será capturada automáticamente al registrar el caso.
                        </Alert>

                        <div className="text-center">
                          <Button 
                            variant="secondary" 
                            className="me-2"
                            onClick={() => setMostrarFormulario(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="success"
                            onClick={handleRegistrarConDatos}
                          >
                            ✅ Registrar Caso Ahora
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Collapse>
                </>
              ) : (
                <Alert variant="info">
                  {resultado.mensaje || 'Baja probabilidad de enfermedades vectoriales.'}
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