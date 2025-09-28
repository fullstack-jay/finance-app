'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/lib/auth-client';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  isApproved: boolean;
  categoryId: number;
  category: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { data: session } = useSession();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Open the dialog if quickCreate parameter is present
    if (searchParams.get('quickCreate') === 'true' && !isDialogOpen) {
      setIsDialogOpen(true);
    }
  }, [searchParams, isDialogOpen]);

  useEffect(() => {
    // Clean up form and URL when dialog closes
    if (!isDialogOpen) {
      resetForm();
      if (searchParams.get('quickCreate') === 'true') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('quickCreate');
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }
    }
  }, [isDialogOpen, searchParams, pathname, router]);


  const fetchData = async () => {
    try {
      // Fetch categories without any type filtering to get all categories
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('All categories:', categoriesData); // Debug log
        setCategories(categoriesData);
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}` 
        : '/api/transactions';
        
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId > 0 ? parseInt(formData.categoryId.toString()) : null,
        }),
      });
      
      if (response.ok) {
        await fetchData();
        handleCloseDialog();
        
        // Show success toast
        if (editingTransaction) {
          toast.success(t('transaction_updated'), {
            description: t('transaction_successfully_updated'),
          });
        } else {
          toast.success(t('transaction_created'), {
            description: t('transaction_successfully_created'),
          });
        }
      } else {
        toast.error(t('error'), {
          description: t('failed_to_save_transaction'),
        });
      }
    } catch (error) {
      console.error(t('error_saving_transaction'), error);
      toast.error(t('error'), {
        description: t('error_occurred_while_saving_transaction'),
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      categoryId: transaction.categoryId || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('confirm_delete_transaction'))) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
          toast.success(t('transaction_deleted'), {
            description: t('transaction_successfully_deleted'),
          });
        } else {
          toast.error(t('error'), {
            description: t('failed_to_delete_transaction'),
          });
        }
      } catch (error) {
        console.error(t('error_deleting_transaction'), error);
        toast.error(t('error'), {
          description: t('error_occurred_while_deleting_transaction'),
        });
      }
    }
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: 0,
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading_transactions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('transactions')}</h1>
          <p className="text-muted-foreground">
            {t('manage_income_expenses')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('all_transactions')}</CardTitle>
              <CardDescription>
                {t('view_manage_financial_transactions')}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('add_transaction')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTransaction ? t('edit_transaction') : t('add_transaction')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTransaction 
                      ? t('edit_transaction_details') 
                      : t('add_new_income_expense_transaction')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        {t('type')}
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({...formData, type: value as 'income' | 'expense'})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('select_type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">{t('income')}</SelectItem>
                          <SelectItem value="expense">{t('expense')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        {t('amount')}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        {t('description')}
                      </Label>
                      <Input
                        id="description"
                        className="col-span-3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        {t('date')}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        className="col-span-3"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        {t('category')}
                      </Label>
                      <Select
                        value={formData.categoryId != null && formData.categoryId > 0 ? formData.categoryId.toString() : ""}
                        onValueChange={(value) => setFormData({...formData, categoryId: parseInt(value) || 0})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('select_category')} />
                        </SelectTrigger>
                        <SelectContent>
                        {(() => {
                          const filtered = categories.filter(cat => {
                            // Show all categories that match the transaction type or are general transaction categories
                            const matches = cat.type === formData.type || 
                                   cat.type === 'transaction' || 
                                   !cat.type;
                            console.log(`Category ${cat.name}: type=${cat.type}, matches=${matches}`); // Debug log
                            return matches;
                          });
                          console.log('Filtered categories for type', formData.type, ':', filtered); // Debug log
                          return filtered.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {t(category.name.toLowerCase()) || category.name}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingTransaction ? t('update_transaction') : t('add_transaction')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.category?.name || t('no_category')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('no_transactions_found')}</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('add_first_transaction')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}