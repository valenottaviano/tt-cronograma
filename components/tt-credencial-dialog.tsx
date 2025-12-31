"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, User, Hash, CheckCircle2, AlertCircle, QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getPersonByDni, type Person } from "@/lib/credential";
import QRCode from "react-qr-code";

export function TTCCredencialDialog() {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    // Check for saved DNI on mount
    const savedDni = localStorage.getItem("tt_dni");
    if (savedDni) {
      setDni(savedDni);
    }
  }, []);

  // Auto-validate when dialog opens if we have a DNI and no person yet
  useEffect(() => {
    if (isOpen && dni && !person && !error && !loading) {
      handleSearch(new Event("submit") as any);
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!dni.trim()) return;

    setLoading(true);
    setError(null);
    setPerson(null);

    try {
      const found = await getPersonByDni(dni.trim());

      if (!found) {
        setError("No se encontró ninguna persona con ese DNI.");
        localStorage.removeItem("tt_dni");
      } else if (found.estado.toLowerCase() !== "activo") {
        setError("La credencial para este DNI no se encuentra activa.");
        localStorage.removeItem("tt_dni");
      } else {
        setPerson(found);
        localStorage.setItem("tt_dni", dni.trim());
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Ocurrió un error al consultar los datos. Por favor reintenta luego.");
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const [isQrExpanded, setIsQrExpanded] = useState(false);

  const handleReset = () => {
    setPerson(null);
    setDni("");
    localStorage.removeItem("tt_dni");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset local UI state but keep saved DNI for next time
        setPerson(null);
        setError(null);
        setIsQrExpanded(false);
        // Reload DNI from storage if it wasn't cleared by handleReset
        const saved = localStorage.getItem("tt_dni");
        if (saved) setDni(saved);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md px-8 py-6 rounded-full text-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Credencial TT
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0 shadow-2xl rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50 pointer-events-none" />
        
        <div className="relative p-5 sm:p-6">
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Credencial Digital TT
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!person ? (
              <motion.div
                key="search-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="dni" className="text-sm font-medium text-zinc-400 ml-1">
                      Número de DNI
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="dni"
                        placeholder="Ej: 12345678"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        disabled={loading}
                        className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-zinc-700 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !dni}
                    className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-colors font-bold disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Consultar"
                    )}
                  </Button>
                </form>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-200 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="credential-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 flex flex-col items-center pb-4"
              >
                {/* Credential Card UI */}
                <div className="relative w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[200px] sm:aspect-[1.6/1]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#ffffff10,transparent)] pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex justify-between items-start z-10 mb-4 sm:mb-0">
                    <img 
                      src="https://www.carreratt.com.ar/logo-tt.png" 
                      alt="TT Logo" 
                      className="h-8 sm:h-10 opacity-90"
                    />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" />
                      Activo
                    </div>
                  </div>

                  <div className="flex justify-between items-end z-10 gap-2">
                    <div className="space-y-3 sm:space-y-4 min-w-0 flex-1">
                      <div>
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5 sm:mb-1">Nombre y Apellido</p>
                        <p className="text-lg sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate">
                          {person.nombre} {person.apellido}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5 sm:mb-1">DNI</p>
                        <p className="text-base sm:text-xl font-mono text-zinc-300">
                          {person.dni}
                        </p>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div 
                      onClick={() => setIsQrExpanded(!isQrExpanded)}
                      className="bg-white p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer group relative overflow-hidden shrink-0"
                    >
                      <QRCode
                        size={Math.min(60, 80)} // Dynamic size fallback but keeping it readable
                        value={`${baseUrl}/card/${person.dni}`}
                        viewBox={`0 0 256 256`}
                        style={{ height: "auto", maxWidth: "60px", width: "100%" }}
                        className="sm:!max-w-[80px]"
                      />
                    </div>

                    <AnimatePresence>
                      {isQrExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsQrExpanded(false)}
                          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
                        >
                          <motion.div
                            initial={{ scale: 0.5, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 20 }}
                            className="bg-white p-8 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <QRCode
                              size={280}
                              value={`${baseUrl}/card/${person.dni}`}
                              viewBox={`0 0 256 256`}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            />
                            <div className="mt-6 text-center text-black font-semibold uppercase tracking-widest text-sm">
                              Escanear Credencial
                            </div>
                            <Button 
                              variant="ghost" 
                              className="absolute top-4 right-4 text-black hover:bg-black/5 rounded-full h-8 w-8 p-0"
                              onClick={() => setIsQrExpanded(false)}
                            >
                              ✕
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 text-xs py-1">
                  <QrIcon className="h-3 w-3" />
                  <span>Escaneá para validar</span>
                </div>

                <Button 
                  onClick={handleReset}
                  variant="ghost" 
                  className="w-full text-zinc-500 hover:text-white hover:bg-zinc-900"
                >
                  Consultar otro DNI
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
