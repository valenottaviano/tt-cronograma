"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle, Send, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FORM_STEPS, ALL_FIELDS, visibleFields, isFieldVisible, type FormField,
} from "@/lib/join-form";
import {
  JOIN_EMOJI, JOIN_HEADLINE, JOIN_INTRO, JOIN_BENEFITS_TITLE, JOIN_SECTIONS, JOIN_CTA,
} from "@/lib/join-info";

type Stage = "info" | "form" | "confirm" | "done";

/** El input date entrega "YYYY-MM-DD"; en la revisión se lee mejor dd/mm/aaaa. */
function displayValue(field: FormField, raw: string): string {
  if (field.type !== "date") return raw;
  const [y, m, d] = raw.split("-");
  return y && m && d ? `${d}/${m}/${y}` : raw;
}

export function JoinFlow() {
  const [stage, setStage] = useState<Stage>("info");
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const step = FORM_STEPS[stepIndex];
  const fields = useMemo(() => visibleFields(step, values), [step, values]);

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: "" } : prev));
  }

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const value = (values[f.id] ?? "").trim();
      if (f.required && !value) {
        next[f.id] = "Este campo es obligatorio";
        continue;
      }
      if (!value) continue;
      if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[f.id] = "Revisá el email";
      }
      if (f.id === "dni" && !/^\d{6,10}$/.test(value.replace(/\D/g, ""))) {
        next[f.id] = "El DNI tiene que ser de 6 a 10 números";
      }
      if (f.type === "tel" && value.replace(/\D/g, "").length < 8) {
        next[f.id] = "Revisá el número";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (!validateStep()) return;
    if (stepIndex < FORM_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("confirm");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function prevStep() {
    if (stepIndex === 0) {
      setStage("info");
    } else {
      setStepIndex((i) => i - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(json.error ?? "No pudimos enviar tu solicitud.");
        return;
      }
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Animación de entrada solamente, sin AnimatePresence, a propósito: con
    // `mode="wait"` la etapa nueva no monta hasta que termina la salida de la
    // anterior, y el navegador congela requestAnimationFrame (y con él a
    // framer-motion) cuando la pestaña pasa a segundo plano. En una PWA eso
    // deja el cambio de paso trabado hasta que la persona vuelve.
    // La `key` fuerza el remount en cada etapa para que el fade se repita.
    <motion.div
      key={stage}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {stage === "info" && (
        <div className="space-y-12">
          <header className="text-center">
            <div className="text-5xl mb-4" aria-hidden="true">{JOIN_EMOJI}</div>
            <h1 className="text-4xl md:text-5xl font-bold italic uppercase tracking-tight text-white mb-6">
              {JOIN_HEADLINE}
            </h1>
            <div className="space-y-4 max-w-2xl mx-auto text-left sm:text-center">
              {JOIN_INTRO.map((p) => (
                <p key={p} className="text-white/60 text-lg leading-relaxed">{p}</p>
              ))}
            </div>
          </header>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold italic uppercase tracking-tight text-white text-center mb-8">
              {JOIN_BENEFITS_TITLE}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {JOIN_SECTIONS.map((section, i) => (
                <article
                  key={section.title}
                  className={cn(
                    "glass-panel rounded-2xl p-6",
                    // El cierre emocional ocupa el ancho completo en vez de
                    // quedar como huérfano en la última fila impar.
                    i === JOIN_SECTIONS.length - 1 && "sm:col-span-2"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl" aria-hidden="true">{section.icon}</span>
                    <span className="text-xs font-bold text-brand-orange tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 italic uppercase tracking-tight">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.body.map((p) => (
                      <p key={p} className="text-white/60 leading-relaxed">{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6 md:p-8 text-center">
            <div className="text-4xl mb-3" aria-hidden="true">{JOIN_CTA.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-bold italic uppercase tracking-tight text-white mb-4">
              {JOIN_CTA.title}
            </h2>
            <div className="space-y-3 max-w-2xl mx-auto mb-8 text-left sm:text-center">
              {JOIN_CTA.body.map((p) => (
                <p key={p} className="text-white/70 leading-relaxed">{p}</p>
              ))}
            </div>
            <Button
              onClick={() => { setStage("form"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="bg-brand-orange hover:bg-brand-orange/80 text-white px-8 h-12 rounded-xl text-base"
            >
              Quiero sumarme
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </section>
        </div>
      )}

      {stage === "form" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-white/40">
                Paso {stepIndex + 1} de {FORM_STEPS.length}
              </span>
              <span className="text-xs text-white/40">{step.description}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-brand-orange"
                initial={false}
                animate={{ width: `${((stepIndex + 1) / FORM_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 italic uppercase tracking-tight">
              {step.title}
            </h2>
            <div className="space-y-5">
              {fields.map((field) => (
                <FieldInput
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ""}
                  error={errors[field.id]}
                  onChange={(v) => setValue(field.id, v)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={prevStep} className="text-white/60 hover:text-white hover:bg-white/5">
              <ArrowLeft className="mr-2 w-4 h-4" />
              {stepIndex === 0 ? "Volver a la info" : "Atrás"}
            </Button>
            <Button onClick={nextStep} className="bg-brand-orange hover:bg-brand-orange/80 text-white px-6 h-11 rounded-xl">
              {stepIndex === FORM_STEPS.length - 1 ? "Revisar" : "Siguiente"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {stage === "confirm" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold italic uppercase tracking-tight text-white mb-3">
              Revisá y confirmá
            </h1>
            <p className="text-white/60">
              Si después de leer todo seguís queriendo entrar al grupo, mandanos tu solicitud.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <dl className="space-y-4">
              {ALL_FIELDS.filter((f) => isFieldVisible(f, values) && (values[f.id] ?? "").trim()).map((f) => (
                <div key={f.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-widest text-white/40">{f.label}</dt>
                  <dd className="text-white mt-1 whitespace-pre-wrap">{displayValue(f, values[f.id])}</dd>
                </div>
              ))}
            </dl>
            <Button
              variant="ghost"
              onClick={() => { setStage("form"); setStepIndex(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="mt-6 text-white/60 hover:text-white hover:bg-white/5"
            >
              <Pencil className="mr-2 w-4 h-4" /> Corregir algo
            </Button>
          </div>

          {submitError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => { setStage("form"); setStepIndex(FORM_STEPS.length - 1); }}
              disabled={submitting}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Atrás
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              className="bg-brand-orange hover:bg-brand-orange/80 text-white px-6 h-11 rounded-xl"
            >
              {submitting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Send className="mr-2 w-4 h-4" />}
              Confirmar y enviar
            </Button>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 italic uppercase tracking-tight">
            ¡Listo, {values.firstName || "crack"}!
          </h2>
          <p className="text-white/70 text-lg mb-2">
            Tu solicitud ya le llegó a Roberto.
          </p>
          <p className="text-white/50 mb-8">
            Se va a contactar con vos por WhatsApp al {values.phone} para coordinar los próximos pasos.
          </p>
          <Button asChild className="bg-brand-orange hover:bg-brand-orange/80 text-white px-8 h-12 rounded-xl">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

interface FieldInputProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

function FieldInput({ field, value, error, onChange }: FieldInputProps) {
  const describedBy = error ? `${field.id}-error` : field.hint ? `${field.id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-white/80">
        {field.label}
        {field.required && <span className="text-brand-orange ml-1">*</span>}
      </Label>

      {field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            id={field.id}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn("glass-input w-full text-white", error && "border-red-500/60")}
          >
            <SelectValue placeholder="Elegí una opción" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={field.id}
          value={value}
          rows={3}
          placeholder={field.placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={cn("glass-input text-white resize-none", error && "border-red-500/60")}
        />
      ) : (
        <Input
          id={field.id}
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          inputMode={field.type === "tel" ? "tel" : field.id === "dni" ? "numeric" : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className={cn("glass-input text-white", error && "border-red-500/60")}
        />
      )}

      {error ? (
        <p id={`${field.id}-error`} className="text-xs text-red-400">{error}</p>
      ) : field.hint ? (
        <p id={`${field.id}-hint`} className="text-xs text-white/40">{field.hint}</p>
      ) : null}
    </div>
  );
}
