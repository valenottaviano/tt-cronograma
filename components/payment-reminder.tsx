"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Banknote, Check, CircleAlert, CreditCard, DollarSign, Loader2, Paperclip, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/coachApi";

interface Plan {
  id: string;
  label: string;
  amount: number;
}

const PLANS: Plan[] = [
  { id: "trail", label: "Trail", amount: 44000 },
  { id: "running", label: "Running", amount: 33000 },
  { id: "distancia", label: "A distancia (otras provincias)", amount: 33000 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  year: number;
  month: number;
  monthLabel: string;
  paid?: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function PaymentReminder({ year, month, monthLabel, paid = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("TRANSFER");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [monthKey, setMonthKey] = useState(`${year}-${month}`);
  // null = todavía no cargó; Set vacío = cargó sin pagos
  const [paidKeys, setPaidKeys] = useState<Set<string> | null>(null);

  const plan = PLANS.find((p) => p.id === planId) ?? null;

  // Mes anterior, actual y siguiente (izquierda, centro, derecha).
  const months = useMemo(() => {
    const base = new Date(year, month - 1, 1);
    return [-1, 0, 1].map((offset) => {
      const d = addMonths(base, offset);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return {
        key: `${y}-${m}`,
        year: y,
        month: m,
        label: cap(format(d, "MMMM yyyy", { locale: es })),
        monthName: cap(format(d, "MMMM", { locale: es })),
      };
    });
  }, [year, month]);

  const selectedMonth = months.find((m) => m.key === monthKey) ?? months[1];

  // Al abrir, traemos el historial para marcar los meses ya notificados.
  useEffect(() => {
    if (!open || paidKeys) return;
    fetch("/api/client/payments")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const set = new Set<string>(
          (j.data ?? []).map(
            (p: { year: number; month: number }) => `${p.year}-${p.month}`
          )
        );
        setPaidKeys(set);
      })
      .catch(() => setPaidKeys(new Set()));
  }, [open, paidKeys]);

  async function uploadReceipt(f: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", f, f.name);
    const res = await fetch("/api/client/payments/upload-receipt", {
      method: "POST",
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "No se pudo subir el comprobante");
    return json.data.key as string;
  }

  async function handleSubmit() {
    if (!plan) {
      toast.error("Elegí tu plan");
      return;
    }
    setSubmitting(true);
    try {
      let receiptKey: string | undefined;
      if (method === "TRANSFER" && file) {
        receiptKey = await uploadReceipt(file);
      }

      const res = await fetch("/api/client/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedMonth.year,
          month: selectedMonth.month,
          amount: plan.amount,
          method,
          note: plan.label,
          receiptKey,
        }),
      });

      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (res.status === 409) {
        toast.info(`Ya habías notificado el pago de ${selectedMonth.label}`);
        setPaidKeys((prev) => new Set(prev).add(selectedMonth.key));
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Error al notificar el pago");

      toast.success(`Pago de ${selectedMonth.label} notificado. ¡Gracias!`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al notificar el pago");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && setOpen(v)}>
      <DialogTrigger asChild>
        {paid ? (
          <button
            type="button"
            aria-label={`Cuota de ${monthLabel} al día — notificar otro mes`}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-border bg-neutral-900 text-muted-foreground hover:bg-neutral-800 hover:text-white transition-colors shrink-0"
          >
            <DollarSign className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Pagar cuota de ${monthLabel}`}
            className="relative flex items-center justify-center h-9 w-9 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0"
          >
            <CircleAlert className="w-4 h-4 shrink-0" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="border-red-600/30">
        <DialogHeader>
          <DialogTitle className="text-white">Notificar pago</DialogTitle>
          <DialogDescription>
            Elegí el mes y notificá tu pago para mantener tu plan al día.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Mes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white">Mes</label>
            <div className="grid grid-cols-3 gap-2">
              {months.map((m) => {
                const paid = paidKeys?.has(m.key) ?? false;
                const selected = m.key === monthKey;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => !paid && setMonthKey(m.key)}
                    disabled={paid}
                    aria-pressed={selected}
                    className={`relative flex flex-col items-center justify-center gap-0.5 h-14 rounded-lg border text-center transition-colors ${
                      paid
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default"
                        : selected
                          ? "border-red-600/50 bg-red-600/10 text-white"
                          : "border-border bg-neutral-900 text-muted-foreground hover:bg-neutral-800"
                    }`}
                  >
                    {paid && (
                      <Check className="absolute top-1 right-1 w-3.5 h-3.5" />
                    )}
                    <span className="text-sm font-medium leading-none">
                      {m.monthName}
                    </span>
                    <span className="text-[10px] leading-none opacity-70">
                      {m.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white">Plan</label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí tu plan" />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label} — {fmt(p.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Método */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white">Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("TRANSFER")}
                className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm transition-colors ${
                  method === "TRANSFER"
                    ? "border-red-600/50 bg-red-600/10 text-white"
                    : "border-border bg-neutral-900 text-muted-foreground hover:bg-neutral-800"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Transferencia
              </button>
              <button
                type="button"
                onClick={() => setMethod("CASH")}
                className={`flex items-center justify-center gap-2 h-10 rounded-lg border text-sm transition-colors ${
                  method === "CASH"
                    ? "border-red-600/50 bg-red-600/10 text-white"
                    : "border-border bg-neutral-900 text-muted-foreground hover:bg-neutral-800"
                }`}
              >
                <Banknote className="w-4 h-4" /> Efectivo
              </button>
            </div>
          </div>

          {/* Comprobante (solo transferencia) */}
          {method === "TRANSFER" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">
                Comprobante{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              {file ? (
                <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-neutral-900 text-sm">
                  <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-white">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 h-10 px-3 rounded-lg border border-dashed border-border bg-neutral-900 text-sm text-muted-foreground hover:bg-neutral-800 cursor-pointer transition-colors">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  Adjuntar foto o PDF
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
          )}

          {plan && (
            <div className="flex items-center justify-between rounded-lg border border-red-600/30 bg-red-600/5 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total a notificar</span>
              <span className="text-lg font-semibold text-white">
                {fmt(plan.amount)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
            className="text-muted-foreground"
          >
            Ahora no
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !plan || (paidKeys?.has(selectedMonth.key) ?? false)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Notificar pago"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
