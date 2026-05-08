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
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AICoachChat from './components/AICoachChat';
import ClickSpark from './components/ClickSpark';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Lazy-loaded Phase 1–3 pages (code-split for performance)
import { lazy, Suspense } from 'react';
const ReceptionDashboard = lazy(() => import('./pages/ReceptionDashboard'));
const AIFitnessAssessment = lazy(() => import('./pages/AIFitnessAssessment'));
const QRKiosk = lazy(() => import('./pages/QRKiosk'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));

const PageLoader = () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '14px' }}>
        Loading...
    </div>
);

// Inner component to access location for kiosk detection
function AppLayout() {
    const location = useLocation();
    const isKiosk = location.pathname === '/kiosk';

    return (
        <div className="min-h-screen bg-gym-dark text-gym-text flex flex-col">
            <Toaster
                position="top-right"
                containerStyle={{ top: 80, right: 20 }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        color: '#0f172a',
                        border: '1px solid rgba(0,0,0,0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    },
                    success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />

            {!isKiosk && <Navbar />}

            <main className={isKiosk ? '' : 'flex-grow container mx-auto px-4 py-8'}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/kiosk" element={<QRKiosk />} />

                        {/* Protected Member Routes */}
                        <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
                        <Route path="/diets" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                        {/* Phase 1: Dashboards */}
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/trainer" element={<ProtectedRoute><TrainerDashboard /></ProtectedRoute>} />
                        <Route path="/reception" element={<ProtectedRoute><ReceptionDashboard /></ProtectedRoute>} />

                        {/* Phase 2: AI Features */}
                        <Route path="/ai/assessment" element={<ProtectedRoute><AIFitnessAssessment /></ProtectedRoute>} />

                        {/* Phase 3: Analytics */}
                        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                    </Routes>
                </Suspense>
            </main>

            {!isKiosk && <Footer />}

            {/* Global: AI Chat Coach (appears on all member pages) */}
            {!isKiosk && <AICoachChat />}
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
