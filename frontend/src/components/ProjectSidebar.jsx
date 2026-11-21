import React from 'react';
import { Plus, Sun, Moon, Menu, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProjectSidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  theme,
  toggleTheme,
  toggleSidebar,
}) {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-[280px] min-w-[280px] bg-slate-50 dark:bg-sidebar flex flex-col h-full transition-colors duration-200 border-r border-slate-200/80 dark:border-white/5">
      {/* Header section */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="rounded-full p-1.5 hover:bg-orange-50 text-slate-600 hover:text-orange-600 dark:hover:bg-white/10 dark:text-gray-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-sm shadow-orange-500/50" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 tracking-tight">NexusResearch</h2>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2 flex flex-col gap-1">
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-full bg-white border border-orange-200/80 text-orange-700 hover:bg-orange-50 hover:border-orange-300 dark:bg-white/10 dark:text-gray-200 dark:border-transparent dark:hover:bg-white/20 transition-all text-sm font-medium shadow-xs"
        >
          <Plus size={18} className="text-accent" />
          <span>{t.newProject}</span>
        </button>
      </div>

      {/* Recents List */}
      <div className="flex-1 overflow-y-auto px-3 mt-4">
        <h3 className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 mb-2 px-3 uppercase tracking-wider">
          {t.projectsCount} ({projects.length})
        </h3>
        
        <div className="flex flex-col gap-0.5">
          {projects.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-gray-500 px-3 py-3 italic">
              {t.noProjectsYet}
            </div>
          ) : (
            projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-medium ${
                  currentProjectId === proj.id
                    ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200/70 shadow-xs dark:bg-accent/15 dark:text-accent dark:border-transparent'
                    : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <span className="truncate block w-full">{proj.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer / Language, Theme & User Profile */}
      <div className="p-3 mt-auto space-y-1.5 border-t border-slate-200/80 dark:border-white/5 bg-slate-100/60 dark:bg-black/20">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          title="Switch Language / भाषा बदलें"
          className="flex items-center justify-between px-3 py-2 rounded-xl w-full text-left text-xs font-medium text-slate-700 dark:text-gray-300 hover:bg-orange-50/70 hover:text-orange-700 dark:hover:bg-white/5 dark:hover:text-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Globe size={16} className="text-accent" />
            <span>{t.language}</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 dark:bg-accent/10 dark:border-accent/20 dark:text-accent font-semibold text-[11px]">
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-3 py-2 rounded-xl w-full text-left text-xs font-medium text-slate-700 dark:text-gray-300 hover:bg-orange-50/70 hover:text-orange-700 dark:hover:bg-white/5 dark:hover:text-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-orange-600" />}
            <span>{theme === 'dark' ? t.lightMode : t.darkMode}</span>
          </div>
        </button>

        {/* User Profile Card & Logout */}
        {user && (
          <div className="pt-1">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title={t.signOut}
                aria-label={t.signOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

