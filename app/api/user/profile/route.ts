import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

// Schema for profile update request
const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// Schema for password update request
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Get the user data
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, req.user!.id),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Check if it's a profile update or password update
    if (body.currentPassword || body.newPassword) {
      // This is a password update request
      const validatedData = passwordUpdateSchema.parse(body);
      
      // Note: In a real application, you would need to verify the current password
      // For now, we'll just return an error since Better Auth handles password updates differently
      return NextResponse.json(
        { error: 'Password updates should be handled through Better Auth\'s built-in methods' }, 
        { status: 400 }
      );
    } else {
      // This is a profile update request
      const validatedData = profileUpdateSchema.parse(body);
      
      // Separate user data from profile data
      const { ...userData } = validatedData;
      
      // Update the user table if there are user fields to update
      if (Object.keys(userData).length > 0) {
        await db
          .update(user)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(user.id, req.user!.id));
      }

      // Return the updated profile
      const updatedDbUser = await db.query.user.findFirst({
        where: eq(user.id, req.user!.id),
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        }
      });
      
      if (!updatedDbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: updatedDbUser.id,
        name: updatedDbUser.name,
        email: updatedDbUser.email,
        image: updatedDbUser.image,
        createdAt: updatedDbUser.createdAt,
        updatedAt: updatedDbUser.updatedAt,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});