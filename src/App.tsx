import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { authService } from './services/authService';
import { onUnauthorized, tokenStore } from './services/api';
import { LoginView } from './views/LoginView';
import { AuthenticatedApp } from './AuthenticatedApp';
import { Language } from './i18n/translations';

export function App() {
  // Auth State: persistent from localStorage + verified against /api/v1/auth/me
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    onUnauthorized(() => {
      authService.setCurrentUser(null);
      setCurrentUser(null);
    });

    if (tokenStore.get()) {
      authService.fetchMe().then((freshUser) => {
        if (freshUser) {
          setCurrentUser(freshUser);
        }
      });
    }
  }, []);

  // Theme State: dynamically synchronizes with localStorage (defaults to light mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('dealer_app_theme') === 'dark';
  });

  // Sync theme with document.documentElement for Tailwind v4 custom dark variant
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('dealer_app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('dealer_app_theme', 'light');
    }
  }, [isDarkMode]);

  // Language State (Swahili / English)
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('dealer_app_language') as Language) || 'sw';
  });

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'sw' ? 'en' : 'sw';
      localStorage.setItem('dealer_app_language', next);
      return next;
    });
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    authService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    void authService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <LoginView 
        onLoginSuccess={handleLoginSuccess} 
        isDarkMode={isDarkMode} 
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <AuthenticatedApp
      key={currentUser.id}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onToggleTheme={handleToggleTheme}
      language={language}
      onToggleLanguage={handleToggleLanguage}
    />
  );
}

export default App;
