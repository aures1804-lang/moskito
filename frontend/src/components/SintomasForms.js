import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const SintomasForm = () => {
  const [sintomas, setSintomas] = useState([]);
  const [resultado, setResultado] = useState(null);

  const handleCheckbox = (e) => {
    const value = e.target.value;
    setSintomas(prev => e.target.checked ? [...prev, value] : prev.filter(s => s !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/evaluar-sintomas', { sintomas });
      setResultado(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        {/* Lista simple de síntomas - agrega más según necesites */}
        <Form.Check type="checkbox" label="Fiebre alta" value="fiebre_alta" onChange={handleCheckbox} />
        <Form.Check type="checkbox" label="Dolor de cabeza" value="dolor_cabeza" onChange={handleCheckbox} />
        <Form.Check type="checkbox" label="Erupciones" value="erupciones" onChange={handleCheckbox} />
        <Form.Check type="checkbox" label="Ictericia (piel amarilla)" value="ictericia" onChange={handleCheckbox} />
        {/* Agrega el resto: dolor_muscular, nauseas, etc. */}
        <Button type="submit">Evaluar</Button>
      </Form>
      {resultado && (
        <div>
          <p>Probabilidades: {JSON.stringify(resultado.probabilidades)}</p>
          <p>{resultado.advertencia}</p>
          {/* Botón para registrar: Implementa similar con POST a /registrar-caso, usa navigator.geolocation para lat/lon */}
        </div>
      )}
    </div>
  );
};

export default SintomasForm;
