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

interface Asset {
  id: number;
  name: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  categoryId: number;
  category: {
    name: string;
  };
  maintenanceSchedule: string;
  insuranceInfo: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    purchasePrice: '',
    currentValue: '',
    depreciationRate: '',
    categoryId: 0,
    maintenanceSchedule: '',
    insuranceInfo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories?type=asset');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Fetch assets
      const assetsResponse = await fetch('/api/assets');
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setAssets(assetsData);
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
      const url = editingAsset 
        ? `/api/assets/${editingAsset.id}` 
        : '/api/assets';
        
      const method = editingAsset ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: parseFloat(formData.purchasePrice),
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
          depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : null,
          categoryId: parseInt(formData.categoryId.toString()),
        }),
      });
      
      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice.toString(),
      currentValue: asset.currentValue?.toString() || '',
      depreciationRate: asset.depreciationRate?.toString() || '',
      categoryId: asset.categoryId,
      maintenanceSchedule: asset.maintenanceSchedule || '',
      insuranceInfo: asset.insuranceInfo || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('confirm_delete_asset'))) {
      try {
        const response = await fetch(`/api/assets/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          console.error(t('failed_to_delete_asset'));
        }
      } catch (error) {
        console.error(t('error_deleting_asset'), error);
      }
    }
  };

  const resetForm = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      description: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      purchasePrice: '',
      currentValue: '',
      depreciationRate: '',
      categoryId: 0,
      maintenanceSchedule: '',
      insuranceInfo: '',
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading_assets')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('assets')}</h1>
          <p className="text-muted-foreground">
            {t('manage_company_assets')}
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
              <CardTitle>{t('all_assets')}</CardTitle>
              <CardDescription>
                {t('view_manage_company_assets')}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('add_asset')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                  {editingAsset ? t('edit_asset') : t('add_asset')}
                </DialogTitle>
                  <DialogDescription>
                    {editingAsset 
                      ? t('edit_asset_details') 
                      : t('add_new_company_asset')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        {t('name')}
                      </Label>
                      <Input
                        id="name"
                        className="col-span-3"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchaseDate" className="text-right">
                        {t('purchase_date')}
                      </Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        className="col-span-3"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="purchasePrice" className="text-right">
                        {t('purchase_price')}
                      </Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currentValue" className="text-right">
                        {t('current_value')}
                      </Label>
                      <Input
                        id="currentValue"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.currentValue}
                        onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="depreciationRate" className="text-right">
                        {t('depreciation_rate')}
                      </Label>
                      <Input
                        id="depreciationRate"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={formData.depreciationRate}
                        onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        {t('category')}
                      </Label>
                      <Select
                        value={formData.categoryId.toString()}
                        onValueChange={(value) => setFormData({...formData, categoryId: parseInt(value)})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maintenanceSchedule" className="text-right">
                        {t('maintenance')}
                      </Label>
                      <Input
                        id="maintenanceSchedule"
                        className="col-span-3"
                        value={formData.maintenanceSchedule}
                        onChange={(e) => setFormData({...formData, maintenanceSchedule: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="insuranceInfo" className="text-right">
                        {t('insurance')}
                      </Label>
                      <Input
                        id="insuranceInfo"
                        className="col-span-3"
                        value={formData.insuranceInfo}
                        onChange={(e) => setFormData({...formData, insuranceInfo: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingAsset ? t('update_asset') : t('add_asset')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('purchase_date')}</TableHead>
                  <TableHead className="text-right">{t('purchase_price')}</TableHead>
                  <TableHead className="text-right">{t('current_value')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.category?.name || t('no_category')}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(asset.purchasePrice)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(asset.currentValue || asset.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset.id)}
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
              <p>{t('no_assets_found')}</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('add_first_asset')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}