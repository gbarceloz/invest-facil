"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { api, ApiError } from "@/lib/api";
import type { LessonDetail, LessonStatus, Quiz, QuizResult } from "@/lib/types";
import { Alert, Spinner } from "@/components/ui";

export default function QuizPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { reload } = useAppData();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<LessonStatus | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get<LessonDetail>(`/api/v1/content/lessons/${slug}`)
      .then(async (data) => {
        if (!active) return;
        setLesson(data);
        const [statusResult, quizResult] = await Promise.allSettled([
          api.get<LessonStatus>(`/api/v1/progress/lessons/${data.id}`),
          api.get<Quiz>(`/api/v1/progress/lessons/${data.id}/quiz`),
        ]);
        if (!active) return;
        if (statusResult.status === "fulfilled") setStatus(statusResult.value);
        if (quizResult.status === "fulfilled") setQuiz(quizResult.value);
        else if (quizResult.reason instanceof ApiError && quizResult.reason.status === 404) setQuiz(null);
        else setError(quizResult.reason instanceof Error ? quizResult.reason.message : "Não foi possível carregar o quiz.");
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Aula não encontrada.");
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
    const percent = ((current + 1) / quiz.questions.length) * 100;
    window.dispatchEvent(new CustomEvent("quiz:progress", { detail: percent }));
  }, [quiz, current]);

  const question = quiz?.questions[current];
  const answered = question ? answers[question.id] !== undefined : false;
  const progressLabel = useMemo(() => {
    if (!quiz) return "";
    return `Questão ${current + 1} de ${quiz.questions.length}`;
  }, [quiz, current]);

  async function submitAll() {
    if (!lesson || !quiz) return;
    if (Object.keys(answers).length !== quiz.questions.length) {
      setError("Responda todas as questões antes de enviar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post<QuizResult>(`/api/v1/progress/lessons/${lesson.id}/quiz`, {
        answers: quiz.questions.map((item) => ({
          questionId: item.id,
          selectedIndex: answers[item.id],
        })),
      });
      setResult(response);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar o quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  function confirm() {
    if (!question) return;
    if (!answered) {
      setError("Escolha uma alternativa para continuar.");
      return;
    }
    setError(null);
    if (quiz && current < quiz.questions.length - 1) {
      setCurrent((value) => value + 1);
    } else {
      void submitAll();
    }
  }

  if (loading) return <Spinner label="Carregando verificação" />;

  if (error && !lesson) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-[12px] text-red-200">
        {error}
        <Link href="/app/aprender" className="btn-secondary mt-4 inline-flex">Voltar ao mapa</Link>
      </div>
    );
  }

  if (status && !status.completed) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">Verificação de conhecimento</p>
        <h1 className="mt-3 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">Conclua a aula primeiro.</h1>
        <p className="mt-3 text-[12px] leading-6 text-neutral-400">
          O quiz é liberado depois que você marca a aula como concluída.
        </p>
        <Link href={`/app/aprender/aula/${slug}`} className="btn-primary mt-6">
          Voltar para a aula <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">Verificação de conhecimento</p>
        <h1 className="mt-3 text-[26px] font-medium tracking-[-0.035em] text-neutral-100">Quiz em preparação.</h1>
        <p className="mt-3 text-[12px] leading-6 text-neutral-400">
          Esta aula ainda não tem perguntas publicadas. Continue pelo mapa de aprendizado.
        </p>
        <Link href="/app/aprender" className="btn-secondary mt-6">Voltar ao mapa</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-white/[0.07] bg-[#111111] p-6 text-center sm:p-8">
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${result.passed ? "bg-accent text-ink-950" : "bg-white/[0.05] text-neutral-400"}`}>
            {result.passed ? <Trophy className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Resultado</p>
          <h1 className="mt-2 text-[30px] font-medium tracking-[-0.04em] text-neutral-100">
            {result.passed ? "Você entendeu." : "Quase lá."}
          </h1>
          <p className="mt-2 text-[13px] text-neutral-400">
            {result.score} de {result.maxScore} · {result.percent}% de acerto
          </p>
          {result.xpAwarded > 0 && (
            <p className="mt-2 text-[12px] font-semibold text-accent">+{result.xpAwarded} XP</p>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setAnswers({});
                setCurrent(0);
              }}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </button>
            <Link href={`/app/aprender/aula/${slug}`} className="btn-primary">
              Voltar para a aula <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">Agora prove que entendeu</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.035em] text-neutral-100 sm:text-[31px]">
          {question.question}
        </h1>
        <span className="hidden shrink-0 text-[10px] text-neutral-500 sm:block">{progressLabel}</span>
      </div>

      {error && <Alert className="mt-4">{error}</Alert>}

      <div className="mt-7 space-y-2">
        {question.options.map((option, index) => {
          const selected = answers[question.id] === index;
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: index }))}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[13px] transition ${
                selected
                  ? "border-accent/60 bg-accent/[0.06] text-neutral-100"
                  : "border-white/[0.08] bg-[#111111] text-neutral-300 hover:border-white/20 hover:bg-[#151515]"
              }`}
            >
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[10px] font-semibold ${selected ? "border-accent bg-accent text-ink-950" : "border-white/10 bg-white/[0.03] text-neutral-500"}`}>
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
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] text-neutral-600">
        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
        Acerte 70% para ganhar XP. O quiz não é uma recomendação de investimento.
      </div>
    </div>
  );
}
