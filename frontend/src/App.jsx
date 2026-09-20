import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">INE Price Tracker</div>
          <div className="nav-links">
            <NavLink to="/" end>Search</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
