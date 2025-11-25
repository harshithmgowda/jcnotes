import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">JC Notes</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-2">
          Choose how you want to access the platform
        </h1>
        <p className="text-lg text-slate-600 mt-6 max-w-3xl mx-auto">
          Students can browse curated notes by branch, semester, subject, and unit. Administrators can manage content,
          upload new material, and keep the knowledge base organized.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 flex flex-col">
          <div className="flex items-center gap-3 text-primary mb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide font-semibold">Student Access</p>
              <p className="text-xs text-slate-500">Browse, search, and download course resources</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Learn, revise, and stay ahead</h2>
          <ul className="space-y-3 text-slate-600 flex-1">
            <li>• Discover notes organized by branch → semester → subject → unit</li>
            <li>• Download PDFs, slides, and additional reference material</li>
            <li>• Save your name for a personalized experience</li>
          </ul>
          <button
            onClick={() => navigate('/student-login')}
            className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Continue as Student
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 flex flex-col">
          <div className="flex items-center gap-3 text-amber-600 mb-6">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide font-semibold">Admin Access</p>
              <p className="text-xs text-slate-500">Secure dashboard for managing notes</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Manage the entire repository</h2>
          <ul className="space-y-3 text-slate-600 flex-1">
            <li>• Add or update branches, semesters, subjects, and units</li>
            <li>• Upload new notes with file storage handled by Supabase</li>
            <li>• Remove outdated resources (notes, units, subjects, semesters, branches)</li>
          </ul>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-800 font-semibold hover:border-primary hover:text-primary transition"
          >
            Continue as Admin
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-16 bg-gradient-to-r from-primary/10 via-white to-amber-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 border border-slate-100">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900">Need access?</h3>
          <p className="text-slate-600 mt-2">
            Students just need a name to enter. Admins require the dashboard password. Reach out to the platform owner if you
            should have admin rights.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/student-login')}
            className="px-5 py-3 rounded-xl bg-white text-primary font-semibold border border-primary/20 shadow-sm hover:border-primary"
          >
            Student Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold shadow hover:bg-blue-700"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
