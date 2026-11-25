"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Lock,
  Sparkles,
  Ticket,
  VideoOff,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type {
  LessonDetail,
  LessonStatus,
  ModuleDetail,
  VideoProgressResponse,
} from "@/lib/types";
import {
  canContinueLesson,
  module01VideoAssets,
  oneLineSummary,
  resolveFichas,
  resolveStreak,
  videoRegisterMessage,
  type Module01VideoAssets,
} from "@/lib/learning";
import { dayCount } from "@/lib/format";
import { Badge } from "@/components/page";
import { Alert, Disclaimer, Spinner } from "@/components/ui";

function VideoPlaceholder() {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-[#0d0d0d] text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-500">
        <VideoOff className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-neutral-300">Vídeo em preparação</p>
        <p className="mt-1 max-w-sm px-6 text-[11px] leading-5 text-neutral-500">
          O vídeo é publicado após revisão editorial. O CONTINUAR será liberado quando ele estiver
          disponível e você assistir até o fim.
        </p>
      </div>
    </div>
  );
}

function LessonVideo({
  slug,
  local,
  checked,
  onEnded,
}: {
  slug: string;
  local: Module01VideoAssets | null;
  checked: boolean;
  onEnded: (positionSeconds: number, durationSeconds: number) => void;
}) {
  const source = local?.mp4 ?? null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [source]);

  if (!checked && !local) {
    return (
      <div
        className="aspect-video animate-pulse rounded-xl border border-white/[0.06] bg-[#111111]"
        role="status"
        aria-label="Carregando vídeo da aula"
      />
    );
  }

  if (!source) return <VideoPlaceholder />;

  if (failed && local) {
    // Ambiente sem os arquivos locais (CI/preview sem Storage): mantém o
    // placeholder editorial em vez de expor uma mensagem de infraestrutura.
    return <VideoPlaceholder />;
  }

  if (failed) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
          <VideoOff className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-red-200">
            {local ? "Não foi possível carregar o vídeo local do Módulo 01." : "Não foi possível reproduzir o vídeo desta aula."}
          </p>
          <p className="mt-1 max-w-md px-6 text-[11px] leading-5 text-neutral-400">
            {local
              ? `Verifique se public/videos/module-01/${slug}.mp4 existe e rode o script de sincronização do Módulo 01.`
              : "Tente recarregar a página. Se o problema continuar, o vídeo pode estar indisponível."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black">
      <video
        key={source}
        controls
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        className="aspect-video w-full"
        src={source}
        poster={local?.poster}
        aria-label="Vídeo da aula"
        onError={() => setFailed(true)}
        onEnded={(event) => {
          const element = event.currentTarget;
          const position = Number.isFinite(element.currentTime) ? element.currentTime : 0;
          const duration = Number.isFinite(element.duration) ? element.duration : 0;
          onEnded(position, duration);
        }}
      >
        {local && (
          <track
            {...({ type: "text/vtt" } as Record<string, string>)}
            kind="captions"
            src={local.captions}
            srcLang="pt-BR"
            label="Português"
          />
        )}
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const { progress, gamification, reload } = useAppData();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);
  const [videoChecked, setVideoChecked] = useState(false);
  const [watchedLocally, setWatchedLocally] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);
  const [pendingVideo, setPendingVideo] = useState<{
    positionSeconds: number;
    durationSeconds: number;
  } | null>(null);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [previous, setPrevious] = useState<{ slug: string; title: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLesson(null);
    setStatus(null);
    setVideoChecked(false);
    setWatchedLocally(false);
    setVideoWarning(null);
    setPendingVideo(null);
    setLocked(null);
    setPrevious(null);
    setError(null);

    api
      .get<LessonDetail>(`/api/v1/content/lessons/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setLesson(data);

        const [statusResult, moduleResult] = await Promise.allSettled([
          api.get<LessonStatus>(`/api/v1/progress/lessons/${data.id}`),
          data.order > 1
            ? api.get<ModuleDetail>(`/api/v1/content/modules/${data.moduleSlug}`)
            : Promise.resolve(null),
        ]);
        if (!active) return;

        if (statusResult.status === "fulfilled") setStatus(statusResult.value);
        setVideoChecked(true);

        if (data.order <= 1) {
          setLocked(false);
          return;
        }

        const moduleData = moduleResult.status === "fulfilled" ? moduleResult.value : null;
        const previousLesson =
          moduleData?.lessons.find((item) => item.order === data.order - 1) ??
          moduleData?.lessons[data.order - 2];
        if (!previousLesson) {
          // Sem a lista do módulo não há como provar o bloqueio no cliente.
          setLocked(false);
          return;
        }
        setPrevious({ slug: previousLesson.slug, title: previousLesson.title });

        try {
          const previousStatus = await api.get<LessonStatus>(
            `/api/v1/progress/lessons/${previousLesson.id}`,
          );
          if (active) setLocked(previousStatus.completed !== true);
        } catch {
          if (!active) return;
          // Progresso desconhecido: não bloqueia no cliente; o servidor decide.
          setLocked(false);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Aula não encontrada.");
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const completedFromProgress = lesson
    ? (progress?.completedLessonIds ?? []).includes(lesson.id)
    : false;
  const completed = status?.completed ?? completedFromProgress;
  const videoWatched = watchedLocally || status?.videoWatched === true || completed;
  const canContinue = canContinueLesson({ videoWatched, completed });
  const fichas = resolveFichas(gamification, status?.fichas ?? null);
  const streak = resolveStreak(gamification, progress);
  const localVideo = module01VideoAssets(slug);

  async function registerVideo(positionSeconds: number, durationSeconds: number) {
    if (!lesson) return;
    setRegistering(true);
    setVideoWarning(null);
    setPendingVideo({ positionSeconds, durationSeconds });
    try {
      await api.post<VideoProgressResponse>(`/api/v1/progress/lessons/${lesson.id}/video`, {
        watched: true,
        positionSeconds: Math.max(0, Math.round(positionSeconds)),
        durationSeconds: Math.max(0, Math.round(durationSeconds)),
      });
      setWatchedLocally(true);
      setPendingVideo(null);
      try {
        const fresh = await api.get<LessonStatus>(`/api/v1/progress/lessons/${lesson.id}`);
        setStatus(fresh);
      } catch {
        // `watchedLocally` mantém o CONTINUAR liberado para o evento já ocorrido.
      }
      await reload();
    } catch (err) {
      setVideoWarning(videoRegisterMessage(err));
    } finally {
      setRegistering(false);
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

  if (locked === null) return <Spinner label="Verificando liberação da aula" />;

  if (locked) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6 text-center sm:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-neutral-300">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Aula bloqueada
          </p>
          <h1 className="mt-2 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">
            Conclua a aula anterior primeiro.
          </h1>
          <p className="mt-3 text-[12px] leading-6 text-neutral-400">
            A trilha é sequencial: cada aula prepara a próxima. Você poderá abrir esta aula assim que
            concluir
            {previous ? ` “${previous.title}”` : " a aula anterior"}.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {previous && (
              <Link href={`/app/aprender/aula/${previous.slug}`} className="btn-primary">
                Ir para a aula anterior <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/app/aprender" className="btn-secondary">
              Voltar ao mapa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasVideo = localVideo !== null;
  const panelTitle = completed
    ? "Aula concluída. O quiz está liberado."
    : canContinue
      ? "Vídeo concluído. O quiz está liberado."
      : hasVideo
        ? "Assista ao vídeo até o fim."
        : "Vídeo em preparação.";
  const panelHint = completed
    ? "Você pode revisar o quiz e as aulas concluídas quando quiser."
    : canContinue
      ? "CONTINUAR abre as 3 perguntas da aula. Cada tentativa reprovada consome 1 ficha."
      : hasVideo
        ? "O botão CONTINUAR é liberado pelo evento de fim do vídeo — não existe atalho para marcar a aula como concluída antes disso."
        : "O botão CONTINUAR será liberado quando o vídeo for publicado e você assistir até o fim.";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
          {lesson.categoryName} · Aula {lesson.order}
        </p>
        <h1 className="mt-3 max-w-2xl text-[30px] font-medium leading-[1.15] tracking-[-0.04em] text-neutral-100 sm:text-[36px]">
          {lesson.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMin} min
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {lesson.moduleTitle}
          </span>
          {completed ? (
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" /> Concluída
            </Badge>
          ) : canContinue ? (
            <Badge tone="accent">
              <CheckCircle2 className="h-3 w-3" /> Vídeo assistido
            </Badge>
          ) : null}
          <span className="pill" title="Fichas de quiz · saldo do servidor">
            <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {fichas !== null ? `${fichas} fichas` : "fichas indisponíveis"}
          </span>
          <span className="pill" title="Sequência de estudos · dados do servidor">
            <Flame className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {dayCount(streak.current)}
          </span>
        </div>
      </header>

      {error && <Alert>{error}</Alert>}

      <LessonVideo
        slug={slug}
        local={localVideo}
        checked={videoChecked || localVideo !== null}
        onEnded={(position, duration) => void registerVideo(position, duration)}
      />

      {registering && (
        <p className="flex items-center gap-2 text-[11px] text-neutral-400" role="status">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Registrando vídeo assistido…
        </p>
      )}
      {videoWarning && (
        <Alert tone="warning">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{videoWarning}</span>
            {pendingVideo && (
              <button
                type="button"
                onClick={() => void registerVideo(pendingVideo.positionSeconds, pendingVideo.durationSeconds)}
                className="btn-secondary px-3 py-1.5 text-[11px]"
                disabled={registering}
              >
                {registering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Tentar registrar novamente
              </button>
            )}
          </div>
        </Alert>
      )}
      {videoWatched && !registering && (
        <p className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" /> Vídeo assistido
          {status?.videoWatched === false ? " (registro local)" : ""}
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#111111] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-neutral-200">{panelTitle}</p>
          <p id="continuar-ajuda" className="mt-1 max-w-xl text-[10px] leading-5 text-neutral-500">
            {panelHint}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (canContinue) router.push(`/app/aprender/quiz/${slug}`);
          }}
          className="btn-primary shrink-0 text-[11px]"
          disabled={!canContinue || registering}
          aria-describedby="continuar-ajuda"
        >
          {completed ? "Ir para o quiz" : "Continuar"} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">Em uma frase</p>
        <p className="mt-1 text-[12px] leading-6 text-neutral-300">{oneLineSummary(lesson.contentMd)}</p>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        O quiz é uma etapa separada, liberada após o vídeo. Fichas não regeneram sozinhas.
      </div>
      <Disclaimer className="text-[10px]" />
    </div>
  );
}
