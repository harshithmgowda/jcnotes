import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkToggle: React.FC = () => {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jc_notes_dark');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('jc_notes_dark', String(dark));
    } catch (e) {
      console.error('Failed to toggle dark mode:', e);
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
    </button>
  );
};

export default DarkToggle;

