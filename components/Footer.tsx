import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="flex items-center justify-center text-slate-500 text-sm font-medium">
          Created by Harshith
          <Heart className="w-4 h-4 ml-2 text-red-500 fill-current" />
        </p>
        <p className="text-xs text-slate-400 mt-1">© {new Date().getFullYear()} JC Notes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;