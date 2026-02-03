'use client';

import { useState } from 'react';
import { AdminGuard } from '@/components/auth/admin-guard';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Home, Package, ShoppingCart, Users, Settings, Calendar, LogOut, ExternalLink, Download, Smartphone, MapPin } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { toast } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isOpen, setIsOpen] = useState(false);
  const { isInstallable, isIOS, isStandalone, handleInstallClick } = usePWAInstall();

  const showInstallButton = isInstallable || (isIOS && !isStandalone);

  const handleAdminInstall = () => {
    if (isIOS && !isStandalone) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      toast.info("Instalar TT Admin", {
        description: isSafari 
          ? "Toca el botón 'Compartir' y luego 'Agregar a inicio'." 
          : "Abre este enlace en Safari para instalar.",
        duration: 10000,
        icon: <Smartphone className="h-5 w-5" />,
      });
    } else if (isInstallable) {
      handleInstallClick();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Inicio', icon: Home },
    { href: '/admin/products', label: 'Productos', icon: Package, matchPrefix: true },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
    { href: '/admin/races', label: 'Carreras', icon: Calendar, matchPrefix: true },
    { href: '/admin/benefits', label: 'Beneficios', icon: Settings, matchPrefix: true },
    { href: '/admin/tracks', label: 'Tracks GPX', icon: MapPin, matchPrefix: true },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.matchPrefix) {
      return pathname === item.href || pathname?.startsWith(item.href + '/');
    }
    return pathname === item.href;
  };

  // If it's the login page, just render the children without the guard and header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <div className="flex items-center gap-4 md:gap-12">
                {/* Mobile Menu Button */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <button className="md:hidden p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      <Menu className="w-6 h-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] bg-neutral-950 border-neutral-700 p-0">
                    <div className="flex flex-col h-full">
                      {/* Mobile Header */}
                      <div className="p-4 border-b border-neutral-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-black italic text-white transform -skew-x-12">TT</div>
                          <span className="text-lg font-black uppercase italic tracking-tighter text-white">Admin</span>
                        </div>
                      </div>

                      {/* User Info Mobile */}
                      <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Administrador</p>
                        <p className="text-sm font-bold text-white italic truncate">{user?.email}</p>
                      </div>

                      {/* Nav Links */}
                      <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                              isActive(item)
                                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                          </a>
                        ))}
                        
                        <a
                          href="https://docs.google.com/spreadsheets/d/1YVrTgtR4mY_4BudZa50kgU1UxMgC9JKwwqimJyIVRek/edit?usp=sharing"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Users className="w-5 h-5" />
                          Credenciales
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </a>
                      </nav>

                      {/* Install Button Mobile */}
                      {showInstallButton && (
                        <div className="p-4 border-t border-neutral-800">
                          <button
                            onClick={() => { setIsOpen(false); handleAdminInstall(); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 rounded-xl transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Instalar App
                          </button>
                        </div>
                      )}

                      {/* Logout Button Mobile */}
                      <div className="p-4 border-t border-neutral-800">
                        <button
                          onClick={() => { setIsOpen(false); handleLogout(); }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50 rounded-xl transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-black italic text-white transform -skew-x-12">TT</div>
                  <h1 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white">
                    Admin
                  </h1>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        isActive(item)
                          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
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

              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Administrador</span>
                  <span className="text-xs font-bold text-white italic">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:block px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-red-500 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 rounded-xl transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
