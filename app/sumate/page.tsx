import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinFlow } from "@/components/join-flow";

export const metadata: Metadata = {
  title: "Sumate al Training Team",
  description:
    "Conocé cómo entrenamos y mandá tu solicitud para sumarte al grupo. Roberto se contacta con vos.",
};

export default function SumatePage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-background to-background" />

      <div className="container mx-auto max-w-3xl px-4 relative z-10">
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 group">
            <Link href="/">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <JoinFlow />
      </div>
    </div>
  );
}
