import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Menu, 
  X, 
} from 'lucide-react';
import { useAuthStore } from '../services/authStore';
import { cn } from '../lib/utils';
import { NotificationsMenu } from '../components/notifications/NotificationsMenu';
import { QuickOrderModal } from '../components/orders/QuickOrderModal';
import { QuickOrderButton } from '../components/orders/QuickOrderButton';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pedidos', icon: ShoppingBag, label: 'Pedidos' },
    { path: '/socios', icon: Users, label: 'Socios' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-background text-text-primary flex">
      <QuickOrderModal />
      <QuickOrderButton />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background-secondary border-r border-border transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">Gestión<span className="text-brand">Litoral</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-background-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-brand/10 text-brand font-semibold shadow-sm border border-brand/20" 
                  : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", location.pathname === item.path ? "text-brand" : "group-hover:text-text-primary")} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center border border-border">
              <span className="font-bold text-xs text-brand">{user?.email?.[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-text-secondary">Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-status-danger hover:bg-status-danger/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <QuickOrderButton variant="header" />
            <NotificationsMenu />
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
