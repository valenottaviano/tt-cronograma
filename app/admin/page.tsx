'use client';

import { useAuth } from '@/hooks/use-auth';
import { Users, Calendar, Settings, Bell, Package, ShoppingCart } from "lucide-react";
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Package className="w-32 h-32 text-brand-orange" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Bienvenido, <span className="text-brand-orange">{user?.email?.split('@')[0]}</span>
          </h2>
          <p className="text-white/40 font-medium tracking-widest uppercase text-xs">
            Panel de control administrativo • TT Cronograma
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Products Card */}
        <Link
          href="/admin/products"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/20 transition-colors" />
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-brand-orange rounded-2xl text-white shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform duration-500">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Productos</h3>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Gestiona el catálogo oficial, talles disponibles y niveles de stock de la tienda.
          </p>
          <div className="mt-8 flex items-center text-brand-orange text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Gestionar productos →
          </div>
        </Link>

        {/* Manage Orders Card */}
        <Link
          href="/admin/orders"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-green-600/5 rounded-full blur-2xl group-hover:bg-green-600/20 transition-colors" />

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform duration-500">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pedidos</h3>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Verifica transferencias, revisa comprobantes y gestiona el estado de las compras.
          </p>
          <div className="mt-8 flex items-center text-green-500 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Ver pedidos →
          </div>
        </Link>

        {/* Manage Races Card */}
        <Link
          href="/admin/races"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Carreras</h3>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Cronograma de competencias, distancias, ubicaciones y códigos de descuento.
          </p>
          <div className="mt-8 flex items-center text-blue-500 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Gestionar carreras →
          </div>
        </Link>

        {/* Manage Benefits Card */}
        <Link
          href="/admin/benefits"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-brand-orange/50 transition-all duration-500 hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl group-hover:bg-brand-orange/20 transition-colors" />

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-brand-orange rounded-2xl text-white shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform duration-500">
              <Settings className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Beneficios</h3>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Administra los descuentos y beneficios exclusivos para los miembros del equipo.
          </p>
          <div className="mt-8 flex items-center text-brand-orange text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Gestionar beneficios →
          </div>
        </Link>

        {/* Cronograma Card */}
        <a
          href="https://docs.google.com/spreadsheets/d/1YVrTgtR4mY_4BudZa50kgU1UxMgC9JKwwqimJyIVRek/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cronograma</h3>
          </div>
          <p className="text-white/40 text-sm font-medium leading-relaxed">
            Acceso directo a la planilla de Google Sheets para gestionar el cronograma general.
          </p>
          <div className="mt-8 flex items-center text-green-500 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Abrir planilla →
          </div>
        </a>
      </div>
    </div>
  );
}
