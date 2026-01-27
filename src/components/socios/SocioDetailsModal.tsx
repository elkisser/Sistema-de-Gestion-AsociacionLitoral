import React, { useEffect, useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';
import { Socio, Pedido } from '../../types';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUIStore } from '../../services/uiStore';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SocioDetailsModalProps {
  socio: Socio;
  onClose: () => void;
}

export const SocioDetailsModal = ({ socio, onClose }: SocioDetailsModalProps) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { openQuickOrder } = useUIStore(); 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const allPedidos = await api.pedidos.getAll();
        setPedidos(allPedidos.filter(p => p.socio_id === socio.id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [socio.id]);

  const totalGastado = pedidos.reduce((acc, p) => acc + p.precio_total, 0);
  const totalPedidos = pedidos.length;
  const lastOrder = pedidos[0]; 
  
  let frequency = 'N/A';
  if (totalPedidos > 1) {
    const firstDate = new Date(pedidos[pedidos.length - 1].created_at);
    const lastDate = new Date(pedidos[0].created_at);
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    frequency = `${Math.round(diffDays / (totalPedidos - 1))} días`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-secondary border-t sm:border-l sm:border-t-0 border-border h-[90vh] sm:h-full w-full sm:max-w-md shadow-2xl flex flex-col rounded-t-2xl sm:rounded-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between bg-background-tertiary/50">
          <div>
            <h2 className="font-bold text-xl">{socio.nombre}</h2>
            <p className="text-text-secondary text-sm">{socio.telefono || 'Sin teléfono'}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 -mr-2 rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 bg-background-tertiary/50 border border-border/50">
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Total Gastado
              </p>
              <p className="text-lg font-bold text-brand">${totalGastado.toLocaleString()}</p>
            </div>
            <div className="card p-4 bg-background-tertiary/50 border border-border/50">
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> Total Pedidos
              </p>
              <p className="text-lg font-bold text-text-primary">{totalPedidos}</p>
            </div>
            <div className="card p-4 bg-background-tertiary/50 border border-border/50">
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Última Compra
              </p>
              <p className="text-sm font-medium text-text-primary">
                {lastOrder ? format(new Date(lastOrder.created_at), 'dd MMM yyyy', { locale: es }) : '-'}
              </p>
            </div>
            <div className="card p-4 bg-background-tertiary/50 border border-border/50">
              <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Frecuencia
              </p>
              <p className="text-sm font-medium text-text-primary">{frequency}</p>
            </div>
          </div>

          <button 
            onClick={() => {
               onClose();
               openQuickOrder();
            }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido para {socio.nombre.split(' ')[0]}
          </button>

          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              Historial de Pedidos
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-text-secondary/20 mx-auto mb-3" />
                <p className="text-text-secondary">Sin pedidos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((pedido) => (
                  <div 
                    key={pedido.id} 
                    className="group p-4 border border-border rounded-xl bg-background-tertiary/20 hover:bg-background-tertiary/40 transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2.5 rounded-xl mt-0.5 transition-colors", 
                          pedido.estado_pedido === 'entregado' ? "bg-status-success/10 text-status-success" :
                          pedido.estado_pedido === 'en_reparto' ? "bg-status-info/10 text-status-info" :
                          "bg-status-warning/10 text-status-warning"
                        )}>
                          {pedido.estado_pedido === 'entregado' && <CheckCircle2 className="w-4 h-4" />}
                          {pedido.estado_pedido === 'en_reparto' && <Truck className="w-4 h-4" />}
                          {pedido.estado_pedido === 'pendiente' && <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary text-sm">{pedido.variedad}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary mt-1.5">
                            <span className="font-medium text-text-primary bg-background-secondary px-1.5 py-0.5 rounded-md border border-border">
                              {pedido.cantidad}g
                            </span>
                            <span className="capitalize flex items-center gap-1">
                              {pedido.modalidad === 'envio' ? '🚚 Envío' : '🏪 Retiro'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="capitalize">{pedido.metodo_pago}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-brand text-sm">${pedido.precio_total.toLocaleString()}</p>
                        <p className="text-[10px] text-text-secondary mt-1 font-medium">
                          {format(new Date(pedido.created_at), 'dd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex gap-2">
                         <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1", 
                            pedido.estado_pago === 'confirmado' 
                              ? "bg-status-success/5 text-status-success border-status-success/20" 
                              : "bg-status-danger/5 text-status-danger border-status-danger/20"
                         )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", 
                              pedido.estado_pago === 'confirmado' ? "bg-status-success" : "bg-status-danger"
                            )} />
                            {pedido.estado_pago === 'confirmado' ? 'Pagado' : 'Pago Pendiente'}
                         </span>
                      </div>
                      {pedido.fecha_entrega && (
                        <span className="text-[10px] text-text-secondary bg-background-secondary px-2 py-0.5 rounded-md border border-border">
                          Entrega: {format(new Date(pedido.fecha_entrega), 'dd/MM', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
