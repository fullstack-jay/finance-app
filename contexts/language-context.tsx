'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  id: {
    dashboard: 'Dasbor',
    welcome: 'Selamat datang',
    total_income: 'Total Pendapatan',
    total_expenses: 'Total Pengeluaran',
    net_worth: 'Kekayaan Bersih',
    profit_loss: 'Laba/Rugi',
    total_assets: 'Total Aset',
    total_investments: 'Total Investasi',
    recent_transactions: 'Transaksi Terbaru',
    view_all: 'Lihat semua',
    income: 'Pendapatan',
    expense: 'Pengeluaran',
    assets: 'Aset',
    investments: 'Investasi',
    documents: 'Dokumen',
    transactions: 'Transaksi',
    record_new: 'Catat baru',
    manage_assets: 'Kelola aset',
    track_investments: 'Lacak investasi',
    manage_documents: 'Kelola dokumen',
    light_mode: 'Mode Terang',
    dark_mode: 'Mode Gelap',
    language: 'Bahasa',
    indonesian: 'Indonesia',
    english: 'English',
  },
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    total_income: 'Total Income',
    total_expenses: 'Total Expenses',
    net_worth: 'Net Worth',
    profit_loss: 'Profit/Loss',
    total_assets: 'Total Assets',
    total_investments: 'Total Investments',
    recent_transactions: 'Recent Transactions',
    view_all: 'View all',
    income: 'Income',
    expense: 'Expense',
    assets: 'Assets',
    investments: 'Investments',
    documents: 'Documents',
    transactions: 'Transactions',
    record_new: 'Record new',
    manage_assets: 'Manage assets',
    track_investments: 'Track investments',
    manage_documents: 'Manage documents',
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
    language: 'Language',
    indonesian: 'Indonesian',
    english: 'English',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') as Language | null;
    setLanguageState(savedLanguage || 'id');
  }, []);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prevLanguage => prevLanguage === 'id' ? 'en' : 'id');
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}