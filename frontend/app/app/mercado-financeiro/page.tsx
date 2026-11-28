"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAppData } from "@/lib/app-data";
import type { Category } from "@/lib/types";
import { LevelCards } from "@/components/learning-track-list";
import { ProgressBar } from "@/components/progress";
import { Spinner } from "@/components/ui";

export default function MercadoFinanceiroPage() {
  const { progress } = useAppData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<Category[]>("/api/v1/content/categories")
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar o módulo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const financial = useMemo(() => categories.filter((category) => category.slug !== "cripto"), [categories]);
  const totalLessons = financial.reduce(
    (sum, category) => sum + category.modules.reduce((moduleSum, module) => moduleSum + module.lessonCount, 0),
    0,
  );
  const financialProgress = financial.length
    ? Math.round(
        financial.reduce((sum, category) => {
          const item = progress?.categories.find((entry) => entry.slug === category.slug);
          return sum + (item?.percent ?? 0);
        }, 0) / financial.length,
      )
    : 0;
  const next = progress?.nextLesson;

  if (loading) return <Spinner label="Abrindo o módulo" />;

  if (error) {
    return <div className="card p-6 text-sm text-red-200">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <header data-reveal-auto="up" className="border-b border-white/[0.07] pb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Módulo 01</p>
        <h1 className="mt-3 text-[30px] font-medium tracking-[-0.04em] text-neutral-100 sm:text-[36px]">Mercado financeiro</h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-neutral-400">
          Do dinheiro e da inflação até renda fixa, ações, ETFs e risco. Uma trilha progressiva para
          entender o sistema — não para seguir dicas.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[10px] text-neutral-500">
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-accent" /> {financial.length} trilhas · {totalLessons} aulas</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> risco explicado</span>
          </div>
          {next ? (
            <Link href={`/app/aprender/aula/${next.slug}`} className="btn-primary text-[11px]">
              Continuar: {next.title} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link href="/app/aprender/modulo/primeiros-passos" className="btn-primary text-[11px]">
              Começar pelo básico <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <div className="mt-6 max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-neutral-500">
            <span>progresso do módulo</span>
            <span className="text-accent">{financialProgress}%</span>
          </div>
          <ProgressBar value={financialProgress} />
        </div>
      </header>

      <section className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-neutral-100">Trilhas em ordem</h2>
          <span className="text-[10px] text-neutral-500">do zero ao contexto</span>
        </div>
        <LevelCards categories={financial} progress={progress} />
      </section>

      <p className="mt-6 text-[10px] leading-5 text-neutral-600">
        Conteúdo educativo. Não é recomendação de investimento. A ordem é uma sugestão didática;
        você pode revisitar qualquer aula.
      </p>
    </div>
  );
}
