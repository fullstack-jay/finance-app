import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function withAuth(handler: (req: AuthenticatedRequest, context: { params: any }) => Promise<NextResponse>) {
  return async function(req: NextRequest, context: { params: any }) {
    // Get the authenticated user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: user.id,
      name: user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username || 'User',
      email: user.emailAddresses[0]?.emailAddress || ''
    };
    
    try {
      return await handler(authenticatedReq, context);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}

// Function to get user ID directly for use in API routes
export async function getAuthUserId() {
  const user = await currentUser();
  return user ? user.id : null;
}