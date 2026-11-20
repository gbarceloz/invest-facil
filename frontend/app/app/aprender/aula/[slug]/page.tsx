"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  PlayCircle,
  RefreshCw,
  Sparkles,
  VideoOff,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type {
  LessonDetail,
  LessonStatus,
  ModuleDetail,
  Quiz,
  QuizResult,
  VideoInfo,
} from "@/lib/types";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/page";
import { Alert, Disclaimer, Spinner } from "@/components/ui";

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

  if (failed || (!video && !failed)) {
    if (!failed) {
      return <div className="aspect-video animate-pulse rounded-2xl bg-ink-700" />;
    }
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-ink-500 bg-ink-900 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-700 text-neutral-500">
          <VideoOff className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-300">Vídeo em preparação</p>
          <p className="mt-1 max-w-sm px-6 text-xs text-muted">
            O conteúdo completo desta aula está no texto abaixo. Vídeos são publicados após revisão
            editorial.
          </p>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-500 bg-black">
      <video controls preload="metadata" className="aspect-video w-full" src={video.url}>
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { progress, reload } = useAppData();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [completing, setCompleting] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLesson(null);
    setQuiz(null);
    setQuizError(null);
    setQuizResult(null);
    setSelected({});
    setToast(null);
    api
      .get<LessonDetail>(`/api/v1/content/lessons/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setLesson(data);
        const [statusResult, quizResultData, moduleResult] = await Promise.allSettled([
          api.get<LessonStatus>(`/api/v1/progress/lessons/${data.id}`),
          api.get<Quiz>(`/api/v1/progress/lessons/${data.id}/quiz`),
          api.get<ModuleDetail>(`/api/v1/content/modules/${data.moduleSlug}`),
        ]);
        if (!active) return;
        if (statusResult.status === "fulfilled") setStatus(statusResult.value);
        if (quizResultData.status === "fulfilled") {
          setQuiz(quizResultData.value);
        } else if (
          quizResultData.reason instanceof ApiError &&
          quizResultData.reason.status === 404
        ) {
          setQuiz(null);
        } else {
          setQuizError(
            quizResultData.reason instanceof Error
              ? quizResultData.reason.message
              : "Não foi possível carregar o quiz.",
          );
        }
        if (moduleResult.status === "fulfilled") setModule(moduleResult.value);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Aula não encontrada.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const nextLesson = useMemo(() => {
    if (!module || !lesson) return null;
    const index = module.lessons.findIndex((item) => item.id === lesson.id);
    if (index < 0 || index >= module.lessons.length - 1) return null;
    return module.lessons[index + 1];
  }, [module, lesson]);

  async function handleComplete() {
    if (!lesson || status?.completed) return;
    setCompleting(true);
    setError(null);
    try {
      const response = await api.post<{
        alreadyCompleted: boolean;
        xpAwarded: number;
        totalXp: number;
        level: string;
      }>(`/api/v1/progress/lessons/${lesson.id}`);
      setStatus((current) => ({ ...(current ?? { bestQuizPercent: 0, attempts: 0 }), completed: true }));
      setToast(
        response.alreadyCompleted
          ? "Esta aula já estava concluída."
          : `Aula concluída! +${response.xpAwarded} XP`,
      );
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a aula.");
    } finally {
      setCompleting(false);
    }
  }

  async function handleQuizSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!lesson || !quiz) return;
    if (Object.keys(selected).length !== quiz.questions.length) {
      setError("Responda a todas as questões antes de enviar.");
      return;
    }
    setSubmittingQuiz(true);
    setError(null);
    try {
      const result = await api.post<QuizResult>(`/api/v1/progress/lessons/${lesson.id}/quiz`, {
        answers: quiz.questions.map((question) => ({
          questionId: question.id,
          selectedIndex: selected[question.id],
        })),
      });
      setQuizResult(result);
      if (result.xpAwarded > 0) {
        setToast(`Quiz aprovado! +${result.xpAwarded} XP`);
      }
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar o quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  }

  if (error && !lesson) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/app/aprender" className="btn-secondary mt-5">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (!lesson) return <Spinner label="Carregando aula" />;

  const completed = status?.completed ?? progress?.completedLessonIds.includes(lesson.id) ?? false;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/app/aprender" className="inline-flex items-center gap-1 hover:text-neutral-100">
          <ArrowLeft className="h-3.5 w-3.5" /> Aprender
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/app/aprender/modulo/${lesson.moduleSlug}`} className="hover:text-neutral-100">
          {lesson.moduleTitle}
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            {lesson.categoryName} · Aula {lesson.order}
          </p>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
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
            ) : (
              <Badge tone="accent">+50 XP ao concluir</Badge>
            )}
          </div>
        </div>
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}
      {toast && (
        <Alert tone="success" className="mb-4">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> {toast}
          </span>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <LessonVideo slug={slug} />

          <article className="card p-5 sm:p-7">
            <Markdown content={lesson.contentMd} />
          </article>

          <section className="card p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Quiz da aula</h2>
                <p className="mt-1 text-xs text-muted">
                  {quiz
                    ? `${quiz.questions.length} ${quiz.questions.length === 1 ? "questão" : "questões"} · acerte 70% para ganhar XP`
                    : "Esta aula ainda não possui quiz."}
                </p>
              </div>
              {quizResult && (
                <Badge tone={quizResult.passed ? "success" : "danger"}>
                  {quizResult.score}/{quizResult.maxScore} · {quizResult.percent}%
                </Badge>
              )}
            </div>

            {quizError && (
              <Alert className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{quizError}</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="font-bold text-accent hover:underline"
                  >
                    Recarregar
                  </button>
                </div>
              </Alert>
            )}
            {!quiz && !quizError && (
              <p className="mt-4 text-sm text-muted">Continue estudando o conteúdo acima.</p>
            )}

            {quiz && !quizResult && (
              <form onSubmit={handleQuizSubmit} className="mt-5 space-y-5">
                {quiz.questions.map((question, questionIndex) => (
                  <fieldset key={question.id} className="rounded-xl border border-ink-500/70 bg-ink-900/50 p-4">
                    <legend className="px-1 text-sm font-bold">
                      {questionIndex + 1}. {question.question}
                    </legend>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const checked = selected[question.id] === optionIndex;
                        return (
                          <label
                            key={`${question.id}-${optionIndex}`}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                              checked
                                ? "border-accent/50 bg-accent/10 text-neutral-50"
                                : "border-ink-500/60 text-neutral-300 hover:border-accent/30 hover:bg-ink-700/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              className="mt-0.5 h-4 w-4 accent-[#facc15]"
                              checked={checked}
                              onChange={() =>
                                setSelected((current) => ({ ...current, [question.id]: optionIndex }))
                              }
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submittingQuiz}>
                  {submittingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Enviar respostas <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {quiz && quizResult && (
              <div className="mt-5 space-y-4">
                <div
                  className={`rounded-xl border p-4 text-sm ${
                    quizResult.passed
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  <p className="font-bold">
                    {quizResult.passed ? "Bom trabalho!" : "Ainda não foi desta vez."} {quizResult.percent}% de acerto.
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    {quizResult.passed
                      ? quizResult.xpAwarded > 0
                        ? `+${quizResult.xpAwarded} XP pela aprovação.`
                        : "Você já havia recebido o XP desta aprovação."
                      : "Revise o conteúdo e tente novamente. O XP é concedido apenas na primeira aprovação."}
                  </p>
                </div>
                {quiz.questions.map((question, index) => {
                  const result = quizResult.results.find((item) => item.questionId === question.id);
                  return (
                    <div key={question.id} className="rounded-xl border border-ink-500/70 p-4">
                      <p className="text-sm font-bold">
                        {index + 1}. {question.question}
                      </p>
                      <p className={`mt-2 text-xs font-semibold ${result?.correct ? "text-emerald-400" : "text-red-400"}`}>
                        {result?.correct ? "Resposta correta" : "Resposta incorreta"}
                      </p>
                      {!result?.correct && (
                        <p className="mt-1 text-xs text-muted">
                          Correta: <span className="text-neutral-200">{question.options[result?.correctIndex ?? 0]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => {
                    setQuizResult(null);
                    setSelected({});
                  }}
                >
                  <RefreshCw className="h-4 w-4" /> Tentar novamente
                </button>
              </div>
            )}
          </section>

          {lesson.relatedArticles.length > 0 && (
            <section className="card p-5 sm:p-6">
              <h2 className="text-sm font-bold">Para aprofundar</h2>
              <div className="mt-3 divide-y divide-ink-500/60">
                {lesson.relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/app/biblioteca/${article.slug}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm transition hover:text-accent"
                  >
                    <div>
                      <p className="font-semibold">{article.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{article.readingMinutes} min de leitura</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Disclaimer />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Seu progresso</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">Aulas concluídas</span>
              <span className="font-bold">
                {progress?.completedLessons ?? 0}/{progress?.totalLessons ?? 0}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-600">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progress?.percent ?? 0}%` }} />
            </div>
            <button
              type="button"
              onClick={handleComplete}
              className="btn-primary mt-4 w-full text-xs"
              disabled={completing || completed}
            >
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {completed ? "Aula concluída" : "Marcar como concluída"}
            </button>
            {status && status.attempts > 0 && (
              <p className="mt-3 text-center text-[11px] text-muted">
                Melhor quiz: <span className="font-bold text-neutral-200">{status.bestQuizPercent}%</span>
              </p>
            )}
          </div>

          <div className="card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Nesta trilha</p>
            <p className="mt-1 text-sm font-bold">{lesson.moduleTitle}</p>
            <div className="mt-3 space-y-1.5">
              {module?.lessons.slice(0, 8).map((item) => {
                const done = progress?.completedLessonIds.includes(item.id);
                const current = item.id === lesson.id;
                return (
                  <Link
                    key={item.id}
                    href={`/app/aprender/aula/${item.slug}`}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                      current ? "bg-accent/10 text-accent" : "text-muted hover:bg-ink-700 hover:text-neutral-100"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {nextLesson ? (
            <Link href={`/app/aprender/aula/${nextLesson.slug}`} className="card card-hover block p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Próxima aula</p>
              <p className="mt-1 text-sm font-bold">{nextLesson.title}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                Continuar <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ) : (
            <Link href="/app/aprender" className="card card-hover block p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Fim do módulo</p>
              <p className="mt-1 text-sm font-bold">Voltar ao mapa de aprendizado</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                Explorar trilhas <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
