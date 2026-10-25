// components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Menu,
  X,
  Search,
  User,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Edit,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import SearchModal from '@/components/SearchModal';

// Little red pill with the unread number
const CountBadge: React.FC<{ count: number; className?: string }> = ({ count, className = '' }) =>
  count > 0 ? (
    <span
      className={`min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const avatarSrc = user
    ? user.avatar ||
      `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user.username)}`
    : '';

  const dropdownItem =
    'flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors';
  const mobileItem = 'block px-4 py-2 hover:bg-muted rounded-lg transition-colors';

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-display text-2xl font-bold gradient-text">NEXUS</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/games" className="text-foreground hover:text-primary transition-colors font-medium">
              Games
            </Link>
            <Link to="/forum" className="text-foreground hover:text-primary transition-colors font-medium">
              Forum
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated && user && (
              <Link to="/notifications" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <CountBadge count={unreadCount} className="absolute -top-1 -right-1" />
                </Button>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={avatarSrc}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-primary object-cover"
                  />
                  <span className="font-medium">{user.username}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
                      <div className="p-3 border-b border-border">
                        <p className="font-semibold text-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItem}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItem}
                        >
                          <Bell className="w-4 h-4" />
                          <span>Notifications</span>
                          <CountBadge count={unreadCount} className="ml-auto" />
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItem}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className={dropdownItem}
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className={`${dropdownItem} text-primary`}
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-border py-2">
                        <button
                          onClick={handleLogout}
                          className={`${dropdownItem} w-full text-left text-red-500`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: bell + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {isAuthenticated && user && (
              <Link to="/notifications" aria-label="Notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <CountBadge count={unreadCount} className="absolute -top-1 -right-1" />
                </Button>
              </Link>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
              Home
            </Link>
            <Link to="/games" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
              Games
            </Link>
            <Link to="/forum" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
              Forum
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className={`${mobileItem} w-full text-left`}
            >
              Search
            </button>

            {isAuthenticated && user ? (
              <div className="border-t border-border my-2 pt-2">
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileItem}
                >
                  Profile
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${mobileItem} flex items-center justify-between`}
                >
                  <span>Notifications</span>
                  <CountBadge count={unreadCount} />
                </Link>
                <Link to="/profile/edit" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
                  Edit Profile
                </Link>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
                  Settings
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${mobileItem} text-primary`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className={`${mobileItem} w-full text-left text-red-500`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-border my-2 pt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={mobileItem}>
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;