export type Socio = {
  id: string;
  nombre: string;
  telefono: string | null;
  created_at: string;
};

export type Pedido = {
  id: string;
  socio_id: string;
  fecha_pedido: string;
  variedad: string;
  cantidad: number;
  precio_total: number;
  modalidad: 'retiro' | 'envio';
  direccion: string | null;
  metodo_pago: 'transferencia' | 'efectivo';
  estado_pago: 'pendiente' | 'confirmado';
  estado_pedido: 'pendiente' | 'en_reparto' | 'entregado';
  fecha_entrega: string | null;
  horario_entrega: string | null;
  created_at: string;
  socio?: Socio; // Joined data
};

export type Notification = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  pedido_id: string | null;
  created_at: string;
};

export type PedidoInsert = Omit<Pedido, 'id' | 'created_at' | 'socio'>;
export type PedidoUpdate = Partial<PedidoInsert>;

export type SocioInsert = Omit<Socio, 'id' | 'created_at'>;
export type SocioUpdate = Partial<SocioInsert>;
