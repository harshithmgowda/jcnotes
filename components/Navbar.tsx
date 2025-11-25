import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ShieldCheck, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('jc_notes_admin') === 'true';
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    // Check for student name update
    const name = localStorage.getItem('student_name');
    setStudentName(name);
  }, [location.pathname]); // Update when path changes (e.g. after login)

  const handleAdminLogout = () => {
    localStorage.removeItem('jc_notes_admin');
    navigate('/');
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('student_name');
    navigate('/student-login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">JC Notes</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Student View */}
            {!isAdmin && studentName && (
               <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <User className="w-4 h-4 text-primary" />
                    Hi, {studentName}
                  </span>
                  {location.pathname === '/' && (
                    <Link 
                      to="/login" 
                      className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleStudentLogout}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Exit
                  </button>
               </div>
            )}

            {/* Guest View (No Name, No Admin) */}
            {!isAdmin && !studentName && (
               <Link
               to="/login" 
               className="text-sm font-medium text-slate-600 hover:text-primary transition-colors flex items-center gap-2"
             >
               <ShieldCheck className="w-4 h-4" />
               Admin Login
             </Link>
            )}

            {/* Admin View */}
            {isAdmin && (
              <div className="flex items-center gap-4">
                 <Link 
                  to="/admin" 
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;