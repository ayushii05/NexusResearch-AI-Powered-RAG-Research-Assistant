import { FileText, Link as LinkIcon, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const TYPE_CONFIG = {
  pdf: { icon: FileText, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  url: { icon: LinkIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  youtube: { icon: Play, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function SourceCard({ source }) {
  const { t } = useLanguage();
  const config = TYPE_CONFIG[source.type] || TYPE_CONFIG.url;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] px-3.5 py-2.5 transition-all hover:bg-orange-50/60 hover:border-orange-200 dark:hover:bg-white/[0.05] dark:hover:border-white/20 shadow-xs">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-ink" title={source.title}>
          {source.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-white/40">{source.chunk_count} {t.chunks}</p>
      </div>
    </div>
  );
}

