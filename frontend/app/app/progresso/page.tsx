"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, BookOpen, Flame, Sparkles, Target, Ticket, Trophy } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api } from "@/lib/api";
import type { XpEntry } from "@/lib/types";
import { XP_REASON_LABEL, dateShort, dayCount, relativeTime } from "@/lib/format";
import { resolveFichas, resolveFichasMax, resolveStreak } from "@/lib/learning";
import { LevelRing, ProgressBar } from "@/components/progress";
import { PageHeader, Stat } from "@/components/page";
import { Skeleton } from "@/components/ui";

export default function ProgressPage() {
  const { gamification, progress, loading } = useAppData();
  const [xpHistory, setXpHistory] = useState<XpEntry[]>([]);
  const [xpError, setXpError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<XpEntry[]>("/api/v1/gamification/xp")
      .then(setXpHistory)
      .catch((err) =>
        setXpError(err instanceof Error ? err.message : "Não foi possível carregar o histórico."),
      );
  }, []);

  if (loading && !progress) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const unlocked = gamification?.achievements.filter((achievement) => achievement.unlocked) ?? [];
  const streak = resolveStreak(gamification, progress);
  const fichas = resolveFichas(gamification);
  const fichasMax = resolveFichasMax(gamification);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Evolução real"
        title="Seu progresso"
        description="Conhecimento, consistência e prática — sem confundir XP com dinheiro."
        actions={
          progress?.nextLesson ? (
            <Link href={`/app/aprender/aula/${progress.nextLesson.slug}`} className="btn-primary text-xs">
              Continuar aprendendo <ArrowRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Conhecimento" value={`${progress?.quizAverage ?? 0}%`} hint="média nos quizzes" icon={<Target className="h-4 w-4" />} />
        <Stat label="Progresso" value={`${progress?.completedLessons ?? 0}/${progress?.totalLessons ?? 0}`} hint="aulas concluídas" icon={<BookOpen className="h-4 w-4" />} />
        <Stat label="Consistência" value={dayCount(streak.current)} hint={`melhor: ${streak.best}`} icon={<Flame className="h-4 w-4" />} tone="accent" />
        <Stat label="Fichas" value={fichas ?? "—"} hint={fichasMax !== null ? `de ${fichasMax} · tentativas de quiz` : "saldo do servidor"} icon={<Ticket className="h-4 w-4" />} />
        <Stat label="Conquistas" value={`${gamification?.achievementsUnlocked ?? 0}/${gamification?.achievementsTotal ?? 0}`} hint="desbloqueadas" icon={<Trophy className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card flex flex-col items-center p-6 text-center">
          <LevelRing
            percent={gamification?.progressPercent ?? 0}
            level={gamification?.level.number ?? 1}
            xp={gamification?.xp ?? 0}
            size={168}
          />
          <h2 className="mt-4 text-[20px] font-medium tracking-[-0.02em]">{gamification?.level.name ?? "Curioso"}</h2>
          <p className="mt-1 text-xs text-muted">
            {gamification
              ? `${gamification.xp.toLocaleString("pt-BR")} XP acumulados · ${gamification.xpToNextLevel.toLocaleString("pt-BR")} para o próximo nível`
              : "Comece com uma aula de 4 minutos"}
          </p>
          <div className="mt-5 grid w-full grid-cols-3 gap-3 border-t border-ink-500/60 pt-5 text-center">
            <div>
              <p className="text-[17px] font-medium">{progress?.completedLessons ?? 0}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">Aulas</p>
            </div>
            <div>
              <p className="text-[17px] font-medium">{progress?.quizAttempts ?? 0}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">Quizzes</p>
            </div>
            <div>
              <p className="text-[17px] font-medium">{streak.best}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">Melhor sequência</p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-sm font-bold">Domínio por tema</h2>
          <p className="mt-1 text-xs text-muted">Percentual de aulas concluídas em cada trilha.</p>
          <div className="mt-5 space-y-4">
            {(progress?.categories ?? []).map((category) => (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">{category.name}</span>
                  <span className="text-muted">
                    {category.completedLessons}/{category.totalLessons} · {category.percent}%
                  </span>
                </div>
                <ProgressBar value={category.percent} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Atividade recente</h2>
            <span className="text-[11px] text-muted">{progress?.recent.length ?? 0} registros</span>
          </div>
          <div className="mt-4 divide-y divide-ink-500/50">
            {(progress?.recent ?? []).map((activity) => (
              <Link
                key={`${activity.lessonId}-${activity.completedAt}`}
                href={`/app/aprender/aula/${activity.lessonSlug}`}
                className="flex items-center justify-between gap-3 py-3 text-sm transition hover:text-accent"
              >
                <div>
                  <p className="font-semibold">{activity.lessonTitle}</p>
                  <p className="text-[11px] text-muted">{relativeTime(activity.completedAt)}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-500" />
              </Link>
            ))}
            {(progress?.recent.length ?? 0) === 0 && (
              <p className="py-6 text-center text-sm text-muted">Nenhuma aula concluída ainda.</p>
            )}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Histórico de XP</h2>
            <span className="text-[11px] text-muted">últimos 20</span>
          </div>
          {xpError && <p className="mt-3 text-xs text-red-300">{xpError}</p>}
          <div className="mt-4 divide-y divide-ink-500/50">
            {xpHistory.map((entry) => (
              <div key={`${entry.createdAt}-${entry.reason}-${entry.amount}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-neutral-200">
                    {XP_REASON_LABEL[entry.reason] ?? entry.reason}
                  </p>
                  <p className="text-[10px] text-muted">
                    {dateShort(entry.createdAt)} · {relativeTime(entry.createdAt)}
                  </p>
                </div>
                <span className="font-bold text-accent">+{entry.amount} XP</span>
              </div>
            ))}
            {xpHistory.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">Seu XP aparecerá aqui.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card mt-5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Conquistas</h2>
            <p className="mt-1 text-xs text-muted">
              Recompensas por aprender — não por clicar ou transacionar.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
            <Award className="h-4 w-4" /> {unlocked.length}/{gamification?.achievementsTotal ?? 0}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(gamification?.achievements ?? []).map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border p-4 ${
                achievement.unlocked
                  ? "border-accent/30 bg-accent/5"
                  : "border-ink-500/60 bg-ink-900/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink-700 text-accent">
                  {achievement.unlocked ? <Trophy className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                {achievement.xpReward > 0 && (
                  <span className="text-[10px] font-bold text-accent">+{achievement.xpReward} XP</span>
                )}
              </div>
              <p className="mt-3 text-sm font-bold">{achievement.name}</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">{achievement.description}</p>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="mt-2 text-[10px] text-emerald-400">Desbloqueada em {dateShort(achievement.unlockedAt)}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
