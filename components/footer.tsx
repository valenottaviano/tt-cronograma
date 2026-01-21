import Link from "next/link";
import { Instagram, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-neutral-700 bg-neutral-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="https://www.carreratt.com.ar/logo-tt.png"
                alt="TT Training Team Logo"
                className="h-12 w-auto"
              />
              {/* <span className="font-bold text-xl text-white tracking-tight">
                Cronograma TT
              </span> */}
            </div>
            <p className="text-white/60 text-sm max-w-xs">
              El calendario más completo de carreras de running y trail en
              Argentina. Planificá tu próxima meta con nosotros.
            </p>
          </div>

          {/* Quick Links (Optional, can be empty or navigation) */}
          <div className="flex flex-col items-center space-y-2">
            {/* Placeholder for future links */}
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <h3 className="font-semibold text-white">Contacto</h3>
            <div className="flex flex-col space-y-3">
              <a
                href="https://www.instagram.com/grupo_de_entrenamiento.tt/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Instagram className="w-5 h-5" />
                </div>
                <span>@grupo_de_entrenamiento.tt</span>
              </a>

              <a
                href="https://wa.me/5493815261138"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors group"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span>+54 9 381 526-1138</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-white/40 text-sm space-y-2">
          <p>
            &copy; {new Date().getFullYear()} TT Training Team. Todos los
            derechos reservados.
          </p>
          <p className="text-xs">
            Programado con ❤️ por{" "}
            <a 
              href="https://wa.me/5493816003467" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Valen
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
