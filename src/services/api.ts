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
  }
};
