import { getPersonByDni } from "@/lib/credential";
import { CheckCircle2, XCircle, ShieldCheck, MapPin, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ dni: string }>;
}

export default async function ValidationPage({ params }: PageProps) {
  const { dni } = await params;
  const person = await getPersonByDni(dni);
  const isActive = person?.estado.toLowerCase() === "activo";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" /> 
      </div>

      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        {/* Header decoration */}
        {/* <div className={`absolute top-0 left-0 w-full h-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} /> */}
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex justify-center mb-2">
            <img 
              src="https://www.carreratt.com.ar/logo-tt.png" 
              alt="TT Logo" 
              className="h-16 max-w-[200px] mt-20"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Validación de Credencial</h1>
            <p className="text-zinc-500 text-sm">Sistema oficial de acreditación TT Training Team</p>
          </div>

          {person ? (
            <div className="w-full space-y-8 py-4">
              <div className={`p-6 rounded-3xl border ${isActive ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} flex flex-col items-center gap-3 transition-all animate-in fade-in zoom-in duration-500`}>
                {isActive ? (
                  <>
                    <div className="bg-green-500/20 p-3 rounded-full">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <span className="text-xl font-bold uppercase tracking-widest">Activo / Válido</span>
                  </>
                ) : (
                  <>
                    <div className="bg-red-500/20 p-3 rounded-full">
                      <XCircle className="h-10 w-10" />
                    </div>
                    <span className="text-xl font-bold uppercase tracking-widest">Inactivo / Expirado</span>
                  </>
                )}
              </div>

              <div className="space-y-4 text-left bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-zinc-500 text-sm">Socio</span>
                  <span className="font-semibold">{person.nombre} {person.apellido}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <span className="text-zinc-500 text-sm">Documento</span>
                  <span className="font-mono font-medium">{person.dni}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Estado</span>
                  <span className={`flex items-center gap-1.5 font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {person.estado}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <p className="text-xs text-zinc-600 italic">
                  Esta información es pública y oficial. Prohibida su reproducción ilegal.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 space-y-4">
              <div className="bg-zinc-900 p-4 rounded-full inline-block">
                <XCircle className="h-12 w-12 text-zinc-700" />
              </div>
              <p className="text-zinc-400">No se encontró registro para el DNI {dni}</p>
            </div>
          )}

          <Button asChild variant="ghost" className="text-zinc-500 hover:text-white mt-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>

      <footer className="mt-12 text-zinc-700 text-[10px] uppercase tracking-widest text-center space-y-2">
        <p>&copy; {new Date().getFullYear()} TT Training Team - Digital ID Services</p>
        <p className="normal-case tracking-normal text-zinc-800">
          Programado con ❤️ por{" "}
          <a 
            href="https://wa.me/5493816003467" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-zinc-600 transition-colors underline underline-offset-4"
          >
            Valen
          </a>
        </p>
      </footer>
    </div>
  );
}
