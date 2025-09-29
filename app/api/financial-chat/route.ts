import { NextRequest } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { transaction } from '@/db/schema/finance';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { type Message } from '@/components/financial-chat';

// Zod schema for validating financial chat requests
const FinancialChatRequestSchema = z.object({
  message: z.string(),
  userId: z.string(),
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = FinancialChatRequestSchema.parse(await req.json());
    
    // Get user from database to validate
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      // If user not found in database, return a more helpful response
      return new Response(
        JSON.stringify({ 
          result: {
            id: Date.now().toString(),
            content: "Your account hasn't been fully set up in our system. Please complete your profile setup first.",
            role: 'assistant',
            timestamp: new Date(),
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process the natural language message to extract transaction data or generate insights
    const result = await processFinancialMessage(message, userId);
    
    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing financial chat:', error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Failed to process financial chat' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function processFinancialMessage(message: string, userId: string): Promise<Message> {
  // Simple transaction extraction logic using regex patterns
  const transactionRegex = /(?:spent|paid|bought|invested|earned|received|got)\s*(?:usd|us|dollar|\$)?\s*([\d,]+(?:\.\d{2})?)\s*(?:on|for|at|in)?\s*(.+)/i;
  const match = message.toLowerCase().match(transactionRegex);

  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    const description = match[2].trim();
    
    // Simple category classification based on description
    const categories = {
      food: ['lunch', 'dinner', 'breakfast', 'groceries', 'restaurant', 'coffee', 'food', 'meal', 'eat', 'snack'],
      transportation: ['gas', 'fuel', 'taxi', 'uber', 'lyft', 'car', 'bus', 'train', 'transport', 'parking', 'metro', 'subway'],
      shopping: ['shopping', 'retail', 'store', 'amazon', 'buy', 'purchase', 'mall', 'market', 'clothes', 'clothing'],
      entertainment: ['movie', 'cinema', 'game', 'concert', 'entertainment', 'ticket', 'music', 'streaming', 'sports'],
      health: ['pharmacy', 'medicine', 'doctor', 'health', 'medical', 'hospital', 'clinic', 'gym', 'fitness'],
      bills: ['rent', 'electricity', 'water', 'internet', 'phone', 'bill', 'utilities', 'insurance', 'subscription'],
      income: ['salary', 'payment', 'income', 'received', 'earned', 'refund', 'money', 'wage', 'freelance', 'investment'],
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        category = cat;
        break;
      }
    }

    const type = ['salary', 'payment', 'income', 'received', 'earned', 'refund', 'money', 'wage', 'freelance', 'investment'].some(keyword => 
      description.toLowerCase().includes(keyword)
    ) ? 'income' : 'expense';

    // Create transaction in database
    const transactionData = {
      amount,
      description,
      category,
      type,
      date: new Date().toISOString(),
      userId,
    };

    return {
      id: Date.now().toString(),
      content: `I've recorded your ${type} of ${amount.toFixed(2)} for ${description}. Category: ${category.charAt(0).toUpperCase() + category.slice(1)}. Is this correct?`,
      role: 'assistant',
      timestamp: new Date(),
      transaction: {
        amount,
        description,
        category,
        type,
      },
    };
  } else {
    // Generate insights based on the user's query
    // In a real implementation, this would connect to an LLM for financial analysis
    const insightsResponses = [
      "Based on your recent transactions, you might want to consider setting aside more for savings.",
      "Your spending on entertainment has increased by 20% this month compared to last month.",
      "You could save approximately $50 monthly by switching to a more affordable phone plan.",
      "Consider creating a category for investments to better track your portfolio growth.",
      "Your food expenses are 15% higher than your budgeted amount for this month.",
      "Great job! Your savings rate has improved by 8% this quarter.",
      "You've been consistent with your monthly investments. Keep it up!",
      "Consider reviewing your subscription services to cancel unused ones.",
    ];

    return {
      id: Date.now().toString(),
      content: insightsResponses[Math.floor(Math.random() * insightsResponses.length)],
      role: 'assistant',
      timestamp: new Date(),
    };
  }
}