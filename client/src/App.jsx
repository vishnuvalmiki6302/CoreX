import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Exercises from './pages/Exercises';
import Diet from './pages/Diet';
import Products from './pages/Products';
import Classes from './pages/Classes';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AICoachChat from './components/AICoachChat';
import ClickSpark from './components/ClickSpark';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Lazy-loaded pages
import { lazy, Suspense } from 'react';
const AIFitnessAssessment = lazy(() => import('./pages/AIFitnessAssessment'));

const PageLoader = () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '14px' }}>
        Loading...
    </div>
);

// Inner component to access location for kiosk detection
function AppLayout() {
    const location = useLocation();
    const dashboardRoutes = ['/admin', '/trainer', '/reception'];
    const authRoutes = ['/login', '/register'];
    const isDashboard = dashboardRoutes.some(route => location.pathname.startsWith(route));
    const isAuth = authRoutes.some(route => location.pathname === route);

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            <Toaster
                position="top-right"
                containerStyle={{ top: 80, right: 20 }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    },
                    success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />

            {!isDashboard && <Navbar />}

            <main className={isDashboard || isAuth ? '' : 'flex-grow'}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Member Routes */}
                        <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
                        <Route path="/diets" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        {/* Dashboards */}
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/trainer" element={<ProtectedRoute><TrainerDashboard /></ProtectedRoute>} />
                        <Route path="/reception" element={<ProtectedRoute allowedRoles={['receptionist', 'admin', 'super_admin', 'gym_owner']}><ReceptionDashboard /></ProtectedRoute>} />

                        {/* AI Features */}
                        <Route path="/ai/assessment" element={<ProtectedRoute><AIFitnessAssessment /></ProtectedRoute>} />
                    </Routes>
                </Suspense>
            </main>

            {!isDashboard && !isAuth && <Footer />}

            {/* Global: AI Chat Coach (appears on all member pages) */}
            {!isDashboard && <AICoachChat />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />
                    <ClickSpark sparkColor="#f97316" sparkCount={10}>
                        <AppLayout />
                    </ClickSpark>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
