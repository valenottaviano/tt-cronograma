'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order, getOrders, updateOrderStatus, deleteOrder } from '@/lib/firebase/orders';
import { formatPrice } from '@/components/navbar';
import { Check, X, Clock, ExternalLink, ImageIcon, User, Search, Filter, Calendar, ListFilter, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Pedido marcado como ${status === 'verified' ? 'verificado' : 'rechazado'}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el estado');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
    try {
      await deleteOrder(id);
      toast.success('Pedido eliminado correctamente');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el pedido');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      
      // 2. Search Filter (Customer Name or Product Name)
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        order.customerFirstName.toLowerCase().includes(search) || 
        order.customerLastName.toLowerCase().includes(search) || 
        order.productName.toLowerCase().includes(search);
      if (searchQuery && !matchesSearch) return false;

      // 3. Date Filter
      if (dateRange.start) {
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        if (order.createdAt < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (order.createdAt > end) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <div>
        <h1 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter">Pedidos Recibidos</h1>
        <p className="text-white/40 font-medium tracking-widest uppercase text-[10px] md:text-xs mt-1">Gestión de compras y verificación de comprobantes</p>
      </div>

      {/* Filters Section */}
      <div className="bg-neutral-900 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-neutral-700 shadow-2xl space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Search */}
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input 
              type="text"
              placeholder="Buscar por cliente o producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all font-medium text-sm"
            />
          </div>

          {/* Status Select */}
          <div className="w-full md:w-auto md:min-w-[200px] relative">
            <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-12 pr-10 py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none text-sm font-bold uppercase tracking-widest"
            >
              <option value="all" className="bg-gray-900">TODOS</option>
              <option value="pending" className="bg-gray-900 uppercase">PENDIENTES</option>
              <option value="verified" className="bg-gray-900 uppercase">VERIFICADOS</option>
              <option value="rejected" className="bg-gray-900 uppercase">RECHAZADOS</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-8 items-start sm:items-center border-t border-white/5 pt-4 md:pt-6">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/40">
            <Calendar className="w-4 h-4 text-orange-500" />
            Desde:
            <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-bold text-sm"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/40">
            Hasta:
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-orange-500/50 font-bold text-sm"
            />
          </div>
          
          {(searchQuery || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateRange({ start: '', end: '' });
              }}
              className="text-[10px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-[0.2em] sm:ml-auto decoration-2 underline-offset-4 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-neutral-900 rounded-2xl md:rounded-3xl border border-neutral-700 border-dashed p-10 md:p-20 text-center">
          <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No hay pedidos que coincidan</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="group bg-neutral-900 rounded-2xl md:rounded-3xl border border-neutral-700 overflow-hidden shadow-xl hover:bg-neutral-800 transition-all duration-300"
            >
              <div className="p-4 md:p-8 space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-8 md:justify-between md:items-center">
                {/* Customer Info */}
                <div className="flex gap-4 md:gap-6 items-center">
                  <div className="p-3 md:p-4 bg-brand-orange rounded-xl md:rounded-2xl text-white shadow-lg shadow-brand-orange/20">
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-black text-lg md:text-2xl text-white italic uppercase tracking-tighter leading-none truncate">
                      {order.customerFirstName} {order.customerLastName}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <Clock className="w-3 h-3 text-orange-500" />
                      {order.createdAt.toLocaleString('es-AR')}
                    </div>
                  </div>
                  {/* Status Badge - Mobile */}
                  <div className={cn(
                    "md:hidden px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap",
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    order.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                    'bg-red-500/20 text-red-500'
                  )}>
                    {order.status === 'pending' ? 'Pendiente' : order.status === 'verified' ? 'Verificado' : 'Rechazado'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 md:min-w-[200px] md:border-l md:border-white/5 md:pl-8 space-y-1 md:space-y-2 border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">PRODUCTO COMPRADO</p>
                  <p className="font-black text-base md:text-xl text-white italic tracking-tight">{order.productName}</p>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-black text-white">Talle {order.size}</span>
                    <span className="text-brand-orange font-black italic tracking-tighter">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 md:space-y-4 md:min-w-[240px] border-t border-white/5 pt-4 md:border-t-0 md:pt-0">
                  <div className="flex items-center justify-between gap-3 md:gap-4">
                    <a 
                      href={order.receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-white"
                    >
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      Comprobante
                      <ExternalLink className="w-3 h-3 text-white/20" />
                    </a>
                    
                    {/* Status Badge - Desktop */}
                    <div className={cn(
                      "hidden md:block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    )}>
                      {order.status === 'pending' ? 'Pendiente' : order.status === 'verified' ? 'Verificado' : 'Rechazado'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {order.customerPhone ? (
                      <a 
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${order.customerFirstName}! Te escribo de TT por tu compra de: ${order.productName} (Talle ${order.size})`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Avisar por WhatsApp
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-white/5 text-white/20 py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest border border-dashed border-white/10">
                        Sin contacto
                      </div>
                    )}

                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'verified')}
                          className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-orange-500 hover:text-white py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
                        >
                          <Check className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    )}
                    {order.status !== 'pending' && (
                       <button 
                         onClick={() => handleDeleteOrder(order.id)}
                         className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-600/10 text-white/20 hover:text-red-500 border border-dashed border-white/10 hover:border-red-500/20 py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                         Eliminar Registro
                       </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

