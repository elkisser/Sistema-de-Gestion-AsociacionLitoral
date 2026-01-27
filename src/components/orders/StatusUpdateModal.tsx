import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Truck, DollarSign, CheckCircle2 } from 'lucide-react';
import { Pedido } from '../../types';
import { cn } from '../../lib/utils';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null;
  onUpdate: (id: string, data: { estado_pedido: string; estado_pago: string }) => Promise<void>;
}

export const StatusUpdateModal = ({ isOpen, onClose, pedido, onUpdate }: StatusUpdateModalProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<{
    estado_pedido: string;
    estado_pago: string;
  }>();
  
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (pedido) {
      setValue('estado_pedido', pedido.estado_pedido);
      setValue('estado_pago', pedido.estado_pago);
    }
  }, [pedido, setValue]);

  const currentEstadoPedido = watch('estado_pedido');
  const currentEstadoPago = watch('estado_pago');

  const onSubmit = async (data: { estado_pedido: string; estado_pago: string }) => {
    if (pedido) {
      await onUpdate(pedido.id, data);
      
      if (data.estado_pedido === 'entregado' && data.estado_pago === 'confirmado') {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          onClose();
        }, 2000);
      } else {
        onClose();
      }
    }
  };

  if (!isOpen || !pedido) return null;

  const getPedidoStatusStyles = (status: string, isSelected: boolean) => {
    if (!isSelected) return "bg-background-tertiary border-transparent text-text-secondary hover:bg-background-tertiary/80";
    
    switch (status) {
      case 'pendiente':
        return "bg-status-warning/10 border-status-warning text-status-warning font-medium ring-1 ring-status-warning/50";
      case 'en_reparto':
        return "bg-blue-500/10 border-blue-500 text-blue-500 font-medium ring-1 ring-blue-500/50";
      case 'entregado':
        return "bg-status-success/10 border-status-success text-status-success font-medium ring-1 ring-status-success/50";
      default:
        return "bg-brand/10 border-brand text-brand font-medium ring-1 ring-brand/50";
    }
  };

  return (
    <>
      {/* Success Animation Overlay - Fixed full screen */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500 p-8 rounded-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-status-success/30 rounded-full animate-ping duration-1000" />
              <div className="absolute inset-0 bg-status-success/20 rounded-full animate-pulse duration-2000" />
              <CheckCircle2 className="w-32 h-32 text-status-success relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-white drop-shadow-md">
                ¡Pedido Completado!
              </p>
              <p className="text-gray-200 text-lg">
                El pedido ha sido entregado y pagado correctamente
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 p-0 animate-in fade-in duration-200">
        <div className="bg-background-secondary w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand" />
              Actualizar Estado
            </h2>
            <button 
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary p-2 -mr-2 rounded-lg hover:bg-background-tertiary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Estado del Envío
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pendiente', 'en_reparto', 'entregado'].map((status) => (
                      <label 
                        key={status}
                        className={cn(
                          "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                          getPedidoStatusStyles(status, currentEstadoPedido === status)
                        )}
                      >
                        <input 
                          type="radio" 
                          value={status}
                          {...register('estado_pedido')}
                          className="sr-only"
                        />
                        <span className="capitalize text-xs sm:text-sm">{status.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Estado del Pago
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'pendiente', label: 'Pendiente' },
                      { value: 'confirmado', label: 'Pagado' }
                    ].map((status) => (
                      <label 
                        key={status.value}
                        className={cn(
                          "cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                          currentEstadoPago === status.value
                            ? status.value === 'confirmado' 
                              ? "bg-status-success/10 border-status-success text-status-success font-medium ring-1 ring-status-success/50"
                              : "bg-status-warning/10 border-status-warning text-status-warning font-medium ring-1 ring-status-warning/50"
                            : "bg-background-tertiary border-transparent text-text-secondary hover:bg-background-tertiary/80"
                        )}
                      >
                        <input 
                          type="radio" 
                          value={status.value}
                          {...register('estado_pago')}
                          className="sr-only"
                        />
                        {status.value === 'confirmado' && <CheckCircle2 className="w-4 h-4" />}
                        <span className="text-sm">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
