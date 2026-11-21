import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LoginPage({ theme, toggleTheme, onBackToLanding, initialIsRegister = false }) {
  const { login, register, authError, clearError } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Local submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (isRegister && !name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password, rememberMe);
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (toRegister) => {
    setIsRegister(toRegister);
    setLocalError('');
    clearError();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/10 dark:from-[#080808] dark:via-[#0e0e0e] dark:to-[#141414] text-slate-900 dark:text-ink relative overflow-hidden transition-colors duration-300 select-none p-4 sm:p-6">
      {/* Ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500/15 dark:bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/15 dark:bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Left: Back to Home button */}
      {onBackToLanding && (
        <div className="absolute top-5 left-5 sm:left-8 z-20">
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-3.5 py-2 rounded-full bg-white/85 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/20 transition-all shadow-xs flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={15} />
            <span>{lang === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}</span>
          </button>
        </div>
      )}

      {/* Top Right: Language Toggle & Theme Toggle */}
      <div className="absolute top-5 right-5 sm:right-8 z-20 flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={toggleLanguage}
          title="Switch Language / भाषा बदलें"
          className="px-3 py-1.5 rounded-full bg-white/85 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/20 transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold"
        >
          <Globe size={14} className="text-orange-600 dark:text-orange-400" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-full bg-white/85 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-gray-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/20 transition-all shadow-xs"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-orange-600" />}
        </button>
      </div>

      {/* Centered Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md z-10 my-auto pt-10 sm:pt-0"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nexus<span className="text-orange-600 dark:text-orange-500">Research</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            {isRegister ? t.signUpSubheader : t.signInSubheader}
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-3xl bg-white/95 dark:bg-[#121212]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-orange-950/5 dark:shadow-black/70 p-6 sm:p-8 relative overflow-hidden">
          {/* Top glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

          {/* Tab switchers: Sign In vs Sign Up */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 mb-6">
            <button
              type="button"
              onClick={() => switchTab(false)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                !isRegister
                  ? 'bg-white text-orange-600 shadow-xs dark:bg-white/15 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {t.tabSignIn}
            </button>
            <button
              type="button"
              onClick={() => switchTab(true)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                isRegister
                  ? 'bg-white text-orange-600 shadow-xs dark:bg-white/15 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {t.tabSignUp}
            </button>
          </div>

          {/* Error alerts */}
          <AnimatePresence>
            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">{localError || authError}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {t.labelFullName}
                </label>
                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder={t.placeholderFullName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 dark:focus:ring-orange-500/25 dark:focus:border-orange-500 transition-all shadow-xs"
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">
                {t.labelEmail}
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  placeholder={t.placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 dark:focus:ring-orange-500/25 dark:focus:border-orange-500 transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {t.labelPassword}
                </label>
                {!isRegister && (
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 hover:underline cursor-pointer font-medium">
                    {t.forgotPassword}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.placeholderPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 dark:focus:ring-orange-500/25 dark:focus:border-orange-500 transition-all shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me toggle */}
            {!isRegister && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-500 focus:ring-orange-500 border-slate-300 dark:border-gray-700 bg-white dark:bg-white/5 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-gray-400 cursor-pointer">
                  {t.rememberMe}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isRegister ? t.btnCreatingAccount : t.btnSigningIn}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? t.btnSignUp : t.btnSignIn}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Privacy footnote */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-gray-500 mt-6">
          <div className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>{t.badgeIsolated}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-orange-500" />
            <span>{t.badgeLocalEmbeddings}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
