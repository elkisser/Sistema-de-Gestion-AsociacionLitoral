import React from 'react';
import { Plus } from 'lucide-react';
import { useUIStore } from '../../services/uiStore';
import { cn } from '../../lib/utils';

interface QuickOrderButtonProps {
  className?: string;
  variant?: 'floating' | 'header';
}

export const QuickOrderButton = ({ className, variant = 'floating' }: QuickOrderButtonProps) => {
  const { openQuickOrder } = useUIStore();

  if (variant === 'header') {
    return (
      <button 
        onClick={openQuickOrder}
        className={cn(
          "hidden md:flex items-center gap-2 bg-brand text-black px-4 py-2 rounded-xl font-semibold hover:bg-brand-hover transition-all shadow-lg shadow-brand/20 active:scale-95",
          className
        )}
      >
        <Plus className="w-5 h-5" />
        Nuevo Pedido
      </button>
    );
  }

  return (
    <button 
      onClick={openQuickOrder}
      className={cn(
        "fixed bottom-6 right-6 md:hidden z-40 w-14 h-14 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-transform hover:scale-110 active:scale-90",
        className
      )}
    >
      <Plus className="w-8 h-8" />
    </button>
  );
};
