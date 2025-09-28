import { NextRequest } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { count, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const result = await db.select({ count: count() }).from(user);
    const userCount = result[0]?.count || 0;
    
    return Response.json({ count: userCount });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return Response.json({ count: 0, error: 'Failed to fetch user count' }, { status: 500 });
  }
}