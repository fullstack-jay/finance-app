import { NextRequest } from 'next/server';
import { db } from '@/db';
import { user, account, session, verification } from '@/db/schema/auth';
import { transaction, category, asset, investment, document } from '@/db/schema/finance';
import { eq, desc, sum, avg, count, sql } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for validating financial insights requests
const FinancialInsightsRequestSchema = z.object({
  userId: z.string().optional(),
  insightType: z.enum(['spending-analysis', 'budget-advice', 'investment-suggestions', 'savings-tips', 'category-insights']).optional(),
  query: z.string().optional(), // For general queries via AI provider
});

export const runtime = 'nodejs';

interface Insight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, insightType, query } = FinancialInsightsRequestSchema.parse(await req.json());
    
    // If it's a general query (from AI provider), handle it differently
    if (query && !userId) {
      const analysis = await analyzeGeneralQuery(query);
      return new Response(
        JSON.stringify({ 
          insights: [{
            title: "Query Analysis",
            description: analysis,
            priority: "medium"
          }] 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate user exists if userId is provided
    if (userId) {
      try {
        // Since we're using Clerk for authentication, the userId is a Clerk user ID
        // But our database might have a different user ID format
        // To resolve this, we look up the user
        
        const userData = await db
          .select()
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        if (userData.length === 0) {
          // If user is not found in the database, we should check if this is due to 
          // Clerk integration not being complete. For now, return a meaningful message.
          // In a real implementation, you'd want to sync the Clerk user to your database
          // upon first sign-in.
          return new Response(
            JSON.stringify({ 
              insights: [{
                title: "Setup Required",
                description: "Please complete your account setup to access personalized financial insights.",
                priority: "medium",
                action: "Complete your profile"
              }] 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (dbError) {
        console.error('Database error when fetching user:', dbError);
        // If database is unavailable, return a meaningful error message
        return new Response(
          JSON.stringify({ 
            insights: [{
              title: "Database Unavailable",
              description: "The financial insights service is temporarily unavailable. Please try again later.",
              priority: "high"
            }] 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Generate insights based on the requested type
      try {
        const insights = await generateFinancialInsights(userId, insightType || 'spending-analysis');
        
        return new Response(
          JSON.stringify({ insights }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (dbError) {
        console.error('Database error when generating financial insights:', dbError);
        // If database is unavailable during insights generation, return a meaningful error message
        return new Response(
          JSON.stringify({ 
            insights: [{
              title: "Data Unavailable",
              description: "Unable to retrieve your financial data. This may be due to database connectivity issues.",
              priority: "medium"
            }] 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // If no user, return generic insights
      return new Response(
        JSON.stringify({ 
          insights: [{
            title: "Welcome to Financial Insights",
            description: "Sign in to get personalized financial insights based on your transactions.",
            priority: "low"
          }] 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating financial insights:', error);
    return new Response(
      JSON.stringify({ 
        insights: [{
          title: "Service Unavailable",
          description: "The financial insights service is temporarily unavailable. This may be due to database connectivity issues.",
          priority: "high"
        }] 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Function to analyze general financial queries
async function analyzeGeneralQuery(query: string): Promise<string> {
  // This would connect to an LLM in a real implementation
  // For now, we'll provide a basic response based on keywords
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('save') || lowerQuery.includes('savings')) {
    return "To save more money, consider reviewing your recurring expenses and finding areas where you can reduce spending. Automating savings can help ensure you consistently set aside money each month.";
  } else if (lowerQuery.includes('invest') || lowerQuery.includes('investment')) {
    return "For investment, consider diversifying across different asset classes. Start with low-cost index funds if you're new to investing, and gradually expand to other investment types as your knowledge grows.";
  } else if (lowerQuery.includes('budget') || lowerQuery.includes('spending')) {
    return "Creating a budget involves tracking your income and expenses. Consider the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.";
  } else {
    return "Based on your query, I recommend reviewing your financial goals and tracking your expenses to better understand your spending patterns. This will help you make more informed financial decisions.";
  }
}

async function generateFinancialInsights(userId: string, insightType: string): Promise<Insight[]> {
  try {
    console.log('Generating financial insights for user:', userId, 'type:', insightType);
    
    // Get user's transactions for analysis with category names
    console.log('Querying transactions for user:', userId);
    let userTransactions = [];
    try {
      userTransactions = await db
        .select({
          id: transaction.id,
          userId: transaction.user_id,
          categoryId: transaction.category_id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          categoryName: category.name
        })
        .from(transaction)
        .leftJoin(category, eq(transaction.category_id, category.id))
        .where(eq(transaction.user_id, userId))
        .orderBy(desc(transaction.date));
    } catch (dbError) {
      console.error('Database error when fetching transactions:', dbError);
      // Return a meaningful error message instead of throwing
      return [{
        title: 'Data Unavailable',
        description: 'Unable to retrieve your transaction data. This may be due to database connectivity issues.',
        priority: 'high'
      }];
    }
    
    console.log('Found', userTransactions.length, 'transactions for user');

    if (userTransactions.length === 0) {
      console.log('No transactions found, returning default insight');
      return [{
        title: 'Start Tracking Your Finances',
        description: 'You don\'t have any transactions yet. Start by adding your income and expenses to get insights.',
        priority: 'high',
        action: 'Add your first transaction'
      }];
    }
    const insights: Insight[] = [];

    switch (insightType) {
      case 'spending-analysis':
        console.log('Generating spending analysis');
        try {
          insights.push(...await generateSpendingAnalysis(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateSpendingAnalysis:', error);
          insights.push({
            title: 'Analysis Unavailable',
            description: 'Unable to generate spending analysis due to data processing issues.',
            priority: 'medium'
          });
        }
        break;
      case 'budget-advice':
        console.log('Generating budget advice');
        try {
          insights.push(...await generateBudgetAdvice(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateBudgetAdvice:', error);
          insights.push({
            title: 'Advice Unavailable',
            description: 'Unable to generate budget advice due to data processing issues.',
            priority: 'medium'
          });
        }
        break;
      case 'investment-suggestions':
        console.log('Generating investment suggestions');
        try {
          insights.push(...await generateInvestmentSuggestions(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateInvestmentSuggestions:', error);
          insights.push({
            title: 'Investment Info Unavailable',
            description: 'Unable to generate investment suggestions due to data processing issues.',
            priority: 'medium'
          });
        }
        break;
      case 'savings-tips':
        console.log('Generating savings tips');
        try {
          insights.push(...await generateSavingsTips(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateSavingsTips:', error);
          insights.push({
            title: 'Savings Tips Unavailable',
            description: 'Unable to generate savings tips due to data processing issues.',
            priority: 'medium'
          });
        }
        break;
      case 'category-insights':
        console.log('Generating category insights');
        try {
          insights.push(...await generateCategoryInsights(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateCategoryInsights:', error);
          insights.push({
            title: 'Category Insights Unavailable',
            description: 'Unable to generate category insights due to data processing issues.',
            priority: 'medium'
          });
        }
        break;
      default:
        console.log('Unknown insight type, generating spending analysis');
        try {
          insights.push(...await generateSpendingAnalysis(userId, userTransactions));
        } catch (error) {
          console.error('Error in generateSpendingAnalysis:', error);
          insights.push({
            title: 'Analysis Unavailable',
            description: 'Unable to generate spending analysis due to data processing issues.',
            priority: 'medium'
          });
        }
    }
    
    console.log('Generated', insights.length, 'insights');

    return insights;
  } catch (error) {
    console.error('Error in generateFinancialInsights:', error);
    // Return a meaningful error message instead of throwing
    return [{
      title: 'Processing Error',
      description: 'There was an issue processing your financial data. Please try again later.',
      priority: 'medium'
    }];
  }
}

async function generateSpendingAnalysis(userId: string, transactions: any[]): Promise<Insight[]> {
  console.log('Generating spending analysis for', transactions.length, 'transactions');
  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    
  console.log('Total income:', totalIncome, 'Total expenses:', totalExpenses);

  // Analyze spending patterns by category
  const categorySpending: Record<string, number> = {};
  transactions
    .filter((t: any) => t.type === 'expense')
    .forEach((t: any) => {
      // Use categoryName if available (from join), otherwise use category ID
      const categoryName = t.categoryName || t.category || 'Uncategorized';
      if (categorySpending[categoryName]) {
        categorySpending[categoryName] += Number(t.amount);
      } else {
        categorySpending[categoryName] = Number(t.amount);
      }
    });
    
  console.log('Category spending:', categorySpending);

  const insights: Insight[] = [];

  // Calculate savings rate
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    console.log('Savings rate:', savingsRate);
    
    if (savingsRate < 20) {
      insights.push({
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
        priority: 'high',
        action: 'Review your expenses and look for areas to reduce spending'
      });
    } else if (savingsRate >= 20) {
      insights.push({
        title: 'Great Savings Rate',
        description: `Your savings rate of ${savingsRate.toFixed(1)}% is excellent! You're on track for financial stability.`,
        priority: 'low'
      });
    }
  }

  // Identify categories with high spending
  Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([category, amount], index) => {
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    console.log('Category:', category, 'Amount:', amount, 'Percentage:', percentage);
    
    if (percentage > 15) { // More than 15% of total expenses
      insights.push({
        title: `High Spending on ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `You're spending ${percentage.toFixed(1)}% of your total expenses on ${category}. Consider reviewing if this is necessary.`,
        priority: 'medium',
        action: `Look for ways to reduce ${category} spending`
      });
    }
  });

  console.log('Generated', insights.length, 'spending analysis insights');
  return insights;
}

async function generateBudgetAdvice(userId: string, transactions: any[]): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Calculate monthly averages
  const monthlyExpenses: Record<string, number> = {};
  const monthlyIncomes: Record<string, number> = {};
  
  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().substring(0, 7); // YYYY-MM
    if (t.type === 'expense') {
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
    } else {
      monthlyIncomes[month] = (monthlyIncomes[month] || 0) + t.amount;
    }
  });

  const expenseMonths = Object.values(monthlyExpenses);
  const incomeMonths = Object.values(monthlyIncomes);
  
  if (expenseMonths.length > 0) {
    const avgMonthlyExpenses = expenseMonths.reduce((a, b) => a + b, 0) / expenseMonths.length;
    
    // If expenses are consistently higher than usual
    const recentExpenses = expenseMonths.slice(-2); // Last 2 months
    if (recentExpenses.length === 2 && recentExpenses[0] < recentExpenses[1]) {
      const increase = ((recentExpenses[1] - recentExpenses[0]) / recentExpenses[0]) * 100;
      insights.push({
        title: 'Increased Monthly Expenses',
        description: `Your expenses increased by ${increase.toFixed(1)}% from the previous month. Consider reviewing your spending.`,
        priority: 'medium',
        action: 'Create a monthly budget to control spending'
      });
    }
  }

  return insights;
}

async function generateInvestmentSuggestions(userId: string, transactions: any[]): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  try {
    // Check if user has any investments already
    const userInvestments = await db
      .select()
      .from(investment)
      .where(eq(investment.userId, userId));

    if (userInvestments.length === 0) {
      insights.push({
        title: 'Start Investing',
        description: 'You don\'t have any investments yet. Consider starting with low-cost index funds or ETFs.',
        priority: 'medium',
        action: 'Research investment options that match your risk tolerance'
      });
    } else {
      // Suggest diversification if user has concentrated portfolio
      const investmentTypes = new Set(userInvestments.map(i => i.type));
      if (investmentTypes.size <= 2) {
        insights.push({
          title: 'Portfolio Diversification',
          description: 'Your investment portfolio could benefit from diversification across more asset classes.',
          priority: 'medium',
          action: 'Consider adding bonds, international stocks, or REITs to your portfolio'
        });
      }
    }
  } catch (dbError) {
    console.error('Database error when fetching investments:', dbError);
    // Add an insight indicating the data is unavailable
    insights.push({
      title: 'Investment Data Unavailable',
      description: 'Unable to retrieve your investment data due to database connectivity issues.',
      priority: 'medium'
    });
  }

  // Check if user has high-risk tolerance based on transaction patterns
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  if (incomeTransactions.length > 0) {
    const avgIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length;
    const expenses = transactions.filter(t => t.type === 'expense');
    const avgExpenses = expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length;
    
    if (avgIncome > avgExpenses * 1.5) { // Income is significantly higher than expenses
      insights.push({
        title: 'Investment Opportunity',
        description: 'You have a good income-to-expense ratio, which provides an opportunity for growth investments.',
        priority: 'medium',
        action: 'Explore growth-oriented investments to maximize your returns'
      });
    }
  }

  return insights;
}

async function generateSavingsTips(userId: string, transactions: any[]): Promise<Insight[]> {
  const insights: Insight[] = [];

  // Find recurring expenses that might be reduced
  const reoccurringExpenses: Record<string, { count: number; total: number; amount: number }> = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!reoccurringExpenses[t.description]) {
        reoccurringExpenses[t.description] = { count: 0, total: 0, amount: t.amount };
      }
      reoccurringExpenses[t.description].count++;
      reoccurringExpenses[t.description].total += t.amount;
    });

  // Find high-value recurring expenses
  Object.entries(reoccurringExpenses)
    .filter(([desc, data]) => data.count >= 2 && data.amount > 20) // At least 2 occurrences, over $20
    .forEach(([description, data]) => {
      if (data.count >= 3) { // Appears 3 or more times
        insights.push({
          title: `Review ${description} Expenses`,
          description: `You've spent ${data.total.toFixed(2)} on ${description} over ${data.count} transactions. Consider if this is necessary.`,
          priority: 'medium',
          action: `Evaluate if you need this expense or if there are cheaper alternatives`
        });
      }
    });

  return insights;
}

async function generateCategoryInsights(userId: string, transactions: any[]): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Group transactions by category
  const categoryData: Record<string, { expenses: number; incomes: number; transactions: number }> = {};
  
  transactions.forEach(t => {
    if (!categoryData[t.category]) {
      categoryData[t.category] = { expenses: 0, incomes: 0, transactions: 0 };
    }
    
    if (t.type === 'expense') {
      categoryData[t.category].expenses += t.amount;
    } else {
      categoryData[t.category].incomes += t.amount;
    }
    categoryData[t.category].transactions++;
  });

  // Analyze each category
  Object.entries(categoryData).forEach(([category, data]) => {
    // If a category has a lot of transactions
    if (data.transactions >= 5) {
      insights.push({
        title: `Active ${category.charAt(0).toUpperCase() + category.slice(1)} Category`,
        description: `You've had ${data.transactions} transactions in the ${category} category. This is an active area of your finances.`,
        priority: 'low'
      });
    }
    
    // If a category has high expenses
    if (data.expenses > 200) { // Over $200 in expenses
      insights.push({
        title: `High Spending in ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: `You've spent ${data.expenses.toFixed(2)} in the ${category} category. This is a significant expense area.`,
        priority: 'medium',
        action: 'Review your spending in this category for potential savings'
      });
    }
  });

  return insights;
}
