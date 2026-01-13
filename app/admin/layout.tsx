'use client';

import { AdminGuard } from '@/components/auth/admin-guard';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // If it's the login page, just render the children without the guard and header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-black italic text-white transform -skew-x-12">TT</div>
                  <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    Admin Panel
                  </h1>
                </div>
                <nav className="hidden md:flex items-center gap-2">
                  <a
                    href="/admin"
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      pathname === '/admin'
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    )}
                  >
                    Inicio
                  </a>
                  <a
                    href="/admin/products"
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      pathname === '/admin/products' || pathname?.startsWith('/admin/products/')
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    )}
                  >
                    Productos
                  </a>
                  <a
                    href="/admin/orders"
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      pathname === '/admin/orders'
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    )}
                  >
                    Pedidos
                  </a>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1YVrTgtR4mY_4BudZa50kgU1UxMgC9JKwwqimJyIVRek/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white/40 hover:text-white hover:bg-white/5"
                  >
                   Credenciales 
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Administrador</span>
                  <span className="text-xs font-bold text-white italic">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-red-500 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-xl transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
