import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/store/authContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Public Pages
import { Login } from '@/pages/public/Login';
import { Register } from '@/pages/public/Register';

// Customer Pages
import { BookTable } from '@/pages/customer/BookTable';
import { DigitalMenu } from '@/pages/customer/DigitalMenu';
import { MyReservations } from '@/pages/customer/MyReservations';
import { MyOrders } from '@/pages/customer/MyOrders';

// Staff Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { KitchenDisplay } from '@/pages/staff/KitchenDisplay';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ManageTables } from '@/pages/admin/ManageTables';
import { ManageMenu } from '@/pages/admin/ManageMenu';

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

              {/* Staff Protected Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <KitchenDisplay />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tables"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageTables />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageMenu />
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
