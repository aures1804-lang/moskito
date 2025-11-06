// Detectar automáticamente el entorno
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://moskito-tur4.onrender.com' 
                  : 'http://localhost:5000');

const config = {
  API_URL
};

export default config;
