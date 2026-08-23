import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { Utensils, Calendar, ShoppingBag, LayoutDashboard, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              SavoryByte
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/menu"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition"
            >
              Menu & Ordering
            </Link>
            <Link
              to="/reservations/book"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition"
            >
              Book Table
            </Link>

            {user && (
              <>
                <Link
                  to="/my-reservations"
                  className="text-sm font-medium text-slate-300 hover:text-amber-400 transition flex items-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/my-orders"
                  className="text-sm font-medium text-slate-300 hover:text-amber-400 transition flex items-center space-x-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
              </>
            )}

            {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 transition flex items-center space-x-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{user.role === 'ADMIN' ? 'Executive Dashboard' : 'Staff Portal'}</span>
              </Link>
            )}
          </div>

          {/* User Auth Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-400">
                  {user.full_name} ({user.role})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 py-2"
          >
            Menu & Ordering
          </Link>
          <Link
            to="/reservations/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 py-2"
          >
            Book Table
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 py-2"
              >
                My Bookings
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-300 py-2"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-sm font-medium text-rose-400 py-2"
              >
                Logout ({user.full_name})
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
