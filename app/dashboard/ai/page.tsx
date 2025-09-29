'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  display: React.ReactNode;
}

export default function AIAssistantPage() {
  const [input, setInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      display: <div className="whitespace-pre-wrap">Hello! I&#39;m your financial assistant. How can I help you today?</div>,
    }
  ]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || inputDisabled) return;

    // Add user message to UI state
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      display: <div className="whitespace-pre-wrap">{input}</div>,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setInputDisabled(true);
    setInput('');

    try {
      // Call the AI API endpoint instead of using server actions directly
      const response = await fetch('/api/financial-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Update UI state with AI response
      const aiMessage: Message = {
        id: Date.now(),
        role: 'assistant',
        display: <div className="whitespace-pre-wrap">{data.result.content}</div>,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error('Error calling AI:', error);
      
      // Add error message to UI
      const errorMessage: Message = {
        id: Date.now(),
        role: 'assistant',
        display: <div className="text-red-500">Error: Could not process your request</div>,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        errorMessage,
      ]);
    } finally {
      setInputDisabled(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">AI Financial Assistant</h1>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 text-right ml-auto max-w-[80%]' 
                  : 'bg-gray-100 text-left mr-auto max-w-[80%]'
              }`}
            >
              {message.display}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances, e.g., &#39;How can I reduce my monthly expenses?&#39;"
            disabled={inputDisabled}
            className="flex-1"
          />
          <Button type="submit" disabled={inputDisabled || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Try these examples:</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Analyze my spending habits</li>
          <li>How can I reduce my monthly expenses?</li>
          <li>What&#39;s a good budget plan for my income?</li>
          <li>Suggest saving strategies</li>
        </ul>
      </div>
    </div>
  );
}