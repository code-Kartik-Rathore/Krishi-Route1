import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputForm from './pages/InputForm';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InputForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </Router>
  );
}

export default App;
