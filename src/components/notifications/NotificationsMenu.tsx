import React, { useRef, useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotificationsStore } from '../../services/notificationsStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribe } = useNotificationsStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = subscribe();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.leida) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.pedido_id) {
      // Navigate to orders with filter? For now just go to orders
      navigate('/pedidos');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-secondary hover:text-brand transition-colors relative rounded-full hover:bg-background-tertiary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_rgba(34,255,136,0.6)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-background-secondary border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-background-tertiary/50">
            <h3 className="font-semibold text-text-primary">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 hover:bg-background-tertiary transition-colors cursor-pointer relative group",
                      !notification.leida && "bg-brand/5 hover:bg-brand/10"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        notification.tipo === 'success' && "bg-status-success",
                        notification.tipo === 'warning' && "bg-status-warning",
                        notification.tipo === 'error' && "bg-status-danger",
                        notification.tipo === 'info' && "bg-status-info",
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", !notification.leida ? "text-text-primary" : "text-text-secondary")}>
                          {notification.titulo}
                        </p>
                        <p className="text-xs text-text-secondary mt-1 truncate">
                          {notification.descripcion}
                        </p>
                        <p className="text-[10px] text-text-secondary/50 mt-2">
                          {format(new Date(notification.created_at), 'dd MMM HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
