import React from 'react';
import { Socio } from '../../types';
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Eye,
  User,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SocioMobileCardProps {
  socio: Socio;
  metrics: { totalGastado: number; totalPedidos: number };
  onView: (socio: Socio) => void;
  onEdit: (socio: Socio) => void;
  onDelete: (id: string) => void;
}

export const SocioMobileCard = ({ 
  socio, 
  metrics,
  onView, 
  onEdit, 
  onDelete 
}: SocioMobileCardProps) => {
  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background-tertiary flex items-center justify-center text-brand font-bold">
             {socio.nombre?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-text-primary">{socio.nombre}</h3>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(socio.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-background-tertiary/50 p-2 rounded-lg">
          <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Pedidos
          </p>
          <p className="font-medium">{metrics.totalPedidos}</p>
        </div>
        
        <div className="bg-background-tertiary/50 p-2 rounded-lg">
          <p className="text-xs text-text-secondary mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Gastado
          </p>
          <p className="font-medium font-mono text-brand">${metrics.totalGastado.toLocaleString()}</p>
        </div>
      </div>

      {socio.telefono && (
        <div className="flex items-center gap-2 text-sm bg-background-tertiary p-2 rounded-lg border border-border/50">
          <Phone className="w-4 h-4 text-text-secondary" />
          <span className="font-mono text-text-primary">{socio.telefono}</span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button 
          onClick={() => onView(socio)}
          className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> Ver
        </button>
        <button 
          onClick={() => onEdit(socio)}
          className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" /> Editar
        </button>
        <button 
          onClick={() => onDelete(socio.id)}
          className="w-12 flex items-center justify-center btn-secondary text-status-danger hover:bg-status-danger/10 border-status-danger/20"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
