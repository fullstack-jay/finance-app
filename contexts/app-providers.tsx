'use client';

import { LanguageProvider } from './language-context';
import { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}