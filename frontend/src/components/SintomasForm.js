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
    identificacion: '',
    nombre: '',
    apellido: '',
    telefono: '',
    edad: '',
    genero: '',
    eps: '',
    barrio: '',
    municipio: 'Buenaventura',
    es_residencia_permanente: true,
    es_zona_rural: false,
    nombre_zona_rural: ''
  });

  // Lista de EPS
  const listaEPS = [
    'E.P.S. Sanitas S.A.',
    'Emssanar E.S.S.',
    'SURA EPS y Medicina Prepagada Suramericana S.A.',
    'Familiar de Colombia',
    'Mallamas',
    'Mutual Ser',
    'Nueva EPS S.A.',
    'Salud Bolívar EPS S.A.S.',
    'Salud Mía',
    'Salud Total S.A. E.P.S.',
    'Savia Salud EPS',
    'SOS EPS. Servicio Occidental de Salud S.A.'
  ];

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
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al evaluar síntomas:', error);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario de datos personales
  const handleDatosChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosPersonales({
      ...datosPersonales,
      [name]: type === 'checkbox' ? checked : value
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
    
    // ============ VALIDACIONES ============
    
    // Validar identificación
    if (!datosPersonales.identificacion.trim()) {
      alert('⚠️ Por favor ingresa el número de identificación (cédula)');
      return;
    }
    
    if (datosPersonales.identificacion.trim().length < 5) {
      alert('⚠️ El número de identificación debe tener al menos 5 dígitos');
      return;
    }
    
    // Validar nombre
    if (!datosPersonales.nombre.trim()) {
      alert('⚠️ Por favor ingresa el nombre');
      return;
    }
    
    // Validar edad
    if (!datosPersonales.edad || datosPersonales.edad < 1 || datosPersonales.edad > 120) {
      alert('⚠️ Por favor ingresa una edad válida (1-120)');
      return;
    }
    
    // Validar teléfono (opcional pero con formato)
    if (datosPersonales.telefono && datosPersonales.telefono.trim().length < 7) {
      alert('⚠️ El teléfono debe tener al menos 7 dígitos');
      return;
    }
    
    // Validar zona rural
    if (datosPersonales.es_zona_rural && !datosPersonales.nombre_zona_rural.trim()) {
      alert('⚠️ Por favor especifica el nombre de la zona rural o consejo comunitario');
      return;
    }

    // ============ GEOLOCALIZACIÓN ============
    
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
            identificacion: datosPersonales.identificacion.trim(),
            nombre: datosPersonales.nombre.trim(),
            apellido: datosPersonales.apellido.trim() || null,
            telefono: datosPersonales.telefono.trim() || null,
            edad: parseInt(datosPersonales.edad),
            genero: datosPersonales.genero || null,
            eps: datosPersonales.eps || null,
            sintomas,
            probabilidades: resultado.probabilidades,
            lat,
            lon,
            municipio: datosPersonales.municipio,
            barrio: datosPersonales.barrio.trim() || null,
            es_residencia_permanente: datosPersonales.es_residencia_permanente,
            es_zona_rural: datosPersonales.es_zona_rural,
            nombre_zona_rural: datosPersonales.es_zona_rural && datosPersonales.nombre_zona_rural 
            ? datosPersonales.nombre_zona_rural.trim() 
            : null,  // ← VERIFICA ESTA LÍNEA
            estado: 'pendiente'
          };
          
          console.log('📤 Enviando datos al servidor:', datosEnviar);
          console.log('🌾 Es zona rural:', datosEnviar.es_zona_rural);
          console.log('🌳 Nombre zona rural:', datosEnviar.nombre_zona_rural);
          console.log('🌐 API URL:', config.API_URL);
          
          const response = await axios.post(`${config.API_URL}/api/casos`, datosEnviar);
          
          console.log('✅ Respuesta exitosa del servidor:', response.data);
          alert(`✅ Caso registrado exitosamente\n\nIdentificación: ${datosPersonales.identificacion}\nNombre: ${datosPersonales.nombre}\n\nGracias por reportar tus síntomas.`);
          
          // Limpiar todo
          setMostrarFormulario(false);
          setSintomas([]);
          setResultado(null);
          setDatosPersonales({
            identificacion: '',
            nombre: '',
            apellido: '',
            telefono: '',
            edad: '',
            genero: '',
            eps: '',
            barrio: '',
            municipio: 'Buenaventura',
            es_residencia_permanente: true,
            es_zona_rural: false,
            nombre_zona_rural: ''
          });
          document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          
        } catch (error) {
          console.error('❌ ERROR COMPLETO:', error);
          console.error('📋 Error.response.data:', error.response?.data);
          
          const mensajeError = error.response?.data?.error || error.message || 'Error desconocido';
          alert(`❌ Error al registrar el caso:\n\n${mensajeError}`);
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
                        {/* IDENTIFICACIÓN Y NOMBRE */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <Form.Label>Número de Identificación (Cédula) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="identificacion"
                              value={datosPersonales.identificacion}
                              onChange={handleDatosChange}
                              placeholder="Ej: 1234567890"
                              required
                            />
                            <Form.Text className="text-muted">
                              Sin puntos ni espacios
                            </Form.Text>
                          </div>

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
                        </div>

                        {/* APELLIDO Y TELÉFONO */}
                        <div className="row">
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

                          <div className="col-md-6 mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                              type="tel"
                              name="telefono"
                              value={datosPersonales.telefono}
                              onChange={handleDatosChange}
                              placeholder="Ej: 3001234567"
                            />
                            <Form.Text className="text-muted">
                              Mínimo 7 dígitos
                            </Form.Text>
                          </div>
                        </div>

                        {/* EDAD Y GÉNERO */}
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

                        {/* EPS */}
                        <div className="row">
                          <div className="col-12 mb-3">
                            <Form.Label>EPS (Entidad Promotora de Salud)</Form.Label>
                            <Form.Select
                              name="eps"
                              value={datosPersonales.eps}
                              onChange={handleDatosChange}
                            >
                              <option value="">Selecciona tu EPS...</option>
                              {listaEPS.map((eps, index) => (
                                <option key={index} value={eps}>{eps}</option>
                              ))}
                            </Form.Select>
                          </div>
                        </div>

                        {/* BARRIO Y MUNICIPIO */}
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

                        {/* RESIDENCIA PERMANENTE */}
                        <div className="row">
                          <div className="col-12 mb-3">
                            <Form.Check
                              type="checkbox"
                              name="es_residencia_permanente"
                              checked={datosPersonales.es_residencia_permanente}
                              onChange={handleDatosChange}
                              label="🏠 El barrio indicado es mi lugar de residencia permanente"
                            />
                          </div>
                        </div>

                        {/* ZONA RURAL */}
                        <div className="row">
                          <div className="col-12 mb-3">
                            <Form.Check
                              type="checkbox"
                              name="es_zona_rural"
                              checked={datosPersonales.es_zona_rural}
                              onChange={handleDatosChange}
                              label="🌾 Resido en zona rural"
                            />
                          </div>
                        </div>

                        {/* NOMBRE ZONA RURAL (solo si está marcado) */}
                        {datosPersonales.es_zona_rural && (
                          <div className="row">
                            <div className="col-12 mb-3">
                              <Form.Label>Nombre de la Zona Rural o Consejo Comunitario <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="text"
                                name="nombre_zona_rural"
                                value={datosPersonales.nombre_zona_rural}
                                onChange={handleDatosChange}
                                placeholder="Ej: Consejo Comunitario La Bocana"
                                required={datosPersonales.es_zona_rural}
                              />
                            </div>
                          </div>
                        )}

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
