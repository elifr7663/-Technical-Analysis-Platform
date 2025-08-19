import React from 'react';
import { BarChart3, User, Settings, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ isDark, onToggleTheme }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-500" size={32} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ForexPro
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Settings size={20} />
            </button>
            
            <button className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}