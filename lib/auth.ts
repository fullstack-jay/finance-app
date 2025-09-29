// This file is no longer needed since we're using Clerk for authentication
// Keeping this placeholder for any legacy components that might still import from here
export const auth = null;

// Export a mock object to prevent errors in legacy imports
export const mockAuth = {
    api: {
        getSession: async () => null,
    }
};