'use client';

import { ReactNode } from 'react';

// This is a simplified provider that doesn't use the AI SDK RSC features
// which were causing build errors
export const AIProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>{children}</>
  );
};