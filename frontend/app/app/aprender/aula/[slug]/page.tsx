"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  VideoOff,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type { LessonDetail, LessonStatus, VideoInfo } from "@/lib/types";
import { Badge } from "@/components/page";
import { Alert, Disclaimer, Spinner } from "@/components/ui";

function oneLineSummary(markdown: string) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^#+\s.*$/gm, "").replace(/[*_>`]/g, "").trim())
    .find((part) => part.length > 40);
  const text = (paragraph ?? markdown).replace(/\s+/g, " ").trim();
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
}

function LessonVideo({ slug }: { slug: string }) {
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<VideoInfo>(`/api/v1/content/lessons/${slug}/video`)
      .then((data) => {
        if (active) setVideo(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!video && !failed) {
    return <div className="aspect-video animate-pulse rounded-xl border border-white/[0.06] bg-[#111111]" />;
  }

  if (failed || !video) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-[#0d0d0d] text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-500">
          <VideoOff className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-neutral-300">Vídeo em preparação</p>
          <p className="mt-1 max-w-sm px-6 text-[11px] leading-5 text-neutral-500">
            O vídeo é publicado após revisão editorial. Conclua a aula para liberar o quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black">
      <video controls preload="metadata" className="aspect-video w-full" src={video.url}>
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const { progress, reload } = useAppData();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLesson(null);
    setStatus(null);
    setError(null);
    api
      .get<LessonDetail>(`/api/v1/content/lessons/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setLesson(data);
        try {
          const lessonStatus = await api.get<LessonStatus>(`/api/v1/progress/lessons/${data.id}`);
          if (active) setStatus(lessonStatus);
        } catch {
          // status é opcional; a aula continua acessível
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Aula não encontrada.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const completed = status?.completed ?? progress?.completedLessonIds.includes(lesson?.id ?? "") ?? false;

  async function handleContinue() {
    if (!lesson) return;
    if (completed) {
      router.push(`/app/aprender/quiz/${slug}`);
      return;
    }
    setCompleting(true);
    setError(null);
    try {
      await api.post(`/api/v1/progress/lessons/${lesson.id}`);
      await reload();
      router.push(`/app/aprender/quiz/${slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a aula.");
      setCompleting(false);
    }
  }

  if (error && !lesson) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-[12px] text-red-200">
        {error}
        <Link href="/app/aprender" className="btn-secondary mt-4 inline-flex">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (!lesson) return <Spinner label="Carregando aula" />;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
          {lesson.categoryName} · Aula {lesson.order}
        </p>
        <h1 className="mt-3 max-w-2xl text-[30px] font-medium leading-[1.15] tracking-[-0.04em] text-neutral-100 sm:text-[36px]">
          {lesson.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.estimatedMin} min</span>
          <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {lesson.moduleTitle}</span>
          {completed ? (
            <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Concluída</Badge>
          ) : (
            <Badge tone="accent">+50 XP no quiz</Badge>
          )}
        </div>
      </header>

      {error && <Alert>{error}</Alert>}

      <LessonVideo slug={slug} />

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#111111] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-neutral-200">
            {completed ? "Aula concluída. O quiz está liberado." : "Assistiu à aula?"}
          </p>
          <p className="mt-1 text-[10px] leading-5 text-neutral-500">
            {completed
              ? "Você pode refazer o quiz quando quiser."
              : "Marque como concluída para ir às perguntas. O vídeo fica nesta etapa; o quiz é separado."}
          </p>
        </div>
        <button type="button" onClick={handleContinue} className="btn-primary shrink-0 text-[11px]" disabled={completing}>
          {completing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {completed ? "Ir para o quiz" : "Marcar como concluída"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">Em uma frase</p>
        <p className="mt-1 text-[12px] leading-6 text-neutral-300">{oneLineSummary(lesson.contentMd)}</p>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        O quiz é uma etapa separada, liberada após a conclusão da aula.
      </div>
      <Disclaimer className="text-[10px]" />
    </div>
  );
}
