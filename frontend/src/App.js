import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SintomasForm from './components/SintomasForm';

function App() {
  return (
    <div className="App">
      <div className="container py-5">
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
      </div>
    </div>
  );
}

export default App;
