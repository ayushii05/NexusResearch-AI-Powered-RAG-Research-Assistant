import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Pencil } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('ai'); // 'ai' or 'custom'
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (mode === 'ai') {
      onCreate(t.newProject); // The backend will auto-rename this after the first message
    } else {
      onCreate(name.trim() || t.newProject);
    }
    onClose();
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-graphite p-6 shadow-2xl shadow-black/60 pointer-events-auto flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-ink">{t.createProjectTitle}</h3>
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-transparent">
                <button
                  onClick={() => setMode('ai')}
                  className={`flex flex-1 items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'ai'
                      ? 'bg-white text-orange-600 shadow-xs border border-orange-200/60 dark:bg-[#2d2d2d] dark:text-ink dark:border-transparent'
                      : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Sparkles size={14} className={mode === 'ai' ? 'text-orange-600 dark:text-accent' : ''} />
                  {t.autoAi}
                </button>
                <button
                  onClick={() => setMode('custom')}
                  className={`flex flex-1 items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    mode === 'custom'
                      ? 'bg-white text-orange-600 shadow-xs border border-orange-200/60 dark:bg-[#2d2d2d] dark:text-ink dark:border-transparent'
                      : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Pencil size={14} className={mode === 'custom' ? 'text-orange-600 dark:text-accent' : ''} />
                  {t.customName}
                </button>
              </div>

              {mode === 'custom' ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-gray-300">{t.projectNameLabel}</label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder={t.projectNamePlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-ink dark:placeholder:text-white/30 shadow-xs"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-gray-400 text-center py-2 leading-relaxed">
                  {t.autoAiDesc}
                </p>
              )}

              <button
                onClick={handleCreate}
                disabled={mode === 'custom' && !name.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 py-2.5 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {t.createProjectAction}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
