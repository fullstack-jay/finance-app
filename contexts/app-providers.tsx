'use client';

import { LanguageProvider } from './language-context';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AIProvider } from '@/lib/ai/provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AIProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AIProvider>
    </ClerkProvider>
  );
}