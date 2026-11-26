"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type {
  LessonDetail,
  LessonStatus,
  LessonSummary,
  ModuleDetail,
  Quiz,
  QuizResult,
} from "@/lib/types";
import {
  canRetryQuiz,
  canStartQuiz,
  createIdempotencyKey,
  quizSubmitMessage,
  resolveFichas,
  resolveFichasMax,
  resolvePassPercent,
} from "@/lib/learning";
import { Alert, Spinner } from "@/components/ui";

function FichasBlocked({
  slug,
  fichas,
  fichasMax,
  completed,
}: {
  slug: string;
  fichas: number | null;
  fichasMax: number | null;
  completed: boolean;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-neutral-300">
        <Ticket className="h-6 w-6" />
      </div>
      <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
        Fichas de quiz
      </p>
      <h1 className="mt-2 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">
        {completed
          ? "Revisão liberada; nova tentativa bloqueada."
          : "Você está sem fichas."}
      </h1>
      <p className="mt-3 text-[12px] leading-6 text-neutral-400">
        {completed
          ? "Sua aula está concluída e continua disponível para revisão. Com 0 fichas, não é possível iniciar outra tentativa de quiz."
          : "Se você não atingir a nota mínima, cada nova tentativa consome 1 ficha."}{" "}
        O saldo atual é <strong className="text-neutral-200">{fichas ?? 0}</strong>
        {fichasMax !== null ? ` de ${fichasMax}` : ""}. Fichas não regeneram sozinhas, e não há
        recuperação por anúncio ou Premium enquanto não existir integração real.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href={`/app/aprender/aula/${slug}`} className="btn-primary">
          Rever a aula
        </Link>
        <Link href="/app/aprender" className="btn-secondary">
          Voltar ao mapa
        </Link>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { gamification, reload } = useAppData();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonSummary | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [noFichas, setNoFichas] = useState(false);
  const idempotencyKey = useRef(createIdempotencyKey());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    setNoFichas(false);
    setResult(null);
    setAnswers({});
    setCurrent(0);
    setSubmitError(null);
    setNextLesson(null);
    idempotencyKey.current = createIdempotencyKey();

    api
      .get<LessonDetail>(`/api/v1/content/lessons/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setLesson(data);
        const [statusResult, quizResult, moduleResult] = await Promise.allSettled([
          api.get<LessonStatus>(`/api/v1/progress/lessons/${data.id}`),
          api.get<Quiz>(`/api/v1/progress/lessons/${data.id}/quiz`),
          api.get<ModuleDetail>(`/api/v1/content/modules/${data.moduleSlug}`),
        ]);
        if (!active) return;
        if (statusResult.status === "fulfilled") setStatus(statusResult.value);
        if (quizResult.status === "fulfilled") setQuiz(quizResult.value);
        else if (quizResult.reason instanceof ApiError && quizResult.reason.status === 404) setQuiz(null);
        else
          setLoadError(
            quizResult.reason instanceof Error
              ? quizResult.reason.message
              : "Não foi possível carregar o quiz.",
          );
        if (moduleResult.status === "fulfilled") {
          const following = moduleResult.value.lessons.find(
            (item) => item.order === data.order + 1,
          );
          setNextLesson(following ?? null);
        }
      })
      .catch((err) => {
        if (active) setLoadError(err instanceof ApiError ? err.message : "Aula não encontrada.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!quiz) return;
    const value = ((current + 1) / quiz.questions.length) * 100;
    window.dispatchEvent(new CustomEvent("quiz:progress", { detail: value }));
  }, [quiz, current]);

  const question = quiz?.questions[current];
  const answered = question ? answers[question.id] !== undefined : false;
  const progressLabel = useMemo(() => {
    if (!quiz) return "";
    return `Questão ${current + 1} de ${quiz.questions.length}`;
  }, [quiz, current]);

  const fichas = status?.fichas ?? resolveFichas(gamification);
  const fichasMax = status?.fichasMax ?? resolveFichasMax(gamification);
  const passPercent = resolvePassPercent(status, gamification);
  const remainingFichas = result?.fichas ?? status?.fichas ?? null;
  const retryAllowed = result
    ? canRetryQuiz({ passed: result.passed, fichas: remainingFichas })
    : false;

  async function submitAll() {
    if (!lesson || !quiz) return;
    if (Object.keys(answers).length !== quiz.questions.length) {
      setSubmitError("Responda todas as questões antes de enviar.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await api.post<QuizResult>(
        `/api/v1/progress/lessons/${lesson.id}/quiz`,
        {
          answers: quiz.questions.map((item) => ({
            questionId: item.id,
            selectedIndex: answers[item.id],
          })),
        },
        { headers: { "Idempotency-Key": idempotencyKey.current } },
      );
      setResult(response);
      await reload();
    } catch (err) {
      if (err instanceof ApiError && err.code === "NO_FICHAS") {
        setNoFichas(true);
        setSubmitError(null);
      } else {
        setSubmitError(quizSubmitMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function confirm() {
    if (!question) return;
    if (!answered) {
      setSubmitError("Escolha uma alternativa para continuar.");
      return;
    }
    setSubmitError(null);
    if (quiz && current < quiz.questions.length - 1) {
      setCurrent((value) => value + 1);
    } else {
      void submitAll();
    }
  }

  function retry() {
    idempotencyKey.current = createIdempotencyKey();
    setResult(null);
    setAnswers({});
    setCurrent(0);
    setSubmitError(null);
    setNoFichas(false);
  }

  if (loading) return <Spinner label="Carregando verificação" />;

  if (loadError && !lesson) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-[12px] text-red-200">
        {loadError}
        <Link href="/app/aprender" className="btn-secondary mt-4 inline-flex">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (!lesson) return <Spinner label="Carregando verificação" />;

  if (status && !canStartQuiz(status)) {
    if (status.videoWatched === false && !status.completed) {
      return (
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
            Verificação de conhecimento
          </p>
          <h1 className="mt-3 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">
            Assista ao vídeo primeiro.
          </h1>
          <p className="mt-3 text-[12px] leading-6 text-neutral-400">
            O quiz libera quando o vídeo da aula chega ao fim. Não existe atalho para marcar a aula
            como concluída antes disso.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href={`/app/aprender/aula/${slug}`} className="btn-primary">
              Voltar para a aula <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/app/aprender" className="btn-secondary">
              Mapa de aprendizado
            </Link>
          </div>
        </div>
      );
    }
    return <FichasBlocked slug={slug} fichas={fichas} fichasMax={fichasMax} completed={status.completed} />;
  }

  if (noFichas) {
    return (
      <FichasBlocked
        slug={slug}
        fichas={fichas}
        fichasMax={fichasMax}
        completed={status?.completed ?? false}
      />
    );
  }

  if (!quiz || !question) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
          Verificação de conhecimento
        </p>
        <h1 className="mt-3 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">
          Quiz em preparação.
        </h1>
        <p className="mt-3 text-[12px] leading-6 text-neutral-400">
          Esta aula ainda não tem perguntas publicadas. Continue pelo mapa de aprendizado.
        </p>
        <Link href="/app/aprender" className="btn-secondary mt-6">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (result) {
    const passed = result.passed;
    const following = nextLesson;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-white/[0.07] bg-[#111111] p-6 text-center sm:p-8">
          <div
            className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
              passed ? "bg-accent text-ink-950" : "bg-white/[0.05] text-neutral-400"
            }`}
          >
            {passed ? <Trophy className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Resultado
          </p>
          <h1 className="mt-2 text-[30px] font-medium tracking-[-0.04em] text-neutral-100">
            {passed ? "Você entendeu." : "Quase lá."}
          </h1>
          <p className="mt-2 text-[13px] text-neutral-400">
            {result.score} de {result.maxScore} · {result.percent}% de acerto · mínimo {passPercent}%
          </p>
          {result.xpAwarded > 0 && (
            <p className="mt-2 text-[12px] font-semibold text-accent">+{result.xpAwarded} XP</p>
          )}
          {passed && result.lessonCompleted && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Aula concluída
            </p>
          )}
          {passed && !result.lessonCompleted && (
            <p className="mt-2 text-[11px] text-neutral-400">
              Quiz aprovado.{" "}
              {result.videoWatched
                ? "A conclusão será registrada pelo servidor."
                : "Falta assistir ao vídeo até o fim para concluir a aula."}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="pill" title="Fichas restantes · saldo do servidor">
              <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {result.fichas} de {result.fichasMax} fichas
            </span>
            {result.idempotentReplay && (
              <span className="pill text-neutral-400">Resultado já registrado (reenvio idempotente)</span>
            )}
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {passed ? (
              following ? (
                <Link href={`/app/aprender/aula/${following.slug}`} className="btn-primary">
                  Próxima aula: {following.title} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href={`/app/aprender/modulo/${lesson.moduleSlug}`} className="btn-primary">
                  Ver o módulo <ArrowRight className="h-4 w-4" />
                </Link>
              )
            ) : (
              <button
                type="button"
                onClick={retry}
                className="btn-secondary"
                disabled={!retryAllowed}
                aria-describedby="retry-ajuda"
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
            )}
            <Link href={`/app/aprender/aula/${slug}`} className="btn-ghost">
              Voltar para a aula
            </Link>
          </div>
          {!passed && (
            <p id="retry-ajuda" className="mt-3 text-[10px] leading-5 text-neutral-500">
              {retryAllowed
                ? `Se a próxima tentativa não atingir a nota mínima, ela consome 1 ficha. Restam ${remainingFichas ?? "—"}.`
                : "Você usou a última ficha nesta tentativa. Continue revisando a aula; novas tentativas exigem saldo no servidor."}
            </p>
          )}
        </div>

        <section className="mt-5 rounded-xl border border-white/[0.07] bg-[#111111] p-5 sm:p-6" aria-labelledby="feedback-titulo">
          <h2 id="feedback-titulo" className="text-[13px] font-semibold text-neutral-100">
            Feedback por questão
          </h2>
          <ol className="mt-4 space-y-3">
            {quiz.questions.map((item, index) => {
              const itemResult = result.results.find((entry) => entry.questionId === item.id);
              const selected = itemResult?.selectedIndex;
              const correctIndex = itemResult?.correctIndex;
              const correct = itemResult?.correct === true;
              return (
                <li key={item.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <div className="flex items-start gap-2.5">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-neutral-200">
                        {index + 1}. {item.question}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        Sua resposta:{" "}
                        <span className={correct ? "text-emerald-300" : "text-red-300"}>
                          {selected !== undefined ? item.options[selected] : "—"}
                        </span>
                      </p>
                      {!correct && correctIndex !== undefined && (
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Resposta correta:{" "}
                          <span className="text-emerald-300">{item.options[correctIndex]}</span>
                        </p>
                      )}
                      <span className="sr-only">{correct ? "Questão correta" : "Questão incorreta"}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
        Hora de praticar
      </p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h1
          id="quiz-question"
          className="text-[26px] font-medium leading-[1.2] tracking-[-0.035em] text-neutral-100 sm:text-[31px]"
        >
          {question.question}
        </h1>
        <span className="hidden shrink-0 text-[10px] text-neutral-500 sm:block">{progressLabel}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-neutral-500">
        <span className="pill" title="Fichas restantes · saldo do servidor">
          <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {fichas !== null
            ? `${fichas}${fichasMax !== null ? ` de ${fichasMax}` : ""} fichas`
            : "fichas indisponíveis"}
        </span>
        <span>
          Obtenha pelo menos {passPercent}% para concluir. Cada tentativa abaixo da nota mínima consome 1 ficha.
        </span>
      </div>

      {submitError && (
        <Alert className="mt-4" tone="error">
          {submitError}
          {submitError.includes("vídeo") && (
            <Link href={`/app/aprender/aula/${slug}`} className="ml-1 font-semibold text-accent underline underline-offset-4">
              Ir para a aula
            </Link>
          )}
        </Alert>
      )}

      <div className="mt-7 space-y-2" role="group" aria-labelledby="quiz-question">
        {question.options.map((option, index) => {
          const selected = answers[question.id] === index;
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              aria-pressed={selected}
              onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: index }))}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[13px] transition ${
                selected
                  ? "border-accent/60 bg-accent/[0.06] text-neutral-100"
                  : "border-white/[0.08] bg-[#111111] text-neutral-300 hover:border-white/20 hover:bg-[#151515]"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[10px] font-semibold ${
                  selected
                    ? "border-accent bg-accent text-ink-950"
                    : "border-white/10 bg-white/[0.03] text-neutral-500"
                }`}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          disabled={current === 0}
          className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] text-neutral-400 transition hover:border-white/20 hover:text-neutral-100 disabled:opacity-30"
          aria-label="Questão anterior"
          aria-disabled={current === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 sm:hidden">{progressLabel}</span>
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="btn-primary min-w-[180px]"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {current < quiz.questions.length - 1 ? "Confirmar resposta" : "Enviar respostas"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCurrent((value) => Math.min(quiz.questions.length - 1, value + 1))}
          disabled={current === quiz.questions.length - 1}
          className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] text-neutral-400 transition hover:border-white/20 hover:text-neutral-100 disabled:opacity-30"
          aria-label="Próxima questão"
          aria-disabled={current === quiz.questions.length - 1}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] text-neutral-600">
        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
        Obtenha pelo menos {passPercent}% para ganhar XP. Este quiz é educativo e não constitui recomendação de investimento.
      </div>
    </div>
  );
}
