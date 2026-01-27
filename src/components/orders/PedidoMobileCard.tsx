import React from 'react';
import { Pedido } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Truck, 
  Package,
  User,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PedidoMobileCardProps {
  pedido: Pedido;
  onStatusChange: (id: string, value: string) => void;
  onPaymentChange: (id: string) => void;
  onEdit: (pedido: Pedido) => void;
  onDelete: (id: string) => void;
}

export const PedidoMobileCard = ({ 
  pedido, 
  onStatusChange, 
  onPaymentChange, 
  onEdit, 
  onDelete 
}: PedidoMobileCardProps) => {
  const isEnvio = pedido.modalidad === 'envio';
  const isPaid = pedido.estado_pago === 'confirmado';

  const statusColors = {
    pendiente: "bg-status-warning/10 text-status-warning border-status-warning/20",
    en_reparto: "bg-status-info/10 text-status-info border-status-info/20",
    entregado: "bg-status-success/10 text-status-success border-status-success/20"
  };

  const statusLabels = {
    pendiente: "Pendiente",
    en_reparto: "En Reparto",
    entregado: "Entregado"
  };

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 space-y-4">
      {/* Header: Socio & Status */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-background-tertiary flex items-center justify-center text-brand font-bold">
             {pedido.socio?.nombre?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-text-primary">{pedido.socio?.nombre}</h3>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(pedido.created_at), "d MMM, HH:mm", { locale: es })}
            </span>
          </div>
        </div>
        <select
          value={pedido.estado_pedido}
          onChange={(e) => onStatusChange(pedido.id, e.target.value)}
          className={cn(
            "text-xs font-medium px-2 py-1 rounded-full border appearance-none focus:outline-none focus:ring-2 focus:ring-brand/50",
            statusColors[pedido.estado_pedido as keyof typeof statusColors]
          )}
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_reparto">En Reparto</option>
          <option value="entregado">Entregado</option>
        </select>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-background-tertiary/50 p-2 rounded-lg">
          <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
            <Package className="w-3 h-3" /> Variedad
          </p>
          <p className="font-medium truncate">{pedido.variedad}</p>
          <p className="text-xs text-brand">{pedido.cantidad}g</p>
        </div>
        
        <div className="bg-background-tertiary/50 p-2 rounded-lg">
          <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Total
          </p>
          <p className="font-medium font-mono">${pedido.precio_total.toLocaleString()}</p>
          <button
            onClick={() => onPaymentChange(pedido.id)}
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded mt-1 border transition-colors",
              isPaid 
                ? "text-status-success border-status-success/30 bg-status-success/10" 
                : "text-status-danger border-status-danger/30 bg-status-danger/10"
            )}
          >
            {isPaid ? 'Pagado' : 'No Pagado'}
          </button>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          {isEnvio ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          <span className="capitalize font-medium text-text-primary">{pedido.modalidad}</span>
          {pedido.fecha_entrega && (
            <span className="text-xs bg-background-tertiary px-2 py-0.5 rounded">
              {format(new Date(pedido.fecha_entrega), "d MMM", { locale: es })}
            </span>
          )}
        </div>
        
        {isEnvio && pedido.direccion && (
          <div className="flex items-start gap-2 text-sm bg-brand/5 p-2 rounded-lg border border-brand/10">
            <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <p className="text-text-secondary leading-tight">{pedido.direccion}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button 
          onClick={() => onEdit(pedido)}
          className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-2"
        >
          <Edit2 className="w-3 h-3" /> Editar
        </button>
        <button 
          onClick={() => onDelete(pedido.id)}
          className="w-10 flex items-center justify-center btn-secondary text-status-danger hover:bg-status-danger/10 border-status-danger/20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
