import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Badge, Spinner, Alert, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import config from '../config';

const CasosTable = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(null);

  // Cargar casos al montar el componente
  useEffect(() => {
    cargarCasos();
  }, []);

  const cargarCasos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando casos desde:', `${config.API_URL}/api/casos`);
      const response = await axios.get(`${config.API_URL}/api/casos`);
      console.log('✅ Casos cargados:', response.data);
      setCasos(response.data.casos || []);
    } catch (error) {
      console.error('❌ Error al cargar casos:', error);
      setError('Error al cargar los casos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar estado de un caso
  const actualizarEstado = async (casoId, nuevoEstado) => {
    setActualizandoEstado(casoId);
    
    try {
      console.log(`🔄 Actualizando caso #${casoId} a estado: ${nuevoEstado}`);
      
      const response = await axios.patch(
        `${config.API_URL}/api/casos/${casoId}`,
        { estado: nuevoEstado }
      );
      
      console.log('✅ Estado actualizado:', response.data);
      
      // Actualizar el caso en el estado local
      setCasos(casos.map(caso => 
        caso.id === casoId ? { ...caso, estado: nuevoEstado } : caso
      ));
      
      // Mostrar mensaje de éxito
      alert(`✅ Estado del caso #${casoId} actualizado a: ${nuevoEstado}`);
      
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      alert(`❌ Error al actualizar el estado: ${error.response?.data?.error || error.message}`);
    } finally {
      setActualizandoEstado(null);
    }
  };

  // Filtrar casos según búsqueda
  const casosFiltrados = casos.filter(caso => {
    const matchMunicipio = filtroMunicipio === '' || caso.municipio === filtroMunicipio;
    const matchEstado = filtroEstado === '' || caso.estado === filtroEstado;
    const matchBusqueda = busqueda === '' || 
      caso.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.id?.toString().includes(busqueda);
    
    return matchMunicipio && matchEstado && matchBusqueda;
  });

  // Obtener lista única de municipios
  const municipiosUnicos = [...new Set(casos.map(c => c.municipio).filter(Boolean))];

  // Función para obtener color del badge según enfermedad
  const getEnfermedadColor = (probabilidades) => {
    if (!probabilidades) return 'secondary';
    
    const enfermedades = Object.entries(probabilidades);
    if (enfermedades.length === 0) return 'secondary';
    
    const [enfermedad, prob] = enfermedades.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    if (prob > 70) return 'danger';
    if (prob > 50) return 'warning';
    return 'info';
  };

  // Función para obtener la enfermedad más probable
  const getEnfermedadPrincipal = (probabilidades) => {
    if (!probabilidades) return 'N/A';
    
    const enfermedades = Object.entries(probabilidades);
    if (enfermedades.length === 0) return 'N/A';
    
    const [enfermedad, prob] = enfermedades.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return `${enfermedad.replace('_', ' ')} (${prob.toFixed(1)}%)`;
  };

  // Función para formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para el dropdown de estado
  const EstadoDropdown = ({ caso }) => {
    const getEstadoVariant = (estado) => {
      switch(estado) {
        case 'confirmado': return 'success';
        case 'descartado': return 'secondary';
        case 'en_revision': return 'info';
        default: return 'warning';
      }
    };

    const getEstadoLabel = (estado) => {
      switch(estado) {
        case 'confirmado': return '✅ Confirmado';
        case 'descartado': return '❌ Descartado';
        case 'en_revision': return '🔍 En Revisión';
        default: return '⏳ Pendiente';
      }
    };

    return (
      <Dropdown>
        <Dropdown.Toggle 
          variant={getEstadoVariant(caso.estado)} 
          size="sm"
          disabled={actualizandoEstado === caso.id}
        >
          {actualizandoEstado === caso.id ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Actualizando...
            </>
          ) : (
            getEstadoLabel(caso.estado)
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item 
            onClick={() => actualizarEstado(caso.id, 'pendiente')}
            active={caso.estado === 'pendiente'}
          >
            ⏳ Pendiente
          </Dropdown.Item>
          
          <Dropdown.Item 
            onClick={() => actualizarEstado(caso.id, 'en_revision')}
            active={caso.estado === 'en_revision'}
          >
            🔍 En Revisión
          </Dropdown.Item>
          
          <Dropdown.Divider />
          
          <Dropdown.Item 
            onClick={() => actualizarEstado(caso.id, 'confirmado')}
            active={caso.estado === 'confirmado'}
          >
            ✅ Confirmado
          </Dropdown.Item>
          
          <Dropdown.Item 
            onClick={() => actualizarEstado(caso.id, 'descartado')}
            active={caso.estado === 'descartado'}
          >
            ❌ Descartado
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <Card className="shadow-lg">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>📊 Casos Registrados</h3>
            <p className="text-muted mb-0">
              Total: <strong>{casos.length}</strong> casos | 
              Mostrando: <strong>{casosFiltrados.length}</strong>
            </p>
          </div>
          <Button variant="primary" onClick={cargarCasos} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cargando...
              </>
            ) : (
              '🔄 Actualizar'
            )}
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-3 border-light bg-light">
          <Card.Body>
            <h6 className="mb-3">🔍 Filtros</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <InputGroup>
                  <InputGroup.Text>🔎</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre o ID..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </InputGroup>
              </div>
              
              <div className="col-md-4">
                <Form.Select
                  value={filtroMunicipio}
                  onChange={(e) => setFiltroMunicipio(e.target.value)}
                >
                  <option value="">Todos los municipios</option>
                  {municipiosUnicos.map((municipio, index) => (
                    <option key={index} value={municipio}>{municipio}</option>
                  ))}
                </Form.Select>
              </div>

              <div className="col-md-4">
                <Form.Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="en_revision">🔍 En Revisión</option>
                  <option value="confirmado">✅ Confirmado</option>
                  <option value="descartado">❌ Descartado</option>
                </Form.Select>
              </div>
            </div>

            {(busqueda || filtroMunicipio || filtroEstado) && (
              <div className="text-end mt-2">
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroMunicipio('');
                    setFiltroEstado('');
                  }}
                >
                  ✖️ Limpiar filtros
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Mensajes de estado */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando casos...</p>
          </div>
        ) : casosFiltrados.length === 0 ? (
          <Alert variant="info">
            {casos.length === 0 
              ? '📋 No hay casos registrados aún.'
              : '🔍 No se encontraron casos con los filtros aplicados.'}
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-primary">
                <tr>
                  <th className="text-center">ID</th>
                  <th>Paciente</th>
                  <th>Edad</th>
                  <th>Género</th>
                  <th>Ubicación</th>
                  <th>Enfermedad Probable</th>
                  <th>Fecha</th>
                  <th className="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {casosFiltrados.map((caso) => (
                  <tr key={caso.id}>
                    <td className="text-center">
                      <strong>#{caso.id}</strong>
                    </td>
                    <td>
                      <strong>{caso.nombre}</strong> {caso.apellido}
                    </td>
                    <td>{caso.edad || 'N/A'}</td>
                    <td>
                      {caso.genero ? (
                        <span className="text-capitalize">{caso.genero}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {caso.barrio && <div><small>🏘️ {caso.barrio}</small></div>}
                      <div><small>🏙️ {caso.municipio || 'N/A'}</small></div>
                      <div>
                        <small className="text-muted">
                          📍 {caso.lat?.toFixed(4)}, {caso.lon?.toFixed(4)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getEnfermedadColor(caso.probabilidades)}>
                        {getEnfermedadPrincipal(caso.probabilidades)}
                      </Badge>
                      {caso.sintomas && (
                        <div className="mt-1">
                          <small className="text-muted">
                            {caso.sintomas.length} síntoma(s)
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      <small>{formatearFecha(caso.timestamp)}</small>
                    </td>
                    <td className="text-center">
                      <EstadoDropdown caso={caso} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Estadísticas rápidas */}
        {casos.length > 0 && (
          <Card className="mt-3 border-light bg-light">
            <Card.Body>
              <h6 className="mb-3">📈 Estadísticas Rápidas</h6>
              <div className="row text-center">
                <div className="col-md-3">
                  <h4 className="text-primary">{casos.length}</h4>
                  <small className="text-muted">Total Casos</small>
                </div>
                <div className="col-md-3">
                  <h4 className="text-warning">
                    {casos.filter(c => c.estado === 'pendiente').length}
                  </h4>
                  <small className="text-muted">Pendientes</small>
                </div>
                <div className="col-md-3">
                  <h4 className="text-success">
                    {casos.filter(c => c.estado === 'confirmado').length}
                  </h4>
                  <small className="text-muted">Confirmados</small>
                </div>
                <div className="col-md-3">
                  <h4 className="text-info">
                    {Math.round(casos.reduce((acc, c) => acc + (c.edad || 0), 0) / casos.length) || 0}
                  </h4>
                  <small className="text-muted">Edad Promedio</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default CasosTable;