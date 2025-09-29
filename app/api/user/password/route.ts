import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

import { z } from 'zod';

// Schema for password update request
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = passwordUpdateSchema.parse(body);
    
    const { currentPassword, newPassword } = validatedData;
    
    try {
      // Use Better Auth's API to change password
      // The exact method depends on the Better Auth version
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: req.headers,
      });
      
      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (passwordError: any) {
      console.error('Error updating password:', passwordError);
      return NextResponse.json({ 
        error: passwordError.message || 'Current password is incorrect or update failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in password update request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});