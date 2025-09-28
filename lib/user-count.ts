import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { count } from 'drizzle-orm';

export const getUserCount = async (): Promise<number> => {
  try {
    const result = await db.select({ count: count() }).from(user);
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
};