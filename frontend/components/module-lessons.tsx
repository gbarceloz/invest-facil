"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAppData } from "@/lib/app-data";
import type { ModuleDetail } from "@/lib/types";
import {
  MODULE01_LESSON_COUNT,
  MODULE01_SLUG,
  MODULE01_TITLE,
  deriveLessonStates,
  type LessonState,
} from "@/lib/learning";
import { ProgressBar } from "./progress";
import { Skeleton } from "./ui";

const STATE_COPY: Record<LessonState, string> = {
  completed: "Concluída",
  current: "Atual",
  locked: "Bloqueada",
};

export function LessonStateBadge({ state }: { state: LessonState }) {
  const tone =
    state === "completed"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : state === "current"
        ? "border-accent/30 bg-accent/10 text-accent"
        : "border-white/10 bg-white/[0.03] text-neutral-500";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${tone}`}>
      {state === "completed" && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
      {state === "current" && <PlayCircle className="h-3 w-3" aria-hidden="true" />}
      {state === "locked" && <Lock className="h-3 w-3" aria-hidden="true" />}
      {STATE_COPY[state]}
    </span>
  );
}

/**
 * Destaque do Módulo 01 no mapa. Lê a ordem canônica do servidor e apenas
 * deriva o estado visual a partir do progresso autoritativo (`completedLessonIds`).
 */
export function ModuleSpotlight() {
  const { progress, loading } = useAppData();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<ModuleDetail>(`/api/v1/content/modules/${MODULE01_SLUG}`)
      .then((data) => {
        if (active) setModule(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return (
      <section className="rounded-xl border border-white/[0.07] bg-[#111111] p-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">Módulo 01</p>
        <h2 className="mt-2 text-[16px] font-medium text-neutral-100">{MODULE01_TITLE}</h2>
        <p className="mt-2 text-[11px] leading-5 text-neutral-500">
          {MODULE01_LESSON_COUNT} aulas na ordem canônica. O conteúdo ainda não foi publicado pelo
          servidor — nada foi inventado aqui.
        </p>
      </section>
    );
  }

  if (!module) {
    return (
      <section className="space-y-3" aria-busy="true">
        <Skeleton className="h-20" />
        <Skeleton className="h-14" />
      </section>
    );
  }

  const lessons = module.lessons;
  const completedIds = progress?.completedLessonIds ?? [];
  const currentId =
    progress?.nextLesson && lessons.some((lesson) => lesson.id === progress.nextLesson?.id)
      ? progress.nextLesson.id
      : null;
  const states = deriveLessonStates(lessons, completedIds, currentId);
  const done = states.filter((state) => state === "completed").length;
  const percent = lessons.length === 0 ? 0 : Math.round((done / lessons.length) * 100);

  return (
    <section data-reveal-auto="up" className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 sm:p-6" aria-labelledby="modulo-01-titulo">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
            Módulo 01 · comece por aqui
          </p>
          <h2 id="modulo-01-titulo" className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-neutral-100">
            {module.title}
          </h2>
          <p className="mt-1 text-[11px] text-neutral-500">
            {lessons.length} aulas · vídeo, quiz e fichas na ordem canônica
          </p>
        </div>
        <Link
          href={`/app/aprender/modulo/${module.slug}`}
          className="btn-secondary shrink-0 text-[11px]"
        >
          Abrir módulo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={loading ? 0 : percent} className="flex-1" label="Progresso do módulo" />
        <span className="text-[10px] text-neutral-500">
          {done}/{lessons.length}
        </span>
      </div>

      <ol data-stagger-auto className="mt-4 space-y-1.5">
        {lessons.map((lesson, index) => {
          const state = states[index];
          const locked = state === "locked";
          const content = (
            <>
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[10px] font-semibold ${
                  state === "completed"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : state === "current"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-white/[0.08] bg-white/[0.02] text-neutral-500"
                }`}
                aria-hidden="true"
              >
                {state === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : state === "locked" ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-300">{lesson.title}</span>
              <span className="hidden shrink-0 items-center gap-1 text-[10px] text-neutral-600 sm:inline-flex">
                <Clock className="h-3 w-3" aria-hidden="true" /> {lesson.estimatedMin} min
              </span>
              <LessonStateBadge state={state} />
            </>
          );

          return (
            <li key={lesson.id}>
              {locked ? (
                <div
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-2.5 py-2 opacity-70"
                >
                  {content}
                </div>
              ) : (
                <Link
                  href={`/app/aprender/aula/${lesson.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition hover:border-white/[0.08] hover:bg-white/[0.03]"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
