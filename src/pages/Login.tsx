import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../services/authStore';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await initialize();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand/20">
            <ShoppingBag className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido</h1>
          <p className="text-text-secondary">Ingresa tus credenciales para acceder</p>
        </div>

        <div className="card backdrop-blur-sm bg-background-secondary/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-xs text-text-secondary">
          Sistema de Gestión Asociación Litoral &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
