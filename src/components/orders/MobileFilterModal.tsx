import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ListFilter,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  currentPayment: string;
  onApply: (status: string, payment: string) => void;
}

export const MobileFilterModal = ({
  isOpen,
  onClose,
  currentStatus,
  currentPayment,
  onApply
}: MobileFilterModalProps) => {
  const [tempStatus, setTempStatus] = useState(currentStatus);
  const [tempPayment, setTempPayment] = useState(currentPayment);

  // Reset temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempStatus(currentStatus);
      setTempPayment(currentPayment);
    }
  }, [isOpen, currentStatus, currentPayment]);

  if (!isOpen) return null;

  const statusOptions = [
    { 
      value: 'all', 
      label: 'Todos', 
      icon: ListFilter,
      colorClass: 'text-text-primary',
      bgClass: 'bg-background-tertiary'
    },
    { 
      value: 'pendiente', 
      label: 'Pendiente', 
      icon: Clock,
      colorClass: 'text-status-warning',
      bgClass: 'bg-status-warning/10'
    },
    { 
      value: 'en_reparto', 
      label: 'En Reparto', 
      icon: Truck,
      colorClass: 'text-status-info',
      bgClass: 'bg-status-info/10'
    },
    { 
      value: 'entregado', 
      label: 'Entregado', 
      icon: CheckCircle2,
      colorClass: 'text-status-success',
      bgClass: 'bg-status-success/10'
    }
  ];

  const paymentOptions = [
    { 
      value: 'all', 
      label: 'Todos', 
      icon: ListFilter,
      colorClass: 'text-text-primary',
      bgClass: 'bg-background-tertiary'
    },
    { 
      value: 'pendiente', 
      label: 'Pendiente', 
      icon: Clock,
      colorClass: 'text-status-warning',
      bgClass: 'bg-status-warning/10'
    },
    { 
      value: 'confirmado', 
      label: 'Confirmado', 
      icon: CheckCircle2,
      colorClass: 'text-status-success',
      bgClass: 'bg-status-success/10'
    }
  ];

  const handleApply = () => {
    onApply(tempStatus, tempPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-secondary w-full rounded-t-2xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom duration-300 max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Filtros</h2>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 -mr-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Estado del Pedido</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempStatus(option.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center gap-3",
                    tempStatus === option.value
                      ? "bg-brand text-white border-brand shadow-md"
                      : "bg-background-tertiary text-text-secondary border-border hover:border-brand/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-full",
                    tempStatus === option.value ? "bg-white/20 text-white" : `${option.bgClass} ${option.colorClass}`
                  )}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Estado del Pago</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempPayment(option.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center gap-3",
                    tempPayment === option.value
                      ? "bg-brand text-white border-brand shadow-md"
                      : "bg-background-tertiary text-text-secondary border-border hover:border-brand/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-full",
                    tempPayment === option.value ? "bg-white/20 text-white" : `${option.bgClass} ${option.colorClass}`
                  )}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background-tertiary/30">
          <button 
            onClick={handleApply}
            className="btn-primary w-full py-3 text-lg shadow-lg shadow-brand/20"
          >
            Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
};
