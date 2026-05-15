import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
