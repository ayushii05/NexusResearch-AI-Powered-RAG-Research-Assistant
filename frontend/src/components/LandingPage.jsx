import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Youtube,
  Zap,
  ShieldCheck,
  Search,
  UploadCloud,
  Bot,
  Sun,
  Moon,
  Rocket
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LandingPage({ onGoToAuth, theme, toggleTheme }) {
  const { lang, toggleLanguage, t } = useLanguage();

  const steps = [
    {
      num: '01',
      icon: UploadCloud,
      title: lang === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload document',
      desc:
        lang === 'hi'
          ? 'कोई भी पीडीएफ अपलोड करें, वेब यूआरएल जोड़ें या यूट्यूब वीडियो लिंक पेस्ट करें। नेक्सस रिसर्च इसे पढ़ने और खोजने योग्य खंडों में बांटता है।'
          : 'Upload any PDF, TXT, web article URL, or YouTube video. NexusResearch reads and chunks it into searchable pieces.',
    },
    {
      num: '02',
      icon: Search,
      title: lang === 'hi' ? 'सिमेंटिक सर्च' : 'Semantic search',
      desc:
        lang === 'hi'
          ? 'आपका प्रश्न एक न्यूरल वेक्टर में परिवर्तित होता है और सबसे प्रासंगिक खंडों से मेल खाता है।'
          : 'Your question is converted to a vector and matched against the most relevant chunks in your project memory.',
    },
    {
      num: '03',
      icon: Bot,
      title: lang === 'hi' ? 'प्रमाणित उत्तर' : 'Grounded answer',
      desc:
        lang === 'hi'
          ? 'एआई केवल आपके दस्तावेज़ से उत्तर देता है — स्रोत संदर्भ और विश्वास स्कोर के साथ।'
          : 'AI answers ONLY from your document — with exact source reference and confidence score.',
    },
  ];

  const whyCards = [
    {
      emoji: '🎯',
      title: lang === 'hi' ? 'शून्य भ्रम (No hallucinations)' : 'No hallucinations',
      desc:
        lang === 'hi'
          ? 'एआई केवल आपके वास्तविक दस्तावेज़, वेब लिंक और वीडियो से उत्तर देता है, अपने सामान्य प्रशिक्षण डेटा से नहीं।'
          : 'AI only answers from your actual document, web links, and videos, not from its general training data.',
    },
    {
      emoji: '📊',
      title: lang === 'hi' ? 'कॉन्फिडेंस स्कोर' : 'Confidence score',
      desc:
        lang === 'hi'
          ? 'देखें कि प्राप्त खंड आपके प्रश्न के लिए कितने प्रासंगिक और विश्वसनीय हैं।'
          : 'See how relevant the retrieved chunks are to your question with grounded attribution scores.',
    },
    {
      emoji: '💬',
      title: lang === 'hi' ? 'चैट इतिहास' : 'Chat history',
      desc:
        lang === 'hi'
          ? 'मल्टी-टर्न बातचीत — लगातार सत्रों में स्वाभाविक रूप से फॉलो-अप प्रश्न पूछें।'
          : 'Multi-turn conversation — ask follow-up questions naturally with persistent project histories.',
    },
    {
      emoji: '📁',
      title: lang === 'hi' ? 'मल्टी-डॉक्यूमेंट (PDF, Web, YT)' : 'Multi-document',
      desc:
        lang === 'hi'
          ? 'एकाधिक पीडीएफ, वेब लिंक और यूट्यूब वीडियो अपलोड करें और उनके बीच निर्बाध रूप से स्विच करें।'
          : 'Upload multiple docs, web links, and YouTube video lectures and switch between them seamlessly.',
    },
    {
      emoji: '🔎',
      title: lang === 'hi' ? 'सोर्स हाइलाइट' : 'Source highlight',
      desc:
        lang === 'hi'
          ? 'सटीक रूप से देखें कि उत्तर दस्तावेज़ या वीडियो के किस भाग से आया है।'
          : 'See exactly which part of the document, web article, or video timestamp the answer came from.',
    },
    {
      emoji: '⚡',
      title: lang === 'hi' ? 'तत्काल उत्तर' : 'Instant answers',
      desc:
        lang === 'hi'
          ? 'NVIDIA के अल्ट्रा-फास्ट LLaMA 3.2 न्यूरल इन्फरेंस इंजन द्वारा संचालित रीयल-टाइम स्ट्रीमिंग।'
          : 'Powered by NVIDIA\'s ultra-fast LLaMA 3.2 inference engine with word-by-word streaming responses.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[#0a0a0a]/90 border-b border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <Sparkles size={18} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Nexus<span className="text-orange-600 dark:text-orange-500">Research</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-gray-300">
            <a href="#how-it-works" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              {lang === 'hi' ? 'यह कैसे काम करता है' : 'How it works'}
            </a>
            <a href="#why-nexus" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              {lang === 'hi' ? 'नेक्सस रिसर्च ही क्यों?' : 'Features'}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Switch Language / भाषा बदलें"
              className="px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-700 dark:text-gray-200"
            >
              <Globe size={14} className="text-orange-600 dark:text-orange-400" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-orange-600" />}
            </button>

            {/* Sign In button */}
            <button
              onClick={() => onGoToAuth('login')}
              className="hidden sm:inline-block px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {t.tabSignIn}
            </button>

            {/* CTA Try it free button */}
            <button
              onClick={() => onGoToAuth('signup')}
              className="px-4 sm:px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>{lang === 'hi' ? 'निःशुल्क आज़माएं' : 'Try it free'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-semibold shadow-xs">
                <Search size={14} className="text-orange-600 dark:text-orange-400" />
                <span>{lang === 'hi' ? 'RAG-संचालित दस्तावेज़ बुद्धिमत्ता' : 'RAG-Powered Document Intelligence'}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {lang === 'hi' ? (
                  <>
                    अपने <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 dark:from-orange-400 dark:to-amber-400">दस्तावेज़ों</span> से चैट करें
                  </>
                ) : (
                  <>
                    Chat with your <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 dark:from-orange-400 dark:to-amber-400">
                      Manuals & Sources
                    </span>
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                {lang === 'hi'
                  ? 'कोई भी दस्तावेज़ अपलोड करें और सरल भाषा में प्रश्न पूछें। नेक्सस रिसर्च आपकी फ़ाइल से सटीक उत्तर खोजने के लिए RAG का उपयोग करता है — एआई की मेमोरी से नहीं।'
                  : 'Upload any document, web article, or video and ask questions in plain English or Hindi. NexusResearch uses RAG (Retrieval-Augmented Generation) to find the exact answer from your document — not from the AI\'s memory.'}
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onGoToAuth('signup')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center justify-center gap-2 group"
                >
                  <UploadCloud size={17} />
                  <span>{lang === 'hi' ? 'अपना पहला दस्तावेज़ अपलोड करें' : 'Upload your first document'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Value checkmarks */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2 text-xs text-slate-500 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>{lang === 'hi' ? 'शून्य भ्रम (No hallucinations)' : 'No hallucinations'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-orange-500" />
                  <span>{lang === 'hi' ? 'सटीक संदर्भ हाइलाइट' : 'Source highlighted'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-orange-500" />
                  <span>{lang === 'hi' ? 'मल्टी-डॉक्यूमेंट' : 'Multi-document'}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: macOS-style Window Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-6 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#121212] shadow-2xl shadow-orange-950/10 dark:shadow-black/80 overflow-hidden">
                {/* Window Header */}
                <div className="px-4 py-3 bg-slate-100/90 dark:bg-[#181818] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                    <FileText size={13} className="text-orange-500" />
                    <span>NexusResearch — research_paper.pdf</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Chat Mock Content */}
                <div className="p-5 space-y-4 text-xs">
                  {/* User Question */}
                  <div className="space-y-1.5 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-1">YOU</span>
                    <div className="inline-block p-3 rounded-2xl rounded-tr-xs bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium shadow-sm text-left">
                      What is the main conclusion of this paper?
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                      <Sparkles size={11} /> NEXUSRESEARCH
                    </span>
                    <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 text-slate-800 dark:text-gray-200 leading-relaxed space-y-2.5">
                      <p>
                        Based on <strong>Section 4.2</strong> of your document, the main conclusion is that transformer-based models outperform RNNs on long-range dependencies by a factor of <strong>3.2×</strong>.
                      </p>

                      {/* Clickable Citation Pill */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 font-semibold text-[11px]">
                        <FileText size={12} className="text-orange-500" />
                        <span>Source found in chunk 12 • Confidence: 94%</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input Box */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-400 dark:text-gray-500 text-xs">
                      <span>Ask anything about your document...</span>
                      <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-xs">
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. "How NexusResearch Works" Section */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {lang === 'hi' ? 'नेक्सस रिसर्च कैसे काम करता है' : 'How NexusResearch works'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 shadow-xs text-center space-y-3.5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wider">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. "Why NexusResearch?" Section (Matching exact card layout from screenshot!) */}
      <section id="why-nexus" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 rounded-3xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {lang === 'hi' ? 'नेक्सस रिसर्च ही क्यों?' : 'Why NexusResearch?'}
              </h2>
            </div>

            {/* Grid of 6 White Cards matching the screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {whyCards.slice(0, 4).map((card, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/5 shadow-xs space-y-2.5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
                >
                  <div className="text-2xl">{card.emoji}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom 2 wider cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 sm:mt-5 max-w-2xl mx-auto">
              {whyCards.slice(4, 6).map((card, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/5 shadow-xs space-y-2.5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
                >
                  <div className="text-2xl">{card.emoji}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Stop searching. Start asking." Call-To-Action Banner (Matching Screenshot!) */}
      <section className="py-20 bg-[#0f172a] dark:bg-[#070707] text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-orange-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-5 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {lang === 'hi' ? 'खोजना बंद करें। पूछना शुरू करें।' : 'Stop searching. Start asking.'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
            {lang === 'hi'
              ? 'अपना दस्तावेज़ अपलोड करें और सेकंडों में सटीक उत्तर प्राप्त करें।'
              : 'Upload your document and get answers in seconds.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => onGoToAuth('signup')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Rocket size={16} />
              <span>{lang === 'hi' ? 'शुरू करें — यह मुफ़्त है' : 'Get started — it\'s free'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-xs text-slate-500 dark:text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-white">
              <Sparkles size={12} />
            </div>
            <span className="font-bold text-slate-800 dark:text-gray-300">NexusResearch</span>
          </div>

          <div className="flex items-center gap-6">
            <span>FastAPI • React • ChromaDB • NVIDIA Llama 3.2</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-orange-600 dark:hover:text-orange-400">
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
