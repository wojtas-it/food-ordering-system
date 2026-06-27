import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import KitchenDisplay from './pages/KitchenDisplay';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import KitchenGate from './pages/KitchenGate';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/kitchen-gate" element={<KitchenGate />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute requireKucharz={true}>
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
