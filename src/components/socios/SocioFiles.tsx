import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, Image, Trash2, Loader2, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { SocioArchivo } from '../../types';
import { toast } from 'react-hot-toast';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';

interface SocioFilesProps {
  socioId: string;
}

export const SocioFiles: React.FC<SocioFilesProps> = ({ socioId }) => {
  const [files, setFiles] = useState<SocioArchivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<SocioArchivo | null>(null);

  const fetchFiles = async () => {
    try {
      const data = await api.files.getBySocioId(socioId);
      setFiles(data as SocioArchivo[]);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [socioId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      await api.files.upload(file, socioId);
      toast.success('Archivo subido correctamente');
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = (file: SocioArchivo) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await api.files.delete(fileToDelete.id, fileToDelete.url);
      toast.success('Archivo eliminado');
      setFiles(files.filter(f => f.id !== fileToDelete.id));
    } catch (error) {
      toast.error('Error al eliminar archivo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text-primary">Archivos adjuntos</h3>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept="image/*,application/pdf"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`btn-secondary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Subir Archivo</span>
          </label>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-text-secondary">No hay archivos adjuntos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-start p-3 bg-background-tertiary rounded-lg group">
              <div className="p-2 bg-background-secondary rounded-lg mr-3">
                {isImage(file.tipo) ? (
                  <Image className="w-6 h-6 text-brand" />
                ) : (
                  <FileText className="w-6 h-6 text-text-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" title={file.nombre}>{file.nombre}</p>
                <p className="text-xs text-text-secondary">{formatFileSize(file.peso)}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 text-text-secondary hover:text-brand hover:bg-background-secondary rounded-md transition-colors"
                  title="Ver archivo"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(file)}
                  className="p-1.5 text-text-secondary hover:text-status-danger hover:bg-background-secondary rounded-md transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="¿Eliminar archivo?"
        description="Esta acción eliminará el archivo permanentemente. No se puede deshacer."
      />
    </div>
  );
};
