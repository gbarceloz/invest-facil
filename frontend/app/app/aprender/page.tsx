"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import type { Category, SearchResults } from "@/lib/types";
import { ProgressBar } from "@/components/progress";
import { Badge, PageHeader } from "@/components/page";
import { Spinner } from "@/components/ui";

function AprenderContent() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { progress, loading: appLoading } = useAppData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [search, setSearch] = useState<SearchResults | null>(null);
  const [term, setTerm] = useState(query);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api
      .get<Category[]>("/api/v1/content/categories")
      .then(setCategories)
      .catch((err) =>
        setCategoryError(err instanceof Error ? err.message : "Não foi possível carregar as trilhas."),
      )
      .finally(() => setLoading(false));
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

  const progressByCategory = new Map((progress?.categories ?? []).map((item) => [item.slug, item]));
  const next = progress?.nextLesson;

  if (loading) return <Spinner label="Carregando trilhas" />;

  if (categoryError) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-300">{categoryError}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-secondary mt-5">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sua jornada"
        title="Mapa de aprendizado"
        description="Avance etapa por etapa. Cada conceito prepara você para o próximo — sem pressa e sem atalhos."
        actions={
          next ? (
            <Link href={`/app/aprender/aula/${next.slug}`} className="btn-primary text-xs">
              Continuar: {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      <form
        className="mb-6 flex items-center gap-2 rounded-xl border border-ink-500/80 bg-ink-800/70 px-3 py-2.5 text-sm"
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
          placeholder="Buscar uma aula, termo ou artigo…"
          className="w-full bg-transparent text-neutral-200 outline-none placeholder:text-neutral-600"
          aria-label="Buscar conteúdo"
        />
        <button type="submit" className="btn-primary px-3 py-1.5 text-[11px]">
          Buscar
        </button>
      </form>

      {searching && <Spinner label="Buscando" />}

      {search && !searching && (
        <section className="mb-8 space-y-3">
          <h2 className="text-sm font-bold text-muted">
            Resultados para “{query}” — {search.lessons.length + search.articles.length}
          </h2>
          {search.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/app/aprender/aula/${lesson.slug}`}
              className="card card-hover flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-bold">{lesson.title}</p>
                  <p className="text-[11px] text-muted">Aula · {lesson.estimatedMin} min</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            </Link>
          ))}
          {search.articles.map((article) => (
            <Link
              key={article.id}
              href={`/app/biblioteca/${article.slug}`}
              className="card card-hover flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-bold">{article.title}</p>
                  <p className="text-[11px] text-muted">Artigo · {article.readingMinutes} min de leitura</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            </Link>
          ))}
          {search.lessons.length + search.articles.length === 0 && (
            <p className="rounded-xl border border-ink-500/60 bg-ink-800/60 p-4 text-sm text-muted">
              Nenhum resultado. Tente outro termo.
            </p>
          )}
        </section>
      )}

      <section className="card mb-8 overflow-hidden">
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Progresso geral</p>
            <p className="mt-1 text-2xl font-extrabold">{appLoading ? "—" : `${progress?.percent ?? 0}%`}</p>
            <ProgressBar value={progress?.percent ?? 0} className="mt-2" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Aulas concluídas</p>
            <p className="mt-1 text-2xl font-extrabold">
              {appLoading ? "—" : (progress?.completedLessons ?? 0)}
              <span className="text-sm font-semibold text-muted">
                {" "}/ {appLoading ? "—" : (progress?.totalLessons ?? 0)}
              </span>
            </p>
            <p className="mt-2 text-[11px] text-muted">Continue de onde parou</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Próxima missão</p>
            <p className="mt-1 line-clamp-2 text-sm font-bold">
              {appLoading
                ? "Carregando seu progresso…"
                : next?.title ?? "Todas as aulas concluídas"}
            </p>
            {next && !appLoading && (
              <Link href={`/app/aprender/aula/${next.slug}`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                Abrir aula <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const categoryProgress = progressByCategory.get(category.slug);
          const fallbackTotal = category.modules.reduce((sum, module) => sum + module.lessonCount, 0);
          const totalLessons = categoryProgress?.totalLessons ?? fallbackTotal;
          const doneLessons = categoryProgress?.completedLessons ?? 0;
          const percent = categoryProgress?.percent ?? 0;
          const complete = percent === 100 && totalLessons > 0;
          return (
            <section key={category.id} className="card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-ink-500/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-ink-500 bg-ink-900 text-sm font-black text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold">{category.name}</h2>
                      {complete ? (
                        <Badge tone="success">
                          <CheckCircle2 className="h-3 w-3" /> Concluída
                        </Badge>
                      ) : (
                        <Badge tone="accent">Nível {String(index + 1).padStart(2, "0")}</Badge>
                      )}
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">{category.description}</p>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <div className="mb-1 flex justify-between text-[10px] text-muted">
                    <span>
                      {doneLessons}/{totalLessons}
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <ProgressBar value={percent} />
                </div>
              </div>
              <div className="divide-y divide-ink-500/50">
                {category.modules.map((module) => (
                  <Link
                    key={module.id}
                    href={`/app/aprender/modulo/${module.slug}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-ink-700/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <BookOpen className="h-4 w-4 shrink-0 text-neutral-500 group-hover:text-accent" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{module.title}</p>
                        <p className="truncate text-[11px] text-muted">
                          {module.lessonCount} {module.lessonCount === 1 ? "aula" : "aulas"} · {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-[11px] font-semibold text-accent sm:inline">
                        {percent > 0 ? "Continuar" : "Começar"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-500" />
                    </div>
                  </Link>
                ))}
                {category.modules.length === 0 && (
                  <p className="px-5 py-4 text-xs text-muted">
                    <Lock className="mr-1 inline h-3 w-3" /> Conteúdo em preparação.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function AprenderPage() {
  return (
    <Suspense fallback={<Spinner label="Carregando trilhas" />}>
      <AprenderContent />
    </Suspense>
  );
}
