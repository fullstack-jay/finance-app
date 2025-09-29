import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { streamText } from 'ai';
import { nanoid } from 'nanoid';

// Define the AI model to use
const model = openai('gpt-4o-mini');

// Example function for financial analysis
async function analyzeTransactions(prevState: any, query: string) {
  'use server';
  
  try {
    const response = await streamText({
      model,
      prompt: `Analyze these financial transactions for "${query}". Provide insights on spending patterns, savings opportunities, and budget recommendations.`,
    });

    let fullText = '';
    for await (const chunk of response.textStream) {
      fullText += chunk;
    }

    //Update the AI state with new information
// You need to implement or import getAIState. Here is a placeholder implementation:
function getAIState() {
  // This is a mock implementation. Replace with your actual state management logic.
  let state = { messages: [] as any[] };
  return {
    get: () => state,
    update: (newState: any) => { state = newState; }
  };
}

   const aiState = getAIState();
aiState.update({
  ...aiState.get(),
  messages: [...(aiState.get().messages || []), {
    id: nanoid(),
    role: 'assistant',
    content: fullText,
  }],
});

    return {
      id: nanoid(),
      role: 'assistant',
      content: fullText,
    };
  } catch (error) {
    console.error('Error in analyzeTransactions:', error);
    
    return {
      id: nanoid(),
      role: 'assistant',
      content: 'Sorry, there was an error processing your request.',
    };
  }
}

// Example function for financial goal planning
async function generateFinancialPlan(userData: any) {
  'use server';
  
  const context = `Based on this financial data: ${JSON.stringify(userData)}, generate a personalized financial plan with recommendations.`;
  
  try {
    const { text } = await generateText({
      model,
      prompt: context,
    });
    
    return text;
  } catch (error) {
    console.error('Error in generateFinancialPlan:', error);
    return 'Sorry, there was an error generating your financial plan.';
  }
}

// Example function for expense categorization
async function categorizeExpense(description: string) {
  'use server';
  
  try {
    const { object } = await generateObject({
      model,
      schema: z.object({
        category: z.string(),
        confidence: z.number(),
        reason: z.string(),
      }),
      prompt: `Categorize this expense: "${description}". Classify it into one of the following categories: Food, Transportation, Entertainment, Utilities, Rent, Shopping, Healthcare, Education, Other.`,
    });
    
    return object;
  } catch (error) {
    console.error('Error in categorizeExpense:', error);
    return {
      category: 'Other',
      confidence: 0,
      reason: 'Error occurred during categorization',
    };
  }
}

// Example function for financial summary
async function generateFinancialSummary(userData: any) {
  'use server';
  
  const context = `Generate a concise financial summary based on: ${JSON.stringify(userData)}`;
  
  try {
    const { text } = await generateText({
      model,
      prompt: context,
    });
    
    return text;
  } catch (error) {
    console.error('Error in generateFinancialSummary:', error);
    return 'Sorry, there was an error generating your financial summary.';
  }
}

export { analyzeTransactions, generateFinancialPlan, categorizeExpense, generateFinancialSummary };