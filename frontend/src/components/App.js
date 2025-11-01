import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SintomasForm from './components/SintomasForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Vigilancia Epidemiológica</h1>
        <SintomasForm />
      </header>
    </div>
  );
}

export default App;

