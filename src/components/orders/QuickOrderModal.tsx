import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Loader2, Search, Plus } from 'lucide-react';
import { useUIStore } from '../../services/uiStore';
import { api } from '../../services/api';
import { Socio, PedidoInsert } from '../../types';
import { cn } from '../../lib/utils';

export const QuickOrderModal = () => {
  const { isQuickOrderOpen, closeQuickOrder } = useUIStore();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSocioResults, setShowSocioResults] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch, setFocus } = useForm<PedidoInsert>({
    defaultValues: {
      modalidad: 'retiro',
      metodo_pago: 'efectivo',
      estado_pago: 'pendiente',
      estado_pedido: 'pendiente',
      cantidad: 1,
      fecha_entrega: new Date().toISOString().split('T')[0],
      horario_entrega: '18-20'
    }
  });

  const modalidad = watch('modalidad');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isQuickOrderOpen) {
      fetchSocios();
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        document.getElementById('socio-search')?.focus();
      }, 100);
    }
  }, [isQuickOrderOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickOrderOpen) {
        closeQuickOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickOrderOpen, closeQuickOrder]);

  const fetchSocios = async () => {
    setLoading(true);
    try {
      const data = await api.socios.getAll();
      setSocios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSocios = socios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.telefono && s.telefono.includes(searchTerm))
  );

  const handleSocioSelect = (socio: Socio) => {
    setSelectedSocio(socio);
    setValue('socio_id', socio.id);
    setSearchTerm(socio.nombre);
    setShowSocioResults(false);
    setFocus('variedad');
  };

  const onSubmit = async (data: PedidoInsert) => {
    if (!data.socio_id) {
      toast.error('Selecciona un socio');
      return;
    }

    setSubmitting(true);
    try {
      await api.pedidos.create(data);
      toast.success('Pedido creado correctamente');
      reset();
      setSelectedSocio(null);
      setSearchTerm('');
      closeQuickOrder();
      // Optional: Refresh data if on orders page? 
      // Ideally we use a global store or SWR/React Query for data sync
    } catch (error) {
      toast.error('Error al crear pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isQuickOrderOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 p-0 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-background-secondary border-t sm:border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-background-tertiary/50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand" />
            Nuevo Pedido Rápido
          </h2>
          <button 
            onClick={closeQuickOrder}
            className="text-text-secondary hover:text-text-primary p-2 -mr-2 rounded-lg hover:bg-background-tertiary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Socio Autocomplete */}
          <div className="relative z-10">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Socio</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="socio-search"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSocioResults(true);
                  if (!e.target.value) setSelectedSocio(null);
                }}
                onFocus={() => setShowSocioResults(true)}
                className={cn(
                  "input-field pl-9",
                  selectedSocio ? "border-brand/50 bg-brand/5 text-brand font-medium" : ""
                )}
                placeholder="Buscar socio..."
                autoComplete="off"
              />
              {showSocioResults && searchTerm && !selectedSocio && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background-tertiary border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                  ) : filteredSocios.length > 0 ? (
                    filteredSocios.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSocioSelect(s)}
                        className="w-full text-left px-4 py-3 hover:bg-background-secondary transition-colors border-b border-border last:border-0"
                      >
                        <p className="font-medium text-sm">{s.nombre}</p>
                        <p className="text-xs text-text-secondary">{s.telefono}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-text-secondary">No encontrado</div>
                  )}
                </div>
              )}
            </div>
            <input type="hidden" {...register('socio_id')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Variedad</label>
              <input 
                {...register('variedad', { required: true })}
                className="input-field"
                placeholder="Ej: Lemon Haze"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Cantidad (g)</label>
              <input 
                type="number"
                step="0.1"
                {...register('cantidad', { required: true, min: 0.1 })}
                className="input-field"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Total ($)</label>
              <input 
                type="number"
                {...register('precio_total', { required: true, min: 0 })}
                className="input-field font-mono"
                placeholder="0"
              />
            </div>
             <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Fecha Entrega</label>
              <input 
                type="date"
                {...register('fecha_entrega')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Modalidad</label>
              <div className="flex bg-background-tertiary p-1 rounded-xl border border-border">
                {['retiro', 'envio'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue('modalidad', m as any)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                      modalidad === m 
                        ? "bg-brand text-black shadow-sm" 
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Pago</label>
              <select {...register('metodo_pago')} className="input-field appearance-none">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          {modalidad === 'envio' && (
             <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Dirección</label>
              <input 
                {...register('direccion', { required: true })}
                className="input-field"
                placeholder="Dirección completa"
              />
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={closeQuickOrder}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
