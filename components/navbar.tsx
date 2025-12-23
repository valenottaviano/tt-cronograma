"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InfiniteBanner } from "@/components/infinite-banner";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFlyer, setShowFlyer] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Dialog open={showFlyer} onOpenChange={setShowFlyer}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-3xl w-full">
          <DialogTitle className="sr-only">Carrera TT Flyer</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="https://i.ibb.co/wN0gRVs9/Whats-App-Image-2025-12-22-at-11-44-05.jpg"
              alt="Carrera TT"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>

      {isHome && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <InfiniteBanner onClick={() => setShowFlyer(true)} />
        </div>
      )}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed flex flex-row-reverse items-center left-4 right-4 z-50 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl transition-all duration-300",
          isHome ? "top-16" : "top-4"
        )}
      >
        <Link href="/">
          <img
            src="https://www.carreratt.com.ar/logo-tt.png"
            alt="Logo TT"
            className="md:hidden h-8 w-auto mr-10"
          />
        </Link>
        <div className="container mx-auto py-4 flex h-14 items-center px-6">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <img
                src="https://www.carreratt.com.ar/logo-tt.png"
                alt="Logo TT"
                className="h-8 w-auto"
              />
              <span className="hidden font-bold sm:inline-block">
                Beneficios TT
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <button
                onClick={() => setShowFlyer(true)}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Carrera TT
              </button>
              <Link
                href="/races"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Carreras
              </Link>
              <Link
                href="/benefits"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Beneficios
              </Link>
            </nav>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src="https://www.carreratt.com.ar/logo-tt.png"
                  alt="Logo TT"
                  className="h-8 w-auto ml-10 my-5"
                />
                <span className="font-bold">Beneficios TT</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowFlyer(true);
                    }}
                    className="text-left"
                  >
                    Carrera TT
                  </button>
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    Inicio
                  </Link>
                  <Link href="/races" onClick={() => setIsOpen(false)}>
                    Carreras
                  </Link>
                  <Link href="/benefits" onClick={() => setIsOpen(false)}>
                    Beneficios
                  </Link>
                  {/* Add more mobile links here */}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search or other controls could go here */}
            </div>
            <nav className="flex items-center">
              <button
                className="md:hidden transition-colors hover:text-foreground/80 text-foreground/90"
                onClick={() => setShowFlyer(true)}
              >
                Carrera TT
              </button>
            </nav>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
