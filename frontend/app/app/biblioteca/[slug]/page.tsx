"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { ArticleDetail } from "@/lib/types";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/page";
import { Disclaimer, Spinner } from "@/components/ui";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<ArticleDetail>(`/api/v1/content/articles/${params.slug}`)
      .then((data) => {
        if (active) setArticle(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Artigo não encontrado.");
      });
    return () => {
      active = false;
    };
  }, [params.slug]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/app/biblioteca" className="btn-secondary mt-5">
          Voltar à biblioteca
        </Link>
      </div>
    );
  }

  if (!article) return <Spinner label="Carregando artigo" />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/biblioteca" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-neutral-100">
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>

      <div data-reveal-auto="up" className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{article.categoryName ?? "Educação financeira"}</Badge>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Clock className="h-3.5 w-3.5" /> {article.readingMinutes} min de leitura
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{article.subtitle}</p>
      </div>

      <article data-reveal-auto="fade" className="card p-6 sm:p-8">
        <Markdown content={article.contentMd} />
        {(article.sourceName || article.sourceUrl) && (
          <div className="mt-8 border-t border-ink-500/60 pt-5 text-xs text-muted">
            <p className="font-bold text-neutral-300">Fonte</p>
            {article.sourceUrl ? (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-accent hover:underline"
              >
                {article.sourceName ?? article.sourceUrl}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-1">{article.sourceName}</p>
            )}
          </div>
        )}
      </article>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}
