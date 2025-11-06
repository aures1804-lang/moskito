import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SintomasForm from './components/SintomasForm';
import CasosTable from './components/CasosTable';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container py-4">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <header className="text-center mb-5">
                    <h1 className="display-4 text-white mb-3">
                      🦟 Sistema de Vigilancia Epidemiológica
                    </h1>
                    <p className="lead text-white-50">
                      Evaluación de síntomas para enfermedades vectoriales
                    </p>
                  </header>
                  <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                      <SintomasForm />
                    </div>
                  </div>
                </>
              } 
            />
            
            <Route 
              path="/casos" 
              element={
                <div className="row justify-content-center">
                  <div className="col-12">
                    <CasosTable />
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
