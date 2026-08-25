import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/store/authContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Login } from '@/pages/public/Login';
import { Register } from '@/pages/public/Register';
import { BookTable } from '@/pages/customer/BookTable';
import { DigitalMenu } from '@/pages/customer/DigitalMenu';
import { MyReservations } from '@/pages/customer/MyReservations';
import { MyOrders } from '@/pages/customer/MyOrders';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<DigitalMenu />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Protected Routes */}
              <Route
                path="/reservations/book"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                    <BookTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reservations"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                    <MyReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
