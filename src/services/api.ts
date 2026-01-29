import { supabase } from '../lib/supabase';
import { Pedido, PedidoInsert, PedidoUpdate, Socio, SocioInsert, SocioUpdate } from '../types';

export const api = {
  socios: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .order('nombre');
      if (error) throw error;
      return data as Socio[];
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Socio;
    },
    create: async (socio: SocioInsert) => {
      const { data, error } = await supabase
        .from('socios')
        .insert(socio)
        .select()
        .single();
      if (error) throw error;
      return data as Socio;
    },
    update: async (id: string, socio: SocioUpdate) => {
      const { data, error } = await supabase
        .from('socios')
        .update(socio)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Socio;
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('socios')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },
  pedidos: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, socio:socios(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Pedido[];
    },
    create: async (pedido: PedidoInsert) => {
      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select()
        .single();
      if (error) throw error;
      return data as Pedido;
    },
    update: async (id: string, pedido: PedidoUpdate) => {
      const { data, error } = await supabase
        .from('pedidos')
        .update(pedido)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Pedido;
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    getStats: async () => {
        // This will be handled in the component for now using the getAll data to aggregate
        // Ideally we use RPC calls for complex aggregation on DB side
    }
  },
  files: {
    upload: async (file: File, socioId: string) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${socioId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('socios-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('socios-files')
        .getPublicUrl(fileName);

      // Create DB record
      const { data, error: dbError } = await supabase
        .from('socio_archivos')
        .insert({
          socio_id: socioId,
          nombre: file.name,
          url: publicUrl,
          tipo: file.type,
          peso: file.size
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      return data;
    },
    getBySocioId: async (socioId: string) => {
      const { data, error } = await supabase
        .from('socio_archivos')
        .select('*')
        .eq('socio_id', socioId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    delete: async (id: string, url: string) => {
      // Delete from DB first
      const { error: dbError } = await supabase
        .from('socio_archivos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Extract path from URL
      const path = url.split('socios-files/')[1];
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('socios-files')
          .remove([path]);
        
        if (storageError) console.error('Error removing file from storage:', storageError);
      }
    }
  }
};
