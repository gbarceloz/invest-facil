"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Ticket,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import type { LessonStatus, ModuleDetail } from "@/lib/types";
import { deriveLessonStates, resolveFichas } from "@/lib/learning";
import { percent } from "@/lib/format";
import { PageHeader } from "@/components/page";
import { ProgressBar } from "@/components/progress";
import { Spinner } from "@/components/ui";
import { LessonStateBadge } from "@/components/module-lessons";

export default function ModulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { progress, gamification } = useAppData();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [statuses, setStatuses] = useState<Record<string, LessonStatus>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setModule(null);
    setStatuses({});
    setError(null);

    api
      .get<ModuleDetail>(`/api/v1/content/modules/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setModule(data);
        const statusResults = await Promise.allSettled(
          data.lessons.map((lesson) =>
            api.get<LessonStatus>(`/api/v1/progress/lessons/${lesson.id}`),
          ),
        );
        if (!active) return;

        const nextStatuses: Record<string, LessonStatus> = {};
        statusResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            nextStatuses[data.lessons[index].id] = result.value;
          }
        });
        setStatuses(nextStatuses);
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

  const statusCompleted = Object.entries(statuses)
    .filter(([, status]) => status.completed)
    .map(([id]) => id);
  const completedIds = Array.from(new Set([...(progress?.completedLessonIds ?? []), ...statusCompleted]));
  const nextLessonInModule =
    progress?.nextLesson && module.lessons.some((lesson) => lesson.id === progress.nextLesson?.id)
      ? progress.nextLesson.id
      : null;
  const states = deriveLessonStates(module.lessons, completedIds, nextLessonInModule);
  const done = states.filter((state) => state === "completed").length;
  const modulePercent =
    module.lessons.length === 0 ? 0 : Math.round((done / module.lessons.length) * 100);
  const currentIndex = states.findIndex((state) => state === "current");
  const currentLesson = currentIndex >= 0 ? module.lessons[currentIndex] : null;
  const fichas = resolveFichas(gamification);

  return (
    <div>
      <Link
        href="/app/aprender"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" /> Mapa de aprendizado
      </Link>
      <PageHeader
        eyebrow={`${module.categoryName} · Módulo`}
        title={module.title}
        description={module.description}
      />

      <div className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{module.lessons.length} aulas</span>
          <span className="h-1 w-1 rounded-full bg-neutral-600" />
          <span>{done} concluídas</span>
          <span className="h-1 w-1 rounded-full bg-neutral-600" />
          <span className="font-bold text-accent">{modulePercent}%</span>
          {fichas !== null && (
            <span className="pill" title="Fichas de quiz · saldo do servidor">
              <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> {fichas} fichas
            </span>
          )}
        </div>
        {currentLesson && (
          <Link href={`/app/aprender/aula/${currentLesson.slug}`} className="btn-primary text-xs">
            Continuar aula <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <ProgressBar value={modulePercent} label="Progresso do módulo" className="mb-6" />

      <ol className="space-y-3">
        {module.lessons.map((lesson, index) => {
          const state = states[index];
          const status = statuses[lesson.id];
          const locked = state === "locked";
          const meta = (
            <>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" /> {lesson.estimatedMin} min
              </span>
              {status?.videoWatched !== undefined && (
                <span className={status.videoWatched ? "text-emerald-400" : "text-neutral-500"}>
                  {status.videoWatched ? "Vídeo assistido" : "Vídeo pendente"}
                </span>
              )}
              {status && status.attempts > 0 && (
                <span className={status.quizPassed ? "text-emerald-400" : "text-neutral-400"}>
                  Quiz: {percent(status.bestQuizPercent, 0)}
                </span>
              )}
              {state === "completed" && <span className="text-emerald-400">Concluída</span>}
              {state === "current" && <span className="font-bold text-accent">Atual</span>}
              {locked && <span className="text-neutral-500">Conclua a aula anterior para liberar</span>}
            </>
          );

          const numberBadge = (
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-black ${
                state === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : state === "current"
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-ink-500 bg-ink-900 text-neutral-500"
              }`}
              aria-hidden="true"
            >
              {state === "completed" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </div>
          );

          const body = (
            <>
              {numberBadge}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold sm:text-base">{lesson.title}</p>
                  <LessonStateBadge state={state} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted">{meta}</div>
              </div>
              {locked ? (
                <Lock className="h-5 w-5 shrink-0 text-neutral-600" aria-hidden="true" />
              ) : (
                <PlayCircle className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden="true" />
              )}
            </>
          );

          if (locked) {
            return (
              <li key={lesson.id}>
                <div
                  aria-disabled="true"
                  aria-label={`Aula ${index + 1}: ${lesson.title} — bloqueada`}
                  className="card flex items-center gap-4 p-4 opacity-70 sm:p-5"
                >
                  {body}
                </div>
              </li>
            );
          }

          return (
            <li key={lesson.id}>
              <Link
                href={`/app/aprender/aula/${lesson.slug}`}
                aria-label={`Aula ${index + 1}: ${lesson.title} — ${state === "completed" ? "concluída, pode revisar" : "atual"}`}
                className={`card card-hover flex items-center gap-4 p-4 sm:p-5 ${
                  state === "current" ? "border-accent/40 bg-accent/5" : ""
                }`}
              >
                {body}
              </Link>
            </li>
          );
        })}
        {module.lessons.length === 0 && (
          <li className="card p-6 text-sm text-muted">Este módulo ainda não tem aulas publicadas.</li>
        )}
      </ol>
    </div>
  );
}
