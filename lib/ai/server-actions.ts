'use server';

import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

// Server action to analyze transactions
export async function analyzeTransactions(prevState: any, query: string) {
  'use server';

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing. Please set it in your .env file');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // lebih ringan & cepat, bisa diganti gpt-4-turbo
        messages: [
          {
            role: 'system',
            content:
              'You are a financial assistant. Analyze financial transactions, detect spending patterns, suggest savings opportunities, and provide budget recommendations.',
          },
          {
            role: 'user',
            content: `Analyze these financial transactions for: "${query}"`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    const aiResponse =
      data.choices?.[0]?.message?.content?.trim() ||
      'No valid response from AI.';

    // Optional: refresh dashboard after analysis
    revalidatePath('/dashboard');

    return {
      id: nanoid(),
      role: 'assistant',
      content: aiResponse,
    };
  } catch (error: any) {
    console.error('Error in analyzeTransactions:', error);

    return {
      id: nanoid(),
      role: 'assistant',
      content:
        '⚠️ Sorry, there was an error processing your request. ' +
        (error.message || ''),
    };
  }
}
