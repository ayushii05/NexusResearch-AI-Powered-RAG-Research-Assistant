import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import SourceCard from './SourceCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function SourcesSlideOver({ isOpen, onClose, sources }) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide Over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 border-l border-slate-200 bg-slate-50 shadow-2xl shadow-black/50 dark:border-white/10 dark:bg-sidebar flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-4 bg-white dark:bg-sidebar">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-orange-600 dark:text-accent" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-ink">{t.documentsTitle}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {sources.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-white/40">
                  <FileText size={32} className="mb-3 opacity-20" />
                  <p className="text-sm">{t.noDocsUploaded}</p>
                  <p className="mt-1 text-xs opacity-70">{t.addDocsTip}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

