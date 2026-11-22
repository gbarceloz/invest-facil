"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Calculator,
  Loader2,
  PiggyBank,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import { money, percent } from "@/lib/format";
import type { SavedScenario, ScenarioInput, ScenarioResult } from "@/lib/types";
import { PageHeader, Stat } from "@/components/page";
import { Alert, Disclaimer } from "@/components/ui";

const PRESETS = [
  { label: "Conservador", rate: 6 },
  { label: "Moderado", rate: 8 },
  { label: "Arrojado", rate: 12 },
];

const DEFAULT_FORM: ScenarioInput = {
  initialAmount: 1000,
  monthlyContribution: 200,
  months: 120,
  annualRate: 8,
  inflationRate: 4,
};

function toPayload(form: ScenarioInput, annualRate = form.annualRate): ScenarioInput {
  return {
    initialAmount: Number(form.initialAmount) || 0,
    monthlyContribution: Number(form.monthlyContribution) || 0,
    months: Math.round(Number(form.months)) || 1,
    annualRate: Number(annualRate) || 0,
    inflationRate: Number(form.inflationRate) || 0,
  };
}

export default function SimulatorPage() {
  const { reload } = useAppData();
  const [form, setForm] = useState<ScenarioInput>(DEFAULT_FORM);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [calculatedInput, setCalculatedInput] = useState<ScenarioInput | null>(null);
  const [comparison, setComparison] = useState<ScenarioResult[]>([]);
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [name, setName] = useState("Meu plano de longo prazo");
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SavedScenario[]>("/api/v1/simulator/scenarios")
      .then(setSaved)
      .catch(() => undefined);
  }, []);

  const chartData = useMemo(() => {
    if (!result) return [];
    const step = Math.max(1, Math.ceil(result.series.length / 60));
    return result.series
      .filter((_, index) => index % step === 0 || index === result.series.length - 1)
      .map((point) => ({
        month: point.month,
        label: point.month === 0 ? "Hoje" : `${Math.floor(point.month / 12)}a ${point.month % 12}m`,
        patrimônio: Number(point.balance),
        investido: Number(point.contributed),
        "poder de compra": Number(point.realBalance),
      }));
  }, [result]);

  function invalidateResult() {
    setResult(null);
    setComparison([]);
    setCalculatedInput(null);
  }

  function update(field: keyof ScenarioInput, value: string) {
    setForm((current) => ({ ...current, [field]: Number(value) }));
    invalidateResult();
  }

  async function calculate() {
    setError(null);
    setToast(null);
    setCalculating(true);
    try {
      const payload = toPayload(form);
      const [main, ...others] = await Promise.all([
        api.post<ScenarioResult>("/api/v1/simulator/calculate", payload),
        ...PRESETS.map((preset) =>
          api.post<ScenarioResult>("/api/v1/simulator/calculate", toPayload(form, preset.rate)),
        ),
      ]);
      setResult(main);
      setCalculatedInput(payload);
      setComparison(others);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível calcular a simulação.");
    } finally {
      setCalculating(false);
    }
  }

  async function save() {
    if (!result) return;
    setError(null);
    setToast(null);
    setSaving(true);
    try {
      const created = await api.post<SavedScenario>("/api/v1/simulator/scenarios", {
        name: name.trim() || "Minha simulação",
        scenario: calculatedInput ?? toPayload(form),
      });
      setSaved((current) => [created, ...current]);
      setToast("Simulação salva. +30 XP na primeira vez.");
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a simulação.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete<void>(`/api/v1/simulator/scenarios/${id}`);
      setSaved((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover a simulação.");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Prática segura"
        title="Simulador financeiro"
        description="Teste capital inicial, aportes, prazo e uma taxa hipotética. Compare cenários e veja a evolução do patrimônio — com dinheiro fictício."
      />

      <div className="mb-5 rounded-2xl border border-accent/25 bg-accent/5 p-4 text-xs leading-6 text-neutral-300">
        <strong className="text-accent">Aviso:</strong> as simulações usam taxas hipotéticas e não
        representam garantia, promessa ou projeção de retorno. Rentabilidade passada não garante
        resultados futuros. A plataforma não executa ordens.
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}
      {toast && (
        <Alert tone="success" className="mb-4">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> {toast}
          </span>
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="card h-fit p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-bold">Parâmetros</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="initial" className="label">
                Capital inicial
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">R$</span>
                <input
                  id="initial"
                  type="number"
                  min={0}
                  step={100}
                  className="input pl-9"
                  value={form.initialAmount}
                  onChange={(event) => update("initialAmount", event.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="monthly" className="label">
                Aporte mensal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">R$</span>
                <input
                  id="monthly"
                  type="number"
                  min={0}
                  step={50}
                  className="input pl-9"
                  value={form.monthlyContribution}
                  onChange={(event) => update("monthlyContribution", event.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="months" className="label">
                  Prazo (meses)
                </label>
                <input
                  id="months"
                  type="number"
                  min={1}
                  max={600}
                  className="input"
                  value={form.months}
                  onChange={(event) => update("months", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="rate" className="label">
                  Taxa (% a.a.)
                </label>
                <input
                  id="rate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  className="input"
                  value={form.annualRate}
                  onChange={(event) => update("annualRate", event.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="inflation" className="label">
                Inflação hipotética (% a.a.)
              </label>
              <input
                id="inflation"
                type="number"
                min={0}
                max={100}
                step={0.5}
                className="input"
                value={form.inflationRate}
                onChange={(event) => update("inflationRate", event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, annualRate: preset.rate }));
                    invalidateResult();
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                    form.annualRate === preset.rate
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-ink-500 text-muted hover:border-accent/30 hover:text-neutral-100"
                  }`}
                >
                  {preset.label} · {preset.rate}%
                </button>
              ))}
            </div>

            <button type="button" onClick={calculate} className="btn-primary w-full" disabled={calculating}>
              {calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Calcular cenários
            </button>
            <p className="text-[10px] leading-4 text-neutral-400">
              O cálculo usa juros compostos com taxa mensal equivalente e aportes ao fim de cada mês.
            </p>
          </div>
        </section>

        <section className="min-w-0 space-y-5">
          {!result && (
            <div className="card grid min-h-[340px] place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                  <PiggyBank className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-bold">Monte seu primeiro cenário</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  Preencha os parâmetros e clique em calcular. Você verá o total investido, os juros
                  hipotéticos, o efeito da inflação e a evolução mês a mês.
                </p>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Patrimônio final" value={money(result.finalAmount)} hint="valor nominal" icon={<Wallet className="h-4 w-4" />} tone="accent" />
                <Stat label="Total investido" value={money(result.investedAmount)} hint="aportes + capital inicial" icon={<PiggyBank className="h-4 w-4" />} />
                <Stat label="Juros hipotéticos" value={money(result.interestAmount)} hint="diferença para o investido" icon={<TrendingUp className="h-4 w-4" />} />
                <Stat label="Poder de compra" value={money(result.realFinalAmount)} hint={`inflação ${percent(calculatedInput?.inflationRate ?? form.inflationRate)} a.a.`} icon={<Calculator className="h-4 w-4" />} />
              </div>

              <div className="card p-4 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold">Evolução do patrimônio</h2>
                  <span className="text-[10px] text-muted">Taxa mensal equivalente: {percent(result.monthlyRate, 4)}</span>
                </div>
                <div className="mt-4 h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="invested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a3a3a3" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#a3a3a3" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#a3a3a3", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
                      <YAxis tick={{ fill: "#a3a3a3", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(Number(value) / 1000).toFixed(0)}k`} width={58} />
                      <Tooltip
                        contentStyle={{ background: "#111111", border: "1px solid #2b2b2b", borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: "#a3a3a3" }}
                        formatter={(value) => money(Number(value ?? 0))}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
                      <Area type="monotone" dataKey="patrimônio" stroke="#facc15" strokeWidth={2} fill="url(#balance)" />
                      <Area type="monotone" dataKey="investido" stroke="#a3a3a3" strokeWidth={1.5} fill="url(#invested)" />
                      <Area type="monotone" dataKey="poder de compra" stroke="#d4d4d4" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="border-b border-ink-500/60 px-5 py-4">
                  <h2 className="text-sm font-bold">Comparação de cenários</h2>
                  <p className="mt-1 text-[11px] text-muted">Mesmos aportes e prazo, taxas anuais diferentes.</p>
                </div>
                <div className="grid gap-0 sm:grid-cols-3">
                  {comparison.map((scenario, index) => (
                    <div key={PRESETS[index].label} className="border-b border-ink-500/50 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        {PRESETS[index].label} · {PRESETS[index].rate}% a.a.
                      </p>
                      <p className="mt-2 text-lg font-extrabold">{money(scenario.finalAmount)}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        Juros: <span className="text-accent">{money(scenario.interestAmount)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="scenario-name" className="label">
                    Nome da simulação
                  </label>
                  <input
                    id="scenario-name"
                    className="input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={120}
                  />
                </div>
                <button type="button" onClick={save} className="btn-primary text-xs" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar cenário
                </button>
              </div>
            </>
          )}

          {saved.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink-500/60 px-5 py-4">
                <h2 className="text-sm font-bold">Cenários salvos</h2>
                <span className="text-[11px] text-muted">{saved.length}</span>
              </div>
              <div className="divide-y divide-ink-500/50">
                {saved.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-[11px] text-muted">
                        {money(item.finalAmount)} · {item.scenario.months} meses · {percent(item.scenario.annualRate)} a.a.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-neutral-500 transition hover:bg-red-500/10 hover:text-red-300"
                      aria-label={`Remover ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && calculatedInput && (
            <p className="text-[10px] text-neutral-400">
              Resultado calculado com os parâmetros acima. Alterar qualquer campo limpa o
              resultado até um novo cálculo — evitando salvar um cenário diferente do exibido.
            </p>
          )}
          <Disclaimer text={result?.disclaimer} />
        </section>
      </div>
    </div>
  );
}
