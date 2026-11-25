"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, Search, Sparkles } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import type { Category, SearchResults } from "@/lib/types";
import { LevelCards } from "@/components/learning-track-list";
import { ModuleSpotlight } from "@/components/module-lessons";
import { ProgressBar } from "@/components/progress";
import { PageHeader } from "@/components/page";
import { Spinner } from "@/components/ui";

function AprenderContent() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { progress, loading: appLoading } = useAppData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [term, setTerm] = useState(query);

  useEffect(() => {
    let active = true;
    api
      .get<Category[]>("/api/v1/content/categories")
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar o mapa.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setTerm(query);
    if (query.trim().length < 2) {
      setSearch(null);
      setSearching(false);
      return;
    }
    let active = true;
    setSearching(true);
    api
      .get<SearchResults>(`/api/v1/content/search?q=${encodeURIComponent(query.trim())}`)
      .then((result) => {
        if (active) setSearch(result);
      })
      .catch(() => {
        if (active) setSearch({ lessons: [], articles: [] });
      })
      .finally(() => {
        if (active) setSearching(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const financial = useMemo(() => categories.filter((category) => category.slug !== "cripto"), [categories]);
  const bitcoin = useMemo(() => categories.filter((category) => category.slug === "cripto"), [categories]);

  if (loading) return <Spinner label="Carregando mapa" />;
  if (error) return <div className="card p-6 text-sm text-red-200">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Sua jornada"
        title="Mapa de aprendizado"
        description="Avance etapa por etapa. Cada conceito prepara o próximo — sem pressa e sem atalhos."
        actions={
          progress?.nextLesson ? (
            <Link href={`/app/aprender/aula/${progress.nextLesson.slug}`} className="btn-primary text-[11px]">
              Continuar: {progress.nextLesson.title} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      />

      <form
        className="mb-5 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111111] px-3 py-2 text-[12px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (term.trim().length >= 2) {
            window.location.href = `/app/aprender?q=${encodeURIComponent(term.trim())}`;
          }
        }}
        role="search"
      >
        <Search className="h-4 w-4 text-neutral-500" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar aulas, termos e cripto…"
          className="w-full bg-transparent text-neutral-200 outline-none placeholder:text-neutral-600"
          aria-label="Buscar conteúdo"
        />
        <button type="submit" className="btn-secondary px-3 py-1.5 text-[10px]">Buscar</button>
      </form>

      {searching && <Spinner label="Buscando" />}

      {search && !searching && (
        <section className="mb-5 space-y-2">
          <h2 className="text-[11px] font-semibold text-neutral-400">
            Resultados para “{query}” — {search.lessons.length + search.articles.length}
          </h2>
          {search.lessons.map((lesson) => (
            <Link key={lesson.id} href={`/app/aprender/aula/${lesson.slug}`} className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#111111] px-3 py-2.5">
              <span className="flex items-center gap-2 text-[12px] text-neutral-200"><BookOpen className="h-3.5 w-3.5 text-accent" /> {lesson.title}</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
            </Link>
          ))}
          {search.articles.map((article) => (
            <Link key={article.id} href={`/app/biblioteca/${article.slug}`} className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#111111] px-3 py-2.5">
              <span className="flex items-center gap-2 text-[12px] text-neutral-200"><Sparkles className="h-3.5 w-3.5 text-accent" /> {article.title}</span>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
            </Link>
          ))}
          {search.lessons.length + search.articles.length === 0 && (
            <p className="rounded-lg border border-white/[0.07] bg-[#111111] px-3 py-3 text-[11px] text-neutral-500">Nenhum resultado.</p>
          )}
        </section>
      )}

      <section className="mb-5 rounded-xl border border-white/[0.07] bg-[#111111] p-4">
        <div className="flex items-center justify-between text-[10px] text-neutral-500">
          <span>progresso geral</span>
          <span className="text-accent">{progress?.percent ?? 0}%</span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-[20px] font-medium text-neutral-100">{progress?.completedLessons ?? 0} de {progress?.totalLessons ?? 0}</p>
            <p className="text-[10px] text-neutral-500">aulas concluídas</p>
          </div>
          <div className="w-full max-w-[260px]">
            <ProgressBar value={appLoading ? 0 : progress?.percent ?? 0} />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[13px] font-semibold text-neutral-100">Mercado financeiro</h2>
        <ModuleSpotlight />
        <LevelCards categories={financial} progress={progress} />
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-[13px] font-semibold text-neutral-100">Bitcoin</h2>
        <LevelCards categories={bitcoin} progress={progress} />
      </section>
    </div>
  );
}

export default function AprenderPage() {
  return (
    <Suspense fallback={<Spinner label="Carregando mapa" />}>
      <AprenderContent />
    </Suspense>
  );
}
