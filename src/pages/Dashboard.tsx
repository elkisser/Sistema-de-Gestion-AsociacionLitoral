import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Loader2,
  Plus,
  Clock,
  Truck,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { api } from '../services/api';
import { Pedido } from '../types';
import { subMonths, eachDayOfInterval, isSameDay, format, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../services/uiStore';
import { useNotificationsStore } from '../services/notificationsStore';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const navigate = useNavigate();
  const { openQuickOrder } = useUIStore();
  const { notifications, fetchNotifications, subscribe } = useNotificationsStore();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.pedidos.getAll();
        setPedidos(data);
        await fetchNotifications();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const unsubscribe = subscribe();
    return () => unsubscribe && unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  // Calculate Metrics
  const totalIngresos = pedidos.reduce((acc, p) => acc + p.precio_total, 0);
  const totalPedidos = pedidos.length;
  const uniqueSocios = new Set(pedidos.map(p => p.socio_id)).size;
  const promedioTicket = totalPedidos > 0 ? totalIngresos / totalPedidos : 0;

  // Counts for Quick Actions
  const pendientesHoy = pedidos.filter(p => 
    p.estado_pedido === 'pendiente' && 
    isSameDay(new Date(p.created_at), new Date())
  ).length;
  
  const enReparto = pedidos.filter(p => p.estado_pedido === 'en_reparto').length;
  const pagosPendientes = pedidos.filter(p => p.estado_pago === 'pendiente').length;

  // Chart Data: Ingresos por día (últimos 30 días)
  const today = new Date();
  const last30Days = eachDayOfInterval({
    start: subMonths(today, 1),
    end: today
  });

  const revenueData = last30Days.map(date => {
    const dayPedidos = pedidos.filter(p => isSameDay(new Date(p.created_at), date));
    return {
      date: format(date, 'dd MMM', { locale: es }),
      total: dayPedidos.reduce((acc, p) => acc + p.precio_total, 0),
      count: dayPedidos.length
    };
  });

  // Chart Data: Top Variedades
  const variedadesMap = pedidos.reduce((acc, p) => {
    acc[p.variedad] = (acc[p.variedad] || 0) + p.cantidad;
    return acc;
  }, {} as Record<string, number>);

  const variedadesData = Object.entries(variedadesMap)
    .map(([name, value], index) => ({ 
      name, 
      value,
      color: index === 0 ? '#22FF88' : '#3ABEFF' // Add explicit color for tooltip
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Chart Data: Estado Pedidos
  const estadoMap = pedidos.reduce((acc, p) => {
    acc[p.estado_pedido] = (acc[p.estado_pedido] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const estadoData = [
    { name: 'Entregado', value: estadoMap['entregado'] || 0, color: '#22FF88' },
    { name: 'En Reparto', value: estadoMap['en_reparto'] || 0, color: '#3ABEFF' },
    { name: 'Pendiente', value: estadoMap['pendiente'] || 0, color: '#FFC857' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Determine color from payload (Bar/Pie) or default to brand color (Area)
      const color = payload[0].payload.color || payload[0].fill || payload[0].color || '#22FF88';
      
      return (
        <div className="bg-background-secondary border border-border p-3 rounded-xl shadow-xl">
          <p className="font-medium text-text-primary mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color }}>
            {payload[0].name === 'total' && '$'}
            {payload[0].value.toLocaleString()}
            {payload[0].name !== 'total' && payload[0].name !== 'count' && ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const QuickActionCard = ({ 
    title, 
    count, 
    icon: Icon, 
    onClick, 
    colorClass 
  }: { 
    title: string; 
    count?: number; 
    icon: any; 
    onClick: () => void; 
    colorClass: string 
  }) => (
    <button 
      onClick={onClick}
      className="card flex flex-col items-center justify-center p-6 hover:bg-background-tertiary transition-all hover:scale-[1.02] active:scale-95 group text-center h-full w-full"
    >
      <div className={cn("p-4 rounded-full mb-3 transition-colors", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{title}</span>
      {count !== undefined && (
        <span className="text-2xl font-bold mt-1">{count}</span>
      )}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-secondary">Visión general operativa</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard 
          title="Nuevo Pedido" 
          icon={Plus} 
          onClick={openQuickOrder} 
          colorClass="bg-brand/10 text-brand group-hover:bg-brand/20" 
        />
        <QuickActionCard 
          title="Pendientes Hoy" 
          count={pendientesHoy} 
          icon={Clock} 
          onClick={() => navigate('/pedidos?estado=pendiente')} 
          colorClass="bg-status-warning/10 text-status-warning group-hover:bg-status-warning/20" 
        />
        <QuickActionCard 
          title="En Reparto" 
          count={enReparto} 
          icon={Truck} 
          onClick={() => navigate('/pedidos?estado=en_reparto')} 
          colorClass="bg-status-info/10 text-status-info group-hover:bg-status-info/20" 
        />
        <QuickActionCard 
          title="Pagos Pendientes" 
          count={pagosPendientes} 
          icon={DollarSign} 
          onClick={() => navigate('/pedidos?pago=pendiente')} 
          colorClass="bg-status-danger/10 text-status-danger group-hover:bg-status-danger/20" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ingresos Totales"
          value={`$${totalIngresos.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, label: 'vs mes anterior', isPositive: true }}
        />
        <StatsCard
          title="Pedidos Totales"
          value={totalPedidos}
          icon={ShoppingBag}
          color="blue"
          trend={{ value: 5, label: 'vs mes anterior', isPositive: true }}
        />
        <StatsCard
          title="Socios Activos"
          value={uniqueSocios}
          icon={Users}
          color="purple"
          trend={{ value: 2, label: 'vs mes anterior', isPositive: true }}
        />
        <StatsCard
          title="Ticket Promedio"
          value={`$${Math.round(promedioTicket).toLocaleString()}`}
          icon={TrendingUp}
          color="orange"
          trend={{ value: 1, label: 'vs mes anterior', isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card h-[400px]">
          <h3 className="text-lg font-bold mb-6">Ingresos (30 días)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22FF88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22FF88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#22FF88" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Varieties Chart */}
        <div className="card h-[400px]">
          <h3 className="text-lg font-bold mb-6">Top Variedades (Gramos)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variedadesData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#E5E7EB" 
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: '#1F2937', opacity: 0.4 }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="value" fill="#22FF88" radius={[0, 4, 4, 0]} barSize={30}>
                {variedadesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#22FF88' : '#3ABEFF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <div className="card h-[350px]">
          <h3 className="text-lg font-bold mb-4">Estado de Pedidos</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ bottom: 40 }}>
              <Pie
                data={estadoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {estadoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-[-40px]">
            {estadoData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-text-secondary">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

         {/* Recent Activity */}
         <div className="card h-[350px] lg:col-span-2 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand" />
              Actividad Reciente
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center text-text-secondary py-8 flex flex-col items-center">
                  <Bell className="w-8 h-8 opacity-20 mb-2" />
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                notifications.slice(0, 8).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-background-tertiary/20 rounded-xl hover:bg-background-tertiary/40 transition-colors border border-border/50">
                    <div className={cn(
                      "mt-1 w-2 h-2 rounded-full shrink-0",
                      notification.tipo === 'success' && "bg-status-success",
                      notification.tipo === 'warning' && "bg-status-warning",
                      notification.tipo === 'error' && "bg-status-danger",
                      notification.tipo === 'info' && "bg-status-info",
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-text-primary">{notification.titulo}</p>
                        <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">
                          {format(new Date(notification.created_at), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{notification.descripcion}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
