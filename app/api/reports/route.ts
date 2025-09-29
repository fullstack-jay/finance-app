import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { transaction, asset, investment } from '@/db/schema/finance';
import { eq, and, gte, lte } from 'drizzle-orm';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export async function GET(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Clerk's user ID
    const userId = user.id;

    // Calculate report summary data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Format dates for database queries
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

    // Get total income for current month
    const incomeTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, 'income'),
          gte(transaction.date, startOfMonthStr),
          lte(transaction.date, endOfMonthStr)
        )
      );

    const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    // Get total expenses for current month
    const expenseTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, 'expense'),
          gte(transaction.date, startOfMonthStr),
          lte(transaction.date, endOfMonthStr)
        )
      );

    const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    // Calculate net worth (total assets - total liabilities)
    const userAssets = await db
      .select()
      .from(asset)
      .where(eq(asset.userId, userId));
    
    const totalAssets = userAssets.reduce((sum, asset) => sum + Number(asset.currentValue || asset.purchasePrice), 0);

    // Get user's investments
    const userInvestments = await db
      .select()
      .from(investment)
      .where(eq(investment.userId, userId));
    
    const totalInvestments = userInvestments.reduce((sum, investment) => sum + Number(investment.currentValue), 0);

    // Calculate profit/loss (income - expenses)
    const profitLoss = totalIncome - totalExpenses;

    // Calculate net worth (simplified: assets + investments - expenses)
    const netWorth = totalAssets + totalInvestments - totalExpenses;

    // Calculate monthly change (comparing to previous month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Format dates for database queries
    const lastMonthStartStr = lastMonthStart.toISOString().split('T')[0];
    const lastMonthEndStr = lastMonthEnd.toISOString().split('T')[0];
    
    const lastMonthIncomeTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, 'income'),
          gte(transaction.date, lastMonthStartStr),
          lte(transaction.date, lastMonthEndStr)
        )
      );
    
    const lastMonthTotalIncome = lastMonthIncomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    const lastMonthExpenseTransactions = await db
      .select()
      .from(transaction)
      .where(
        and(
          eq(transaction.userId, userId),
          eq(transaction.type, 'expense'),
          gte(transaction.date, lastMonthStartStr),
          lte(transaction.date, lastMonthEndStr)
        )
      );
    
    const lastMonthTotalExpenses = lastMonthExpenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    const lastMonthProfitLoss = lastMonthTotalIncome - lastMonthTotalExpenses;
    
    let monthlyChange = 0;
    if (lastMonthProfitLoss !== 0) {
      monthlyChange = ((profitLoss - lastMonthProfitLoss) / Math.abs(lastMonthProfitLoss)) * 100;
    } else if (profitLoss > 0) {
      monthlyChange = 100; // If previous month was 0 and current is positive
    } else if (profitLoss < 0) {
      monthlyChange = -100; // If previous month was 0 and current is negative
    }

    // Return the report data
    return Response.json({
      totalIncome,
      totalExpenses,
      netWorth,
      profitLoss,
      totalAssets,
      totalInvestments,
      monthlyChange: parseFloat(monthlyChange.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}