import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { Pedido, PedidoInsert, Socio } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useUIStore } from '../services/uiStore';
import { PedidoMobileCard } from '../components/orders/PedidoMobileCard';
import { StatusUpdateModal } from '../components/orders/StatusUpdateModal';
import { MobileFilterModal } from '../components/orders/MobileFilterModal';
import { RefreshCw } from 'lucide-react';

export const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  
  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedPedidoForStatus, setSelectedPedidoForStatus] = useState<Pedido | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('estado') || 'all';
  const paymentFilter = searchParams.get('pago') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const { openQuickOrder } = useUIStore();
  const { register, handleSubmit, reset, setValue, watch } = useForm<PedidoInsert>();
  
  const modalidad = watch('modalidad');

  const fetchData = async () => {
    try {
      const [pedidosData, sociosData] = await Promise.all([
        api.pedidos.getAll(),
        api.socios.getAll()
      ]);
      setPedidos(pedidosData);
      setSocios(sociosData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && e.target instanceof HTMLBodyElement) {
        e.preventDefault();
        openQuickOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openQuickOrder]);

  useEffect(() => {
    if (editingPedido) {
      setValue('socio_id', editingPedido.socio_id);
      setValue('variedad', editingPedido.variedad);
      setValue('cantidad', editingPedido.cantidad);
      setValue('precio_total', editingPedido.precio_total);
      setValue('modalidad', editingPedido.modalidad);
      setValue('direccion', editingPedido.direccion);
      setValue('metodo_pago', editingPedido.metodo_pago);
      setValue('estado_pago', editingPedido.estado_pago);
      setValue('estado_pedido', editingPedido.estado_pedido);
      setValue('fecha_entrega', editingPedido.fecha_entrega);
      setValue('horario_entrega', editingPedido.horario_entrega);
    } else {
      reset({
        estado_pago: 'pendiente',
        estado_pedido: 'pendiente',
        modalidad: 'retiro',
        metodo_pago: 'efectivo',
        horario_entrega: '18-20'
      });
    }
  }, [editingPedido, setValue, reset]);

  const onSubmit = async (data: PedidoInsert) => {
    try {
      if (editingPedido) {
        await api.pedidos.update(editingPedido.id, data);
        toast.success('Pedido actualizado');
      } else {
        await api.pedidos.create(data);
        toast.success('Pedido creado');
      }
      setIsModalOpen(false);
      setEditingPedido(null);
      reset();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar pedido');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;
    try {
      await api.pedidos.delete(id);
      toast.success('Pedido eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar pedido');
    }
  };

  const handleInlineStatusUpdate = async (id: string, field: 'estado_pedido' | 'estado_pago', value: string) => {
    try {
      // Optimistic update
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
      
      await api.pedidos.update(id, { [field]: value });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
      fetchData(); // Revert on error
    }
  };

  const handleStatusUpdate = async (id: string, data: { estado_pedido: string; estado_pago: string }) => {
    try {
      // Type casting for strict typing
      const typedData = {
        estado_pedido: data.estado_pedido as 'pendiente' | 'en_reparto' | 'entregado',
        estado_pago: data.estado_pago as 'pendiente' | 'confirmado'
      };

      // Optimistic update
      setPedidos(prev => prev.map(p => 
        p.id === id ? { ...p, ...typedData } : p
      ));
      
      await api.pedidos.update(id, typedData);
      toast.success('Estados actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar estados');
      fetchData(); // Revert on error
    }
  };

  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: 'estado_pedido',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('estado_pedido') as string;
        return (
          <div className="relative group">
            <select
              value={status}
              onChange={(e) => handleInlineStatusUpdate(row.original.id, 'estado_pedido', e.target.value)}
              className={cn(
                "appearance-none bg-transparent border-none text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer focus:ring-0",
                status === 'entregado' && "text-status-success bg-status-success/10",
                status === 'en_reparto' && "text-status-info bg-status-info/10",
                status === 'pendiente' && "text-status-warning bg-status-warning/10"
              )}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_reparto">En Reparto</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
        );
      },
    },
    {
      accessorKey: 'socio.nombre',
      header: 'Socio',
      cell: ({ row }) => <span className="font-medium">{row.original.socio?.nombre}</span>,
    },
    {
      accessorKey: 'variedad',
      header: 'Variedad',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-text-primary">{row.getValue('variedad')}</span>
          <span className="text-xs text-text-secondary">{row.original.cantidad}g</span>
        </div>
      ),
    },
    {
      accessorKey: 'modalidad',
      header: 'Entrega',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-text-secondary">
          <span className="text-text-primary font-medium capitalize">{row.getValue('modalidad')}</span>
          <span>{row.original.fecha_entrega ? format(new Date(row.original.fecha_entrega), 'dd MMM', { locale: es }) : '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'estado_pago',
      header: 'Pago',
      cell: ({ row }) => {
        const status = row.getValue('estado_pago') as string;
        return (
          <button
            onClick={() => handleInlineStatusUpdate(
              row.original.id, 
              'estado_pago', 
              status === 'confirmado' ? 'pendiente' : 'confirmado'
            )}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80",
              status === 'confirmado' 
                ? "text-status-success bg-status-success/10 border-status-success/20" 
                : "text-status-danger bg-status-danger/10 border-status-danger/20"
            )}
          >
            {status === 'confirmado' ? 'Pagado' : 'Pendiente'}
          </button>
        );
      },
    },
    {
      accessorKey: 'precio_total',
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium">
          ${(row.getValue('precio_total') as number).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => {
              setSelectedPedidoForStatus(row.original);
              setIsStatusModalOpen(true);
            }}
            className="p-2 hover:bg-background-tertiary rounded-lg text-text-primary transition-colors"
            title="Actualizar Estados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setEditingPedido(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-background-tertiary rounded-lg text-brand transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.original.id)}
            className="p-2 hover:bg-background-tertiary rounded-lg text-status-danger transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredPedidos = pedidos.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.estado_pedido === statusFilter;
    const matchesPayment = paymentFilter === 'all' || p.estado_pago === paymentFilter;
    const matchesSearch = searchQuery === '' || 
      p.variedad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.socio?.nombre || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-text-secondary">Gestión de órdenes y entregas</p>
        </div>
        <button 
          onClick={openQuickOrder}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pedido
        </button>
      </div>

      <div className="card space-y-4">
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Buscar por variedad o socio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background-tertiary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
              />
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="md:hidden p-2.5 bg-background-tertiary border border-border rounded-xl text-text-secondary hover:text-brand hover:border-brand transition-colors active:scale-95"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filters - Desktop Only */}
          <div className="hidden md:flex flex-col gap-3 w-full md:w-auto overflow-hidden">
            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap uppercase tracking-wider">Estado</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'en_reparto', label: 'En Reparto' },
                  { value: 'entregado', label: 'Entregado' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), estado: option.value })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                      statusFilter === option.value
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-background-tertiary text-text-secondary border-border hover:border-brand/50 hover:text-text-primary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap uppercase tracking-wider pl-1">Pago</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'confirmado', label: 'Confirmado' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), pago: option.value })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                      paymentFilter === option.value
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-background-tertiary text-text-secondary border-border hover:border-brand/50 hover:text-text-primary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable 
                columns={columns} 
                data={filteredPedidos} 
              />
            </div>

            <div className="md:hidden space-y-4">
              {filteredPedidos.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <p>No hay pedidos que coincidan con los filtros.</p>
                </div>
              ) : (
                filteredPedidos.map(pedido => (
                  <PedidoMobileCard
                    key={pedido.id}
                    pedido={pedido}
                    onStatusChange={(id, value) => handleInlineStatusUpdate(id, 'estado_pedido', value)}
                    onPaymentChange={(id) => handleInlineStatusUpdate(
                      id, 
                      'estado_pago', 
                      pedido.estado_pago === 'confirmado' ? 'pendiente' : 'confirmado'
                    )}
                    onEdit={(p) => {
                      setEditingPedido(p);
                      setIsModalOpen(true);
                    }}
                    onStatusUpdate={() => {
                      setSelectedPedidoForStatus(pedido);
                      setIsStatusModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <StatusUpdateModal 
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedPedidoForStatus(null);
        }}
        pedido={selectedPedidoForStatus}
        onUpdate={handleStatusUpdate}
      />

      <MobileFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentStatus={statusFilter}
        currentPayment={paymentFilter}
        onApply={(status, payment) => {
          setSearchParams({ 
            ...Object.fromEntries(searchParams), 
            estado: status,
            pago: payment 
          });
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 p-0">
          <div className="bg-background-secondary w-full sm:max-w-2xl h-[90vh] sm:h-auto rounded-t-2xl sm:rounded-xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-2 -mr-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Socio</label>
                  <select 
                    {...register('socio_id', { required: true })}
                    className="input-field appearance-none"
                  >
                    <option value="">Seleccionar socio...</option>
                    {socios.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Variedad</label>
                  <input 
                    {...register('variedad', { required: true })}
                    className="input-field"
                    placeholder="Ej: Lemon Haze"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Cantidad (g)</label>
                  <input 
                    type="number"
                    step="0.1"
                    {...register('cantidad', { required: true, min: 0 })}
                    className="input-field"
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Precio Total ($)</label>
                  <input 
                    type="number"
                    {...register('precio_total', { required: true, min: 0 })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Modalidad</label>
                  <select 
                    {...register('modalidad', { required: true })}
                    className="input-field appearance-none"
                  >
                    <option value="retiro">Retiro</option>
                    <option value="envio">Envío</option>
                  </select>
                </div>

                {modalidad === 'envio' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Dirección</label>
                    <input 
                      {...register('direccion', { required: true })}
                      className="input-field"
                      placeholder="Dirección completa"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Método de Pago</label>
                  <select 
                    {...register('metodo_pago', { required: true })}
                    className="input-field appearance-none"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Estado de Pago</label>
                  <select 
                    {...register('estado_pago', { required: true })}
                    className="input-field appearance-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Fecha Entrega</label>
                  <input 
                    type="date"
                    {...register('fecha_entrega')}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Estado Pedido</label>
                  <select 
                    {...register('estado_pedido', { required: true })}
                    className="input-field appearance-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_reparto">En Reparto</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Guardar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
