'use client';

import { useUser } from '@clerk/nextjs';

export const useClerkUser = () => {
  const { user, isSignedIn, isLoading } = useUser();

  return {
    user: isSignedIn && user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
      image: user.imageUrl,
    } : null,
    isSignedIn,
    isLoading,
  };
};