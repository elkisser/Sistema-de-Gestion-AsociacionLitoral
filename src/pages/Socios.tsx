import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { Socio, SocioInsert, Pedido } from '../types';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { SocioDetailsModal } from '../components/socios/SocioDetailsModal';
import { SocioMobileCard } from '../components/socios/SocioMobileCard';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

export const Socios = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [socioToDelete, setSocioToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<SocioInsert>();

  const fetchData = async () => {
    try {
      const [sociosData, pedidosData] = await Promise.all([
        api.socios.getAll(),
        api.pedidos.getAll()
      ]);
      setSocios(sociosData);
      setPedidos(pedidosData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingSocio) {
      setValue('nombre', editingSocio.nombre);
      setValue('telefono', editingSocio.telefono);
    } else {
      reset();
    }
  }, [editingSocio, setValue, reset]);

  const onSubmit = async (data: SocioInsert) => {
    try {
      if (editingSocio) {
        await api.socios.update(editingSocio.id, data);
        toast.success('Socio actualizado');
      } else {
        await api.socios.create(data);
        toast.success('Socio creado');
      }
      setIsModalOpen(false);
      setEditingSocio(null);
      reset();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar socio');
    }
  };

  const handleDelete = (id: string) => {
    setSocioToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!socioToDelete) return;
    try {
      await api.socios.delete(socioToDelete);
      toast.success('Socio eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar socio');
    }
  };

  const getSocioMetrics = (socioId: string) => {
    const socioPedidos = pedidos.filter(p => p.socio_id === socioId);
    const totalGastado = socioPedidos.reduce((acc, p) => acc + p.precio_total, 0);
    const totalPedidos = socioPedidos.length;
    return { totalGastado, totalPedidos };
  };

  const columns: ColumnDef<Socio>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <button 
          onClick={() => setSelectedSocio(row.original)}
          className="font-medium hover:text-brand hover:underline text-left"
        >
          {row.getValue('nombre')}
        </button>
      ),
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => <span className="font-mono text-text-secondary">{row.getValue('telefono') || '-'}</span>,
    },
    {
      id: 'pedidos',
      header: 'Pedidos',
      cell: ({ row }) => {
        const { totalPedidos } = getSocioMetrics(row.original.id);
        return <span className="text-text-primary">{totalPedidos}</span>;
      },
    },
    {
      id: 'total',
      header: 'Total Gastado',
      cell: ({ row }) => {
        const { totalGastado } = getSocioMetrics(row.original.id);
        return <span className="font-mono font-medium text-brand">${totalGastado.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha Registro',
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
           <button 
            onClick={() => setSelectedSocio(row.original)}
            className="p-2 hover:bg-background-tertiary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setEditingSocio(row.original);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Socios</h1>
          <p className="text-text-secondary">Administra tu base de clientes</p>
        </div>
        <button 
          onClick={() => {
            setEditingSocio(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Socio
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable 
                columns={columns} 
                data={socios} 
                searchColumn="nombre"
                searchPlaceholder="Buscar por nombre..."
              />
            </div>

            <div className="md:hidden space-y-4">
              {socios.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <p>No hay socios registrados.</p>
                </div>
              ) : (
                socios.map(socio => (
                  <SocioMobileCard
                    key={socio.id}
                    socio={socio}
                    metrics={getSocioMetrics(socio.id)}
                    onView={(s) => setSelectedSocio(s)}
                    onEdit={(s) => {
                      setEditingSocio(s);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 p-0">
          <div className="bg-background-secondary w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl relative flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingSocio ? 'Editar Socio' : 'Nuevo Socio'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-2 -mr-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nombre Completo</label>
                <input 
                  {...register('nombre', { required: true })}
                  className="input-field"
                  placeholder="Ej: Juan Perez"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Teléfono</label>
                <input 
                  {...register('telefono')}
                  className="input-field"
                  placeholder="+54 9 11..."
                />
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

      {selectedSocio && (
        <SocioDetailsModal 
          socio={selectedSocio} 
          onClose={() => setSelectedSocio(null)} 
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSocioToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="¿Eliminar socio?"
        description="Esta acción eliminará al socio y todos sus pedidos asociados. No se puede deshacer."
      />
    </div>
  );
};
