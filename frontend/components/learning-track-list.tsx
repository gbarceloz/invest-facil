"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Category, ProgressSummary } from "@/lib/types";
import { ProgressBar } from "./progress";

export function LevelCards({
  categories,
  progress,
}: {
  categories: Category[];
  progress: ProgressSummary | null;
}) {
  const progressBySlug = new Map((progress?.categories ?? []).map((item) => [item.slug, item]));

  return (
    <div className="space-y-3">
      {categories.map((category, index) => {
        const categoryProgress = progressBySlug.get(category.slug);
        const totalLessons = categoryProgress?.totalLessons ?? category.modules.reduce((sum, module) => sum + module.lessonCount, 0);
        const percent = categoryProgress?.percent ?? 0;
        const firstModule = category.modules[0];

        return (
          <div key={category.id} className="rounded-xl border border-white/[0.08] bg-[#111111] p-5 transition hover:border-white/[0.14]">
            <div className="flex items-center gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border text-[11px] font-semibold ${percent === 100 ? "border-accent bg-accent text-ink-950" : "border-white/10 bg-white/[0.03] text-neutral-400"}`}>
                {percent === 100 ? <ArrowUpRight className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Nível {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-[16px] font-medium tracking-[-0.02em] text-neutral-100">{category.name}</h3>
                <p className="mt-1 text-[10px] text-neutral-500">
                  {totalLessons} conceitos · {category.modules.length} {category.modules.length === 1 ? "módulo" : "módulos"}
                </p>
                <ProgressBar value={percent} className="mt-3 max-w-[260px]" />
              </div>
              {firstModule && (
                <Link href={`/app/aprender/modulo/${firstModule.slug}`} className="btn-secondary shrink-0 text-[11px]">
                  {percent > 0 ? "Continuar" : "Começar"}
                </Link>
              )}
            </div>
            {category.modules.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2 pl-[60px]">
                {category.modules.map((module) => (
                  <Link
                    key={module.id}
                    href={`/app/aprender/modulo/${module.slug}`}
                    className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] text-neutral-400 transition hover:border-accent/25 hover:text-accent"
                  >
                    {module.title} · {module.lessonCount}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LearningTrackList({
  categories,
  progress,
}: {
  categories: Category[];
  progress: ProgressSummary | null;
}) {
  const progressBySlug = new Map((progress?.categories ?? []).map((item) => [item.slug, item]));

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {categories.map((category, index) => {
        const categoryProgress = progressBySlug.get(category.slug);
        const fallbackTotal = category.modules.reduce((sum, module) => sum + module.lessonCount, 0);
        const totalLessons = categoryProgress?.totalLessons ?? fallbackTotal;
        const doneLessons = categoryProgress?.completedLessons ?? 0;
        const percent = categoryProgress?.percent ?? 0;

        return (
          <section key={category.id} className="py-7 first:pt-6 last:pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-1 font-mono text-[11px] font-bold tracking-widest text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-neutral-50">{category.name}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">{category.description}</p>
                </div>
              </div>
              <div className="w-full shrink-0 sm:w-48">
                <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span>
                    {doneLessons}/{totalLessons} aulas
                  </span>
                  <span className="text-accent">{percent}%</span>
                </div>
                <ProgressBar value={percent} />
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {category.modules.map((module) => (
                <Link
                  key={module.id}
                  href={`/app/aprender/modulo/${module.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-white/[0.025] px-4 py-3.5 transition hover:bg-white/[0.06]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <BookOpen className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-neutral-200">{module.title}</span>
                      <span className="block truncate text-[11px] text-neutral-500">
                        {module.lessonCount} {module.lessonCount === 1 ? "aula" : "aulas"}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-600 transition group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
