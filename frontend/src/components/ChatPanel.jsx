import { useEffect, useRef, useState } from 'react';
import { Send, FileText, Link as LinkIcon, Play, Plus, Menu, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import UploadMenu from './UploadMenu.jsx';
import SourcesSlideOver from './SourcesSlideOver.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { API_BASE_URL } from '../context/AuthContext.jsx';

const TYPE_ICON = {
  pdf: FileText,
  url: LinkIcon,
  youtube: Play,
};

function CitationChip({ citation }) {
  const Icon = TYPE_ICON[citation.source_type] || LinkIcon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50/80 dark:border-accent/30 dark:bg-accent/10 px-2.5 py-1 text-xs text-orange-700 dark:text-accent shadow-xs transition-colors hover:bg-orange-100/80 dark:hover:bg-accent/20"
      title={citation.chunk_text}
    >
      <Icon size={11} className="text-accent" />
      {citation.source_title}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 py-1">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '0ms' }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '160ms' }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent" style={{ animationDelay: '320ms' }} />
    </div>
  );
}

function CopyButton({ text }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:text-accent dark:hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100"
      title={copied ? t.copied : t.copy}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function ChatPanel({ projectId, messages, setMessages, isStreaming, setIsStreaming, sources, onSourceAdded, isSidebarOpen, toggleSidebar }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 4 * 24; // ~4 rows
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input.trim() };
    const chatHistory = [...messages];
    setInput('');
    setIsStreaming(true);

    setMessages([...messages, userMessage, { role: 'assistant', content: '', citations: [] }]);

    try {
      const chatUrl = `${API_BASE_URL}/api/chat`;
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, message: userMessage.content, chat_history: chatHistory }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trimStart();
          if (!payload || payload === '[DONE]') continue;

          if (payload.startsWith('__CITATIONS__')) {
            try {
              const citations = JSON.parse(payload.slice(13));
              setMessages((prev) => {
                if (prev.length === 0) return prev;
                const lastIndex = prev.length - 1;
                const last = prev[lastIndex];
                if (last && last.role === 'assistant') {
                  return [
                    ...prev.slice(0, lastIndex),
                    { ...last, citations }
                  ];
                }
                return prev;
              });
            } catch {
              // ignore malformed citation JSON
            }
          } else {
            let tokenText = payload;
            try {
              tokenText = JSON.parse(payload);
            } catch {
              tokenText = payload;
            }
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const lastIndex = prev.length - 1;
              const last = prev[lastIndex];
              if (last && last.role === 'assistant') {
                return [
                  ...prev.slice(0, lastIndex),
                  { ...last, content: last.content + tokenText }
                ];
              }
              return prev;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const last = prev[lastIndex];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, lastIndex),
            { ...last, content: `Error: ${err.message}` }
          ];
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-graphite transition-colors duration-200">
      <SourcesSlideOver
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        sources={sources}
      />

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-3.5 bg-white/90 dark:bg-graphite/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              aria-label="Open Sidebar"
              className="rounded-full p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-ink">{t.chatHeader}</h2>
            <p className="text-xs text-slate-500 dark:text-white/40">{t.chatSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSourcesModalOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 dark:hover:bg-accent/10 dark:hover:text-accent dark:hover:border-accent/30 transition-colors shadow-xs"
        >
          <FileText size={16} className="text-accent" />
          {t.documentsBtn} ({sources?.length || 0})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400 dark:text-white/30">{t.emptyChat}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1;
              const isStreamingThis = isLast && isStreaming && msg.role === 'assistant';

              if (msg.role === 'user') {
                return (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white shadow-sm shadow-orange-500/20 px-4 py-2.5 text-sm font-medium">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex flex-col gap-2 group">
                  <div className="max-w-[85%] text-sm leading-relaxed text-slate-800 dark:text-ink">
                    {msg.content.length === 0 && isStreamingThis ? (
                      <TypingIndicator />
                    ) : (
                      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 dark:prose-pre:bg-[#1a1a1a] max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {isStreamingThis && (
                          <span className="streaming-cursor text-accent ml-1 inline-block">▌</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((c, cIdx) => (
                          <CitationChip key={cIdx} citation={c} />
                        ))}
                      </div>
                    )}
                    {!isStreamingThis && msg.content.length > 0 && (
                      <CopyButton text={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 dark:border-white/10 px-6 py-4 relative bg-white/50 dark:bg-transparent">
        <UploadMenu 
          isOpen={isUploadMenuOpen} 
          onClose={() => setIsUploadMenuOpen(false)} 
          projectId={projectId} 
          onSourceAdded={onSourceAdded} 
        />
        
        <div className="flex items-end gap-3 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/90 dark:bg-white/5 px-3.5 py-2.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 focus-within:bg-white dark:focus-within:bg-white/5 shadow-xs">
          <button
            onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-accent transition-colors"
            title={t.uploadDoc}
          >
            <Plus size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatPlaceholder}
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 dark:text-ink placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            title={t.send}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 dark:from-accent dark:to-amber-500 text-white transition-all hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 dark:hover:from-accent/90 dark:hover:to-amber-500/90 shadow-sm shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}