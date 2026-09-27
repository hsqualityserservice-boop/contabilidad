"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  ClipboardList,
  Clock3,
  Euro,
  House,
  Menu,
  PackageCheck,
  Sparkles,
  Users,
} from "lucide-react";

const productRates = { apartamento: 0.5, local: 0.8, vitrina: 1, cabinet: 1.5, debarras: 1.2 };

const spaceTypes = [
  { value: "apartamento", label: "Apartamento", icon: House, multiplier: 1 },
  { value: "local", label: "Local comercial", icon: ClipboardList, multiplier: 1.2 },
  { value: "vitrina", label: "Vitrinas", icon: PackageCheck, multiplier: 1.3 },
  { value: "cabinet", label: "Cabinet sanitario", icon: Sparkles, multiplier: 1.5 },
  { value: "debarras", label: "Desbarras", icon: PackageCheck, multiplier: 1.8 },
] as const;

export default function Home() {
  const [type, setType] = useState("cabinet");
  const [squareMeters, setSquareMeters] = useState(80);
  const [windows, setWindows] = useState(2);
  const [complexity, setComplexity] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const estimate = useMemo(() => {
    const selected = spaceTypes.find((item) => item.value === type) ?? spaceTypes[0];
    const m2 = squareMeters + windows * 3;
    const productRate = productRates[type as keyof typeof productRates];
    const hours = Math.ceil((m2 / 20) * (selected.multiplier + (complexity ? 0.3 : 0)) * 10) / 10;
    const people = hours > 12 ? 3 : hours > 5 ? 2 : 1;
    const labor = hours * 25;
    const products = m2 * productRate;
    return { m2, hours, people, perPerson: Math.ceil((hours / people) * 10) / 10, labor, products, total: labor + products };
  }, [type, squareMeters, windows, complexity]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles size={18} /></div><div><p className="font-semibold tracking-tight">HS servicios</p><p className="text-xs text-muted-foreground">Presupuestos inteligentes</p></div></div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"><a className="text-foreground" href="#calculadora">Nueva estimación</a><a href="#resumen">Historial</a><a href="#resumen">Configuración</a></nav>
          <button className="rounded-lg border border-border p-2 text-muted-foreground md:hidden" aria-label="Abrir menú"><Menu size={18} /></button>
          <div className="hidden items-center gap-3 md:flex"><span className="size-2 rounded-full bg-primary" /><span className="text-sm text-muted-foreground">Operativo</span><div className="ml-2 flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">HS</div></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Nueva estimación</p><h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">Convierte una visita en un presupuesto claro.</h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Describe el espacio, ajusta las condiciones y obtén una propuesta lista para compartir con tu cliente.</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={15} /></div> Cálculo actualizado en tiempo real</div></div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" id="calculadora">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="mb-7 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Calculator size={19} /></div><div><h2 className="font-semibold">Datos del servicio</h2><p className="text-sm text-muted-foreground">Cuéntanos qué necesitas cubrir.</p></div></div>
            <div className="space-y-7"><div><label className="mb-3 block text-sm font-medium">Tipo de espacio</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{spaceTypes.map((item) => { const Icon = item.icon; return <button key={item.value} onClick={() => setType(item.value)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${type === item.value ? "border-primary bg-secondary font-medium text-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}><Icon size={16} />{item.label}</button> })}</div></div>
              <div className="grid gap-5 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium" htmlFor="m2">Metros cuadrados</label><div className="relative"><input id="m2" type="number" min="1" value={squareMeters} onChange={(e) => setSquareMeters(Number(e.target.value))} className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /><span className="absolute right-4 top-3.5 text-sm text-muted-foreground">m²</span></div></div><div><label className="mb-2 block text-sm font-medium" htmlFor="windows">Vitrinas o cristales</label><div className="relative"><input id="windows" type="number" min="0" value={windows} onChange={(e) => setWindows(Number(e.target.value))} className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-16 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /><span className="absolute right-4 top-3.5 text-sm text-muted-foreground">unid.</span></div></div></div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4"><input type="checkbox" checked={complexity} onChange={(e) => setComplexity(e.target.checked)} className="mt-0.5 size-4 accent-primary" /><span><span className="block text-sm font-medium">Complejidad extra</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Fin de obra, inundación o suciedad extrema.</span></span></label>
              <button onClick={() => setSubmitted(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90">{submitted ? "Estimación actualizada" : "Calcular presupuesto"}<ArrowRight size={17} /></button>
            </div>
          </section>

          <section className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm sm:p-7" id="resumen"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-primary-foreground/70">Presupuesto estimado</p><p className="mt-2 text-5xl font-semibold tracking-[-0.05em]">{estimate.total.toFixed(2).replace(".", ",")} €</p></div><div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/10"><Euro size={21} /></div></div><div className="my-7 h-px bg-primary-foreground/15" /><div className="space-y-4"><div className="flex items-center justify-between text-sm"><span className="text-primary-foreground/70">Superficie calculada</span><strong>{estimate.m2} m²</strong></div><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-primary-foreground/70"><Clock3 size={15} />Horas de trabajo</span><strong>{estimate.hours} h</strong></div><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-primary-foreground/70"><Users size={15} />Equipo recomendado</span><strong>{estimate.people} {estimate.people === 1 ? "persona" : "personas"}</strong></div><div className="flex items-center justify-between text-sm"><span className="text-primary-foreground/70">Tiempo por persona</span><strong>{estimate.perPerson} h</strong></div></div><div className="my-7 h-px bg-primary-foreground/15" /><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-primary-foreground/70">Mano de obra</span><span>{estimate.labor.toFixed(2).replace(".", ",")} €</span></div><div className="flex justify-between"><span className="text-primary-foreground/70">Productos y materiales</span><span>{estimate.products.toFixed(2).replace(".", ",")} €</span></div></div><button className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground font-semibold text-primary transition hover:opacity-90">Guardar presupuesto <ArrowRight size={16} /></button><p className="mt-4 text-center text-xs text-primary-foreground/60">Este cálculo es orientativo y puede variar tras la visita.</p></section>
        </div>
      </div>
    </main>
  );
}

