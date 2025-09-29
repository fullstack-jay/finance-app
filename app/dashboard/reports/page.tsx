'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSession } from '@/lib/auth-client';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  FileText,
  Download,
  Filter,
  Calendar,
  Printer
} from 'lucide-react';

// Helper function to format currency in IDR
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return 'Rp0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Rp0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  profitLoss: number;
  totalAssets: number;
  totalInvestments: number;
  monthlyChange: number;
}

interface ReportTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: {
    name: string;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [transactions, setTransactions] = useState<ReportTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const { data: session } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch report summary
      const reportResponse = await fetch('/api/reports');
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        setReportData(reportData);
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch('/api/transactions?limit=10');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } else {
        console.error('Failed to fetch transactions:', transactionsResponse.status);
        // Set an empty array instead of failing completely
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate report functions
  const generateIncomeStatement = async () => {
    try {
      const response = await fetch('/api/reports/income-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate: dateRange.from,
          toDate: dateRange.to
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `income-statement-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error generating income statement:', response.status);
      }
    } catch (error) {
      console.error('Error generating income statement:', error);
    }
  };

  const generateExpenseReport = async () => {
    try {
      const response = await fetch('/api/reports/expense-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate: dateRange.from,
          toDate: dateRange.to
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error generating expense report:', response.status);
      }
    } catch (error) {
      console.error('Error generating expense report:', error);
    }
  };

  const generateBalanceSheet = async () => {
    try {
      const response = await fetch('/api/reports/balance-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toDate: dateRange.to
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance-sheet-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error generating balance sheet:', response.status);
      }
    } catch (error) {
      console.error('Error generating balance sheet:', error);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export function
  const handleExport = async () => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate: dateRange.from,
          toDate: dateRange.to,
          format: 'csv'
        })
      });
      
      if (response.ok) {
        const csvContent = await response.text();
        // Create a blob from the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error exporting report:', response.status);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('reports')}</h1>
          <p className="text-muted-foreground">
            {t('view_financial_reports')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Report Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          {t('select_date_range')}
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {t('filter')}
        </Button>
        <div className="flex-1"></div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          {t('print')}
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t('export')}
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_income')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''} {t('from_last_month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_expenses')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''} {t('from_last_month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('net_worth')}</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''} {t('from_last_month')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('profit_loss')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.profitLoss)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''} {t('from_last_month')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset and Investment Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_assets')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(reportData?.totalAssets)}
            </div>
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="mr-2">
                {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t('from_last_month')}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_investments')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(reportData?.totalInvestments)}
            </div>
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="mr-2">
                {reportData?.monthlyChange != null ? (reportData?.monthlyChange >= 0 ? '+' : '') + reportData?.monthlyChange + '%' : ''}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t('from_last_month')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('recent_transactions')}</h2>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead className="text-right">{t('amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), 'MMM dd, yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category?.name || t('no_category')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Report Types */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('available_reports')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                {t('income_statement')}
              </CardTitle>
              <CardDescription>
                {t('income_statement_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={generateIncomeStatement}>
                {t('generate_report')}
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-muted-foreground" />
                {t('expense_report')}
              </CardTitle>
              <CardDescription>
                {t('expense_report_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={generateExpenseReport}>
                {t('generate_report')}
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                {t('balance_sheet')}
              </CardTitle>
              <CardDescription>
                {t('balance_sheet_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={generateBalanceSheet}>
                {t('generate_report')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}