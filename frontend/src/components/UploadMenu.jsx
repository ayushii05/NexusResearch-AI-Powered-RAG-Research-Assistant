import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link as LinkIcon, Play, Loader2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const isLikelyUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function UploadMenu({ projectId, onSourceAdded, isOpen, onClose }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pdf');
  const [urlInput, setUrlInput] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');

  const [pdfLoading, setPdfLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetError = () => setError('');

  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    resetError();
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('file', file);

      const response = await fetch('/api/ingest/pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      onSourceAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setPdfLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = async () => {
    const url = urlInput.trim();
    if (!url || urlLoading || !projectId) return;

    resetError();

    if (!isLikelyUrl(url)) {
      setError(t.invalidUrlErr);
      return;
    }

    setUrlLoading(true);
    try {
      const response = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, url }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      setUrlInput('');
      onSourceAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    const url = youtubeInput.trim();
    if (!url || youtubeLoading || !projectId) return;

    resetError();

    if (!isLikelyUrl(url)) {
      setError(t.invalidYoutubeErr);
      return;
    }

    setYoutubeLoading(true);
    try {
      const response = await fetch('/api/ingest/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, url }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      setYoutubeInput('');
      onSourceAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setYoutubeLoading(false);
    }
  };

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

          {/* Modal content positioned relative to the chat input (or centered) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-16 left-6 z-50 w-80 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-graphite p-4 shadow-2xl shadow-black/60"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-ink">{t.addSource}</h3>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 flex gap-1.5 p-1 bg-slate-100/80 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-transparent">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all ${
                  activeTab === 'pdf'
                    ? 'bg-white text-orange-600 font-semibold shadow-xs border border-orange-200/60 dark:bg-accent/20 dark:text-accent dark:border-transparent'
                    : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                <FileText size={16} className={activeTab === 'pdf' ? 'text-orange-600 dark:text-accent' : ''} />
                {t.tabPdf}
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all ${
                  activeTab === 'url'
                    ? 'bg-white text-orange-600 font-semibold shadow-xs border border-orange-200/60 dark:bg-accent/20 dark:text-accent dark:border-transparent'
                    : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                <LinkIcon size={16} className={activeTab === 'url' ? 'text-orange-600 dark:text-accent' : ''} />
                {t.tabUrl}
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-white text-orange-600 font-semibold shadow-xs border border-orange-200/60 dark:bg-accent/20 dark:text-accent dark:border-transparent'
                    : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/5'
                }`}
              >
                <Play size={16} className={activeTab === 'youtube' ? 'text-orange-600 dark:text-accent' : ''} />
                {t.tabYoutube}
              </button>
            </div>

            <div className="space-y-3">
              {activeTab === 'pdf' && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    disabled={pdfLoading}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-600 disabled:opacity-50 dark:text-white/60 dark:file:bg-accent"
                  />
                  {pdfLoading && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-accent">
                      <Loader2 size={12} className="animate-spin" />
                      {t.uploadProcessing}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder={t.urlPlaceholder}
                    disabled={urlLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-ink dark:placeholder:text-white/30 dark:focus:border-accent dark:focus:ring-accent/20"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={urlLoading || !urlInput.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 shadow-sm shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {urlLoading ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                    {t.addUrlBtn}
                  </button>
                </div>
              )}

              {activeTab === 'youtube' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleYoutubeSubmit()}
                    placeholder={t.youtubePlaceholder}
                    disabled={youtubeLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-ink dark:placeholder:text-white/30 dark:focus:border-accent dark:focus:ring-accent/20"
                  />
                  <button
                    onClick={handleYoutubeSubmit}
                    disabled={youtubeLoading || !youtubeInput.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 shadow-sm shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {youtubeLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    {t.addYoutubeBtn}
                  </button>
                </div>
              )}

              {error && <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
