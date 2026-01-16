import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MeasurementsPage from './pages/dashboard/MeasurementsPage';
import MarketplacePage from './pages/dashboard/MarketplacePage';
import OrdersPage from './pages/dashboard/OrdersPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import PricingPage from './pages/PricingPage';
import CustomizerPage from './pages/CustomizerPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/studio" element={<CustomizerPage />} />


            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="measurements" element={<MeasurementsPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="order" element={<OrdersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<ProfilePage />} /> {/* mapping settings to profile for now */}
            </Route>
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
