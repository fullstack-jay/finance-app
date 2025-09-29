// Clerk Auth Client - Replacing Better Auth
import { useUser, useClerk, useAuth } from '@clerk/nextjs';

// Export Clerk functions to maintain the same interface
export const signIn = () => {
    // Clerk automatically handles sign in via the sign-in page
    console.warn('Sign in is handled by Clerk via /sign-in route');
};

export const signUp = () => {
    // Clerk automatically handles sign up via the sign-up page
    console.warn('Sign up is handled by Clerk via /sign-up route');
};

export const signOut = async () => {
    // This would be async and return a promise
    console.warn('Sign out is handled by Clerk');
};

// Custom hook that wraps Clerk's useUser to maintain the same interface
export const useSession = () => {
    const { user, isLoaded: isSignedIn } = useUser();
    
    return {
        data: user ? {
            user: {
                id: user.id,
                name: user.fullName || user.username || null,
                email: user.emailAddresses[0]?.emailAddress || null,
                image: user.imageUrl || null,
            },
        } : null,
        isPending: !isSignedIn,
    };
};

export const getSession = async () => {
    // This would be an async function to get session server-side
    // In Clerk, you would use auth() server-side
    console.warn('Server-side session management is handled by Clerk middleware');
    return null;
};