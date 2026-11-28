"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { ArticleSummary } from "@/lib/types";
import { PageHeader } from "@/components/page";
import { Alert, Disclaimer, Spinner } from "@/components/ui";

export default function LibraryPage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ArticleSummary[]>("/api/v1/content/articles")
      .then(setArticles)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Não foi possível carregar os artigos."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Biblioteca"
        title="Conteúdo para entender o porquê"
        description="Artigos curtos, com fontes e sem promessas de rentabilidade. Leia antes de decidir."
      />

      <div className="card mb-6 flex items-start gap-3 border-accent/25 bg-accent/5 p-4 sm:p-5">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p className="text-xs leading-6 text-neutral-300">
          A biblioteca complementa as aulas com contexto e fontes. Ela não substitui a leitura dos
          documentos oficiais dos produtos financeiros que você vier a considerar.
        </p>
      </div>

      {error && (
        <Alert className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()} className="font-bold text-accent hover:underline">
              Tentar novamente
            </button>
          </div>
        </Alert>
      )}

      {loading ? (
        <Spinner label="Carregando artigos" />
      ) : (
        <div data-stagger-auto className="grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <Link key={article.id} href={`/app/biblioteca/${article.slug}`} className="card card-hover flex flex-col p-5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent">
                <BookOpen className="h-3.5 w-3.5" />
                {article.categoryName ?? "Educação financeira"}
              </div>
              <h2 className="mt-3 text-lg font-extrabold leading-snug">{article.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted">{article.subtitle}</p>
              <div className="mt-5 flex items-center justify-between text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {article.readingMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-accent">
                  Ler artigo <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
          {articles.length === 0 && !error && (
            <p className="card p-6 text-sm text-muted">Nenhum artigo publicado ainda.</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
