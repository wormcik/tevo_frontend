import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Client from './pages/Client';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import './global.css';

function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router>
      <Navbar />
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/page1" element={<Client />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
