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
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  url: string;
  type: string;
  uploadDate: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch documents
      const documentsResponse = await fetch('/api/documents');
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);
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
      const url = editingDocument 
        ? `/api/documents/${editingDocument.id}` 
        : '/api/documents';
        
      const method = editingDocument ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        console.error('Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      url: document.url,
      type: document.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('confirm_delete_document'))) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchData();
        } else {
          console.error(t('failed_to_delete_document'));
        }
      } catch (error) {
        console.error(t('error_deleting_document'), error);
      }
    }
  };

  const resetForm = () => {
    setEditingDocument(null);
    setFormData({
      name: '',
      url: '',
      type: '',
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
          <p className="mt-4 text-muted-foreground">{t('loading_documents')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('documents')}</h1>
          <p className="text-muted-foreground">
            {t('manage_financial_documents')}
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
              <CardTitle>{t('all_documents')}</CardTitle>
              <CardDescription>
                {t('view_manage_financial_documents')}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('upload_document')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                  {editingDocument ? t('edit_document') : t('upload_document')}
                </DialogTitle>
                  <DialogDescription>
                    {editingDocument 
                      ? t('edit_document_details') 
                      : t('add_new_financial_document')}
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
                      <Label htmlFor="url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="url"
                        className="col-span-3"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        {t('type')}
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('select_type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receipt">{t('receipt')}</SelectItem>
                          <SelectItem value="invoice">{t('invoice')}</SelectItem>
                          <SelectItem value="contract">{t('contract')}</SelectItem>
                          <SelectItem value="statement">{t('statement')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingDocument ? t('update_document') : t('upload_document')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('upload_date')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(document.uploadDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={document.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(document)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(document.id)}
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
              <p>{t('no_documents_found')}</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('upload_first_document')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}