'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, CreditCard, PiggyBank, DollarSign } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface Insight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export function FinancialInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('spending-analysis');
  const { user } = useUser();

  const insightTypes = [
    { id: 'spending-analysis', label: 'Spending Analysis', icon: CreditCard },
    { id: 'budget-advice', label: 'Budget Advice', icon: DollarSign },
    { id: 'investment-suggestions', label: 'Investments', icon: TrendingUp },
    { id: 'savings-tips', label: 'Savings Tips', icon: PiggyBank },
  ];

  useEffect(() => {
    fetchInsights();
  }, [activeTab, user]);

  const fetchInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/financial-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          insightType: activeTab,
        }),
      });

      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`);
        // Set error state instead of throwing
        setInsights([
          {
            title: 'Service Temporarily Unavailable',
            description: `Financial insights service returned error: ${response.status}. Please try again later.`,
            priority: 'high',
          }
        ]);
        return;
      }

      const data = await response.json();
      
      // Check if the response contains error information (when database is unavailable)
      // Even if response.ok is true, the data might indicate an error state
      if (data.error) {
        console.error('API returned error:', data.error);
        // Create a simulated error state for the UI
        setInsights([
          {
            title: 'Service Temporarily Unavailable',
            description: 'Financial insights are temporarily unavailable due to service issues. Please try again later.',
            priority: 'high',
          }
        ]);
        return;
      }
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([
        {
          title: 'Error loading insights',
          description: 'There was an issue loading your financial insights. Please try again later.',
          priority: 'high',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'medium': return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to see personalized financial insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">Financial Insights</CardTitle>
        <div className="flex space-x-2 overflow-x-auto py-2">
          {insightTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Button
                key={type.id}
                variant={activeTab === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(type.id)}
                className="whitespace-nowrap"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <div className="pt-1">
                        {getPriorityIcon(insight.priority)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        {insight.action && (
                          <div className="mt-2">
                            <Badge variant="outline">{insight.action}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No insights available at the moment. Add more transactions to see personalized recommendations.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}