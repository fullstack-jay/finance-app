import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Export database service functions
export const dbService = {
  // User operations
  users: {
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    createProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_profile')
        .insert([{ user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },
  
  // Category operations
  categories: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    
    create: async (category: Omit<Database['public']['Tables']['category']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('category')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },
  
  // Transaction operations
  transactions: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('transaction')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    create: async (transaction: Omit<Database['public']['Tables']['transaction']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transaction')
        .insert([transaction])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    update: async (id: number, transaction: Partial<Database['public']['Tables']['transaction']['Update']>) => {
      const { data, error } = await supabase
        .from('transaction')
        .update(transaction)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    delete: async (id: number) => {
      const { error } = await supabase
        .from('transaction')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
  
  // Asset operations
  assets: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('asset')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    
    create: async (asset: Omit<Database['public']['Tables']['asset']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('asset')
        .insert([asset])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },
  
  // Investment operations
  investments: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('investment')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    
    create: async (investment: Omit<Database['public']['Tables']['investment']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('investment')
        .insert([investment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },
  
  // Document operations
  documents: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('document')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    
    create: async (document: Omit<Database['public']['Tables']['document']['Insert'], 'id' | 'created_at' | 'updated_at' | 'upload_date'>) => {
      const { data, error } = await supabase
        .from('document')
        .insert([document])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },
};