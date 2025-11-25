import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ShieldCheck, User, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('jc_notes_admin') === 'true';
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('student_name');
    setStudentName(name);
  }, [location.pathname]);

  const handleAdminLogout = () => {
    localStorage.removeItem('jc_notes_admin');
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('student_name');
    navigate('/student-login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);
  const navigateAndClose = (path: string) => {
    navigate(path);
    closeMenu();
  }

  const navLinks = (
    <>
      {/* Student View */}
      {!isAdmin && studentName && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <span className="text-sm font-medium text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <User className="w-4 h-4 text-primary" />
            Hi, {studentName}
          </span>
          <button
            onClick={handleStudentLogout}
            className="text-sm font-medium text-red-500 hover:text-red-700"
          >
            Exit
          </button>
        </div>
      )}

      {/* Guest & Student Admin Link */}
      {!isAdmin && (
        <Link
          to="/login"
          onClick={closeMenu}
          className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Login
        </Link>
      )}

      {/* Admin View */}
      {isAdmin && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link
            to="/admin"
            onClick={closeMenu}
            className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}
          >
            Dashboard
          </Link>
          <button
            onClick={handleAdminLogout}
            className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigateAndClose('/')}>
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">JC Notes</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;