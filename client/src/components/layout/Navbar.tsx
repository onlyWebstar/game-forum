// components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Menu, X, Search, User, LogOut, Settings as SettingsIcon, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import SearchModal from '@/components/SearchModal';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-display text-2xl font-bold gradient-text">NEXUS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/games"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Games
            </Link>
            <Link
              to="/forum"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Forum
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-primary"
                  />
                  <span className="font-medium">{user.username}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
                      <div className="p-3 border-b border-border">
                        <p className="font-semibold text-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-primary"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-border py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors w-full text-left text-red-500"
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              to="/games"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
            >
              Games
            </Link>
            <Link
              to="/forum"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
            >
              Forum
            </Link>

            {isAuthenticated && user ? (
              <>
                <div className="border-t border-border my-2 pt-2">
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    Settings
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors text-primary"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-muted rounded-lg transition-colors text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-border my-2 pt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                >
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

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;