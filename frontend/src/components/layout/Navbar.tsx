import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import {
  Utensils,
  Calendar,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                SavoryByte
              </span>
              <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Halal Dining</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition ${
                isActive('/') ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-amber-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-medium transition ${
                isActive('/menu') ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-amber-400'
              }`}
            >
              Gourmet Menu
            </Link>
            <Link
              to="/reservations/book"
              className={`text-sm font-medium transition ${
                isActive('/reservations/book')
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-300 hover:text-amber-400'
              }`}
            >
              Book Table
            </Link>

            {user && (
              <>
                <Link
                  to="/my-reservations"
                  className={`text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/my-reservations')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-300 hover:text-amber-400'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/my-orders"
                  className={`text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/my-orders')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-300 hover:text-amber-400'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>My Orders</span>
                </Link>
              </>
            )}

            {user && (user.role === 'STAFF' || user.role === 'ADMIN') && (
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                <Link
                  to="/staff/kitchen"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>KDS</span>
                </Link>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center space-x-1 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.role === 'ADMIN' ? 'Executive Admin' : 'Staff Command'}</span>
                </Link>
              </div>
            )}
          </div>

          {/* User Auth Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-200">{user.full_name}</p>
                  <p className="text-[10px] font-mono text-amber-400 font-semibold">{user.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="font-bold text-xs shadow-md shadow-amber-500/20">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-200 py-1"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-200 py-1"
          >
            Gourmet Menu
          </Link>
          <Link
            to="/reservations/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-slate-200 py-1"
          >
            Book Table
          </Link>

          {user ? (
            <>
              <Link
                to="/my-reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 py-1"
              >
                My Bookings
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 py-1"
              >
                My Food Orders
              </Link>
              {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                <>
                  <Link
                    to="/staff/kitchen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-emerald-400 py-1 font-semibold"
                  >
                    Kitchen Display (KDS)
                  </Link>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-amber-400 py-1 font-semibold"
                  >
                    {user.role === 'ADMIN' ? 'Executive Dashboard' : 'Staff Command'}
                  </Link>
                </>
              )}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left text-sm font-semibold text-rose-400 py-2"
                >
                  Logout ({user.full_name})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
