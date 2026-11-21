import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  en: {
    // Branding & Navigation
    appName: 'NexusResearch',
    newProject: 'New project',
    projectsCount: 'Projects',
    noProjectsYet: 'No projects created yet. Click above to start.',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    language: 'Language',
    signOut: 'Sign out',
    welcomeBack: 'Welcome back',
    researcher: 'Researcher',
    welcomeDesc: 'Create a research project to start indexing your PDFs, web articles, and YouTube transcripts with AI synthesis.',
    createNewProjectBtn: 'Create New Project',
    initializing: 'Initializing NexusResearch...',

    // Chat Panel
    chatHeader: 'Chat',
    chatSubtitle: 'Ask across all your sources in this project',
    documentsBtn: 'Documents',
    emptyChat: 'Ask a question about your uploaded sources',
    chatPlaceholder: 'Ask a question…',
    copy: 'Copy',
    copied: 'Copied!',
    uploadDoc: 'Upload Document',
    send: 'Send',

    // Upload Menu
    addSource: 'Add Source',
    tabPdf: 'PDF',
    tabUrl: 'URL',
    tabYoutube: 'YouTube',
    uploadProcessing: 'Uploading and processing…',
    urlPlaceholder: 'https://example.com/article',
    addUrlBtn: 'Add URL',
    youtubePlaceholder: 'https://youtube.com/watch?v=...',
    addYoutubeBtn: 'Add YouTube',
    invalidUrlErr: 'Please enter a valid http:// or https:// URL.',
    invalidYoutubeErr: 'Please enter a valid YouTube URL.',

    // Create Project Modal
    createProjectTitle: 'Create New Project',
    autoAi: 'Auto (AI)',
    customName: 'Custom Name',
    autoAiDesc: 'The AI will automatically name this project based on your first question.',
    projectNameLabel: 'Project Name',
    projectNamePlaceholder: 'E.g., Quantum Physics Research',
    createProjectAction: 'Create Project',

    // SlideOver Documents
    documentsTitle: 'Documents',
    noDocsUploaded: 'No documents uploaded yet.',
    addDocsTip: 'Use the + button in the chat to add PDFs, web pages, or YouTube videos.',
    chunks: 'chunks',

    // Auth & Login
    tagline: 'Next-Gen Multi-Source RAG Research Workspace',
    heroHeading: 'Research Smarter with',
    heroDesc: 'Your unified AI knowledge engine. Upload PDFs, scrape web pages, and transcribe video lectures into a persistent research session with instant grounded citations.',
    featurePdfTitle: 'PDF Document Intel',
    featurePdfDesc: 'Extract, chunk, and deeply query complex academic & research papers.',
    featureWebTitle: 'Live Web Scraping',
    featureWebDesc: 'Ingest articles, docs, and news directly into project memory.',
    featureYtTitle: 'YouTube Transcripts',
    featureYtDesc: 'Digest lecture series and keynotes with precise timestamped citations.',
    featureRagTitle: 'Fast RAG Streaming',
    featureRagDesc: 'Token-by-token synthesis powered by high-speed neural models.',
    badgeIsolated: 'Isolated Vector Collections',
    badgeLocalEmbeddings: 'Local Neural Embeddings',
    tabSignIn: 'Sign In',
    tabSignUp: 'Create Account',
    signInHeader: 'Welcome back',
    signInSubheader: 'Enter your credentials to access your projects',
    signUpHeader: 'Create your account',
    signUpSubheader: 'Get started with your multi-source research workspace',
    labelFullName: 'Full Name',
    placeholderFullName: 'e.g. Jane Doe',
    labelEmail: 'Email Address',
    placeholderEmail: 'researcher@university.edu',
    labelPassword: 'Password',
    placeholderPassword: '••••••••',
    rememberMe: 'Remember my session for 7 days',
    forgotPassword: 'Forgot password?',
    btnSigningIn: 'Signing in...',
    btnCreatingAccount: 'Creating account...',
    btnSignIn: 'Sign In to Workspace',
    btnSignUp: 'Create Free Account',
    guestSignIn: 'Explore as Demo Guest',
    languageToggleLabel: 'हिन्दी',
  },
  hi: {
    // Branding & Navigation
    appName: 'NexusResearch',
    newProject: 'नया प्रोजेक्ट',
    projectsCount: 'प्रोजेक्ट्स',
    noProjectsYet: 'अभी तक कोई प्रोजेक्ट नहीं बना है। शुरू करने के लिए ऊपर क्लिक करें।',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    signOut: 'साइन आउट',
    welcomeBack: 'वापसी पर स्वागत है',
    researcher: 'शोधकर्ता',
    welcomeDesc: 'अपने पीडीएफ, वेब लेख और यूट्यूब वीडियो को एआई विश्लेषण के साथ जोड़ने के लिए एक शोध प्रोजेक्ट बनाएं।',
    createNewProjectBtn: 'नया प्रोजेक्ट बनाएं',
    initializing: 'NexusResearch प्रारंभ हो रहा है...',

    // Chat Panel
    chatHeader: 'चैट',
    chatSubtitle: 'इस प्रोजेक्ट के सभी स्रोतों में से प्रश्न पूछें',
    documentsBtn: 'दस्तावेज़',
    emptyChat: 'अपने अपलोड किए गए स्रोतों के बारे में प्रश्न पूछें',
    chatPlaceholder: 'प्रश्न पूछें…',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया!',
    uploadDoc: 'दस्तावेज़ जोड़ें',
    send: 'भेजें',

    // Upload Menu
    addSource: 'स्रोत जोड़ें',
    tabPdf: 'पीडीएफ',
    tabUrl: 'वेब लिंक',
    tabYoutube: 'यूट्यूब',
    uploadProcessing: 'अपलोड और प्रोसेस हो रहा है…',
    urlPlaceholder: 'https://example.com/article',
    addUrlBtn: 'यूआरएल जोड़ें',
    youtubePlaceholder: 'https://youtube.com/watch?v=...',
    addYoutubeBtn: 'यूट्यूब जोड़ें',
    invalidUrlErr: 'कृपया एक मान्य http:// या https:// यूआरएल दर्ज करें।',
    invalidYoutubeErr: 'कृपया एक मान्य यूट्यूब यूआरएल दर्ज करें।',

    // Create Project Modal
    createProjectTitle: 'नया प्रोजेक्ट बनाएं',
    autoAi: 'ऑटो (एआई)',
    customName: 'कस्टम नाम',
    autoAiDesc: 'एआई आपके पहले प्रश्न के आधार पर इस प्रोजेक्ट का नाम स्वचालित रूप से तय करेगा।',
    projectNameLabel: 'प्रोजेक्ट का नाम',
    projectNamePlaceholder: 'उदा., क्वांटम भौतिकी अनुसंधान',
    createProjectAction: 'प्रोजेक्ट बनाएं',

    // SlideOver Documents
    documentsTitle: 'दस्तावेज़',
    noDocsUploaded: 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया है।',
    addDocsTip: 'पीडीएफ, वेब पेज या यूट्यूब वीडियो जोड़ने के लिए चैट में + बटन का उपयोग करें।',
    chunks: 'खंड',

    // Auth & Login
    tagline: 'नेक्स्ट-जेन बहु-स्रोत RAG शोध वर्कस्पेस',
    heroHeading: 'अधिक स्मार्ट शोध करें',
    heroDesc: 'आपका एकीकृत एआई ज्ञान इंजन। पीडीएफ अपलोड करें, वेब पेज स्क्रैप करें, और सटीक संदर्भों के साथ वीडियो व्याख्यानों को एक स्थायी सत्र में समझें।',
    featurePdfTitle: 'पीडीएफ दस्तावेज़ विश्लेषण',
    featurePdfDesc: 'जटिल अकादमिक और शोध पत्रों का गहरा विश्लेषण करें।',
    featureWebTitle: 'लाइव वेब स्क्रैपिंग',
    featureWebDesc: 'लेखों, दस्तावेज़ों और समाचारों को सीधे प्रोजेक्ट मेमोरी में लाएं।',
    featureYtTitle: 'यूट्यूब ट्रांसक्रिप्ट',
    featureYtDesc: 'टाइमस्टैम्प वाले सटीक संदर्भों के साथ वीडियो व्याख्यानों को समझें।',
    featureRagTitle: 'तेज़ RAG स्ट्रीमिंग',
    featureRagDesc: 'हाई-स्पीड न्यूरल मॉडल द्वारा संचालित ज्ञान संश्लेषण।',
    badgeIsolated: 'पृथक वेक्टर संग्रह',
    badgeLocalEmbeddings: 'स्थानीय न्यूरल एम्बेडिंग',
    tabSignIn: 'साइन इन',
    tabSignUp: 'खाता बनाएं',
    signInHeader: 'वापसी पर स्वागत है',
    signInSubheader: 'अपने प्रोजेक्ट्स तक पहुँचने के लिए अपनी जानकारी दर्ज करें',
    signUpHeader: 'अपना खाता बनाएं',
    signUpSubheader: 'अपने शोध वर्कस्पेस के साथ तुरंत शुरुआत करें',
    labelFullName: 'पूरा नाम',
    placeholderFullName: 'उदा. आयुष शर्मा',
    labelEmail: 'ईमेल पता',
    placeholderEmail: 'researcher@university.edu',
    labelPassword: 'पासवर्ड',
    placeholderPassword: '••••••••',
    rememberMe: '7 दिनों के लिए मेरा सत्र याद रखें',
    forgotPassword: 'पासवर्ड भूल गए?',
    btnSigningIn: 'साइन इन हो रहा है...',
    btnCreatingAccount: 'खाता बन रहा है...',
    btnSignIn: 'वर्कस्पेस में साइन इन करें',
    btnSignUp: 'निःशुल्क खाता बनाएं',
    guestSignIn: 'डेमो अतिथि के रूप में देखें',
    languageToggleLabel: 'English',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('nexus_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nexus_language', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
