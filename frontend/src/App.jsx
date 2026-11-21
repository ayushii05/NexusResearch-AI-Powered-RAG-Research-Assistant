import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Loader2, Sparkles } from 'lucide-react';
import ChatPanel from './components/ChatPanel.jsx';
import ProjectSidebar from './components/ProjectSidebar.jsx';
import CreateProjectModal from './components/CreateProjectModal.jsx';
import LoginPage from './components/LoginPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';

function MainWorkspace({ theme, toggleTheme }) {
  const { user, authFetch } = useAuth();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await authFetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        return data;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const handleCreateProject = async (name) => {
    try {
      const response = await authFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || t.newProject }),
      });
      if (response.ok) {
        const proj = await response.json();
        setProjects([proj, ...projects]);
        setCurrentProjectId(proj.id);
      }
    } catch {
      // ignore
    }
  };

  const fetchSources = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await authFetch(`/api/projects/${projectId}/sources`);
      if (!response.ok) return;
      const data = await response.json();
      setSources(data);
    } catch {
      setSources([]);
    }
  };

  const fetchMessages = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await authFetch(`/api/projects/${projectId}/messages`);
      if (!response.ok) return;
      const data = await response.json();
      setMessages(data);
    } catch {
      setMessages([]);
    }
  };

  // On initial load or user change, fetch projects and set active
  useEffect(() => {
    fetchProjects().then((data) => {
      if (data && data.length > 0) {
        setCurrentProjectId(data[0].id);
      } else {
        setCurrentProjectId(null);
      }
    });
  }, [user]);

  // When project changes, fetch its sources and messages
  useEffect(() => {
    if (currentProjectId) {
      fetchSources(currentProjectId);
      fetchMessages(currentProjectId);
    } else {
      setSources([]);
      setMessages([]);
    }
  }, [currentProjectId]);

  // Periodically poll for project list updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProjects();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen w-full overflow-hidden bg-white dark:bg-graphite transition-colors duration-200"
    >
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 h-full overflow-hidden"
          >
            <ProjectSidebar
              projects={projects}
              currentProjectId={currentProjectId}
              onSelectProject={setCurrentProjectId}
              onCreateProject={() => setIsCreateModalOpen(true)}
              theme={theme}
              toggleTheme={toggleTheme}
              toggleSidebar={() => setIsSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 relative bg-white dark:bg-graphite">
        {currentProjectId ? (
          <div className="absolute inset-0 flex flex-col">
            <ChatPanel
              projectId={currentProjectId}
              messages={messages}
              setMessages={setMessages}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              sources={sources}
              onSourceAdded={() => fetchSources(currentProjectId)}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 p-6 text-center bg-white dark:bg-graphite">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Sidebar"
                className="absolute top-4 left-4 p-2 text-slate-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-accent/10 border border-orange-200 dark:border-accent/20 flex items-center justify-center mb-5 text-orange-600 dark:text-accent shadow-sm">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-gray-100">
              {t.welcomeBack}, {user?.name || t.researcher}!
            </h2>
            <p className="max-w-md text-sm text-slate-500 dark:text-gray-400">
              {t.welcomeDesc}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/25"
            >
              {t.createNewProjectBtn}
            </button>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </motion.div>
  );
}

function AppContent() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [authView, setAuthView] = useState('landing'); // 'landing' or 'login'
  const [initialIsRegister, setInitialIsRegister] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleGoToAuth = (mode = 'login') => {
    setInitialIsRegister(mode === 'signup');
    setAuthView('login');
  };

  const handleBackToLanding = () => {
    setAuthView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-graphite text-gray-900 dark:text-ink">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
          <span className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400">
            {t.initializing}
          </span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <MainWorkspace key="workspace" theme={theme} toggleTheme={toggleTheme} />
      ) : authView === 'login' ? (
        <LoginPage
          key="login"
          theme={theme}
          toggleTheme={toggleTheme}
          onBackToLanding={handleBackToLanding}
          initialIsRegister={initialIsRegister}
        />
      ) : (
        <LandingPage
          key="landing"
          onGoToAuth={handleGoToAuth}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

