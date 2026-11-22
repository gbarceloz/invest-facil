"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import type { ModuleDetail } from "@/lib/types";
import { PageHeader } from "@/components/page";
import { Spinner } from "@/components/ui";

export default function ModulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { progress } = useAppData();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const completed = new Set(progress?.completedLessonIds ?? []);
  const nextId = progress?.nextLesson?.id;

  useEffect(() => {
    let active = true;
    api
      .get<ModuleDetail>(`/api/v1/content/modules/${slug}`)
      .then((data) => {
        if (active) setModule(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Módulo não encontrado.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/app/aprender" className="btn-secondary mt-5">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (!module) return <Spinner label="Carregando módulo" />;

  const done = module.lessons.filter((lesson) => completed.has(lesson.id)).length;
  const percent = module.lessons.length === 0 ? 0 : Math.round((done / module.lessons.length) * 100);

  return (
    <div>
      <Link href="/app/aprender" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-neutral-100">
        <ArrowLeft className="h-4 w-4" /> Mapa de aprendizado
      </Link>
      <PageHeader
        eyebrow={`${module.categoryName} · Módulo`}
        title={module.title}
        description={module.description}
      />

      <div className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{module.lessons.length} aulas</span>
          <span className="h-1 w-1 rounded-full bg-neutral-600" />
          <span>{done} concluídas</span>
          <span className="h-1 w-1 rounded-full bg-neutral-600" />
          <span className="font-bold text-accent">{percent}%</span>
        </div>
        {progress?.nextLesson && progress.nextLesson.moduleTitle === module.title && (
          <Link href={`/app/aprender/aula/${progress.nextLesson.slug}`} className="btn-primary text-xs">
            Continuar aula <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {module.lessons.map((lesson, index) => {
          const isDone = completed.has(lesson.id);
          const isNext = lesson.id === nextId;
          return (
            <Link
              key={lesson.id}
              href={`/app/aprender/aula/${lesson.slug}`}
              className={`card card-hover flex items-center gap-4 p-4 sm:p-5 ${
                isNext ? "border-accent/40 bg-accent/5" : ""
              }`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-black ${
                  isDone
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : isNext
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-ink-500 bg-ink-900 text-neutral-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : String(index + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold sm:text-base">{lesson.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {lesson.estimatedMin} min
                  </span>
                  {isDone && <span className="text-emerald-400">Concluída</span>}
                  {isNext && <span className="font-bold text-accent">Próxima</span>}
                </div>
              </div>
              <PlayCircle className="h-5 w-5 shrink-0 text-neutral-500" />
            </Link>
          );
        })}
        {module.lessons.length === 0 && (
          <p className="card p-6 text-sm text-muted">Este módulo ainda não tem aulas publicadas.</p>
        )}
      </div>
    </div>
  );
}
