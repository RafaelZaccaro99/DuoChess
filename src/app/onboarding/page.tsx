"use client";

/**
 * Onboarding: seis perguntas e a escolha da porta de entrada.
 *
 * A regra que o spec impõe e que a interface respeita: não estimar nível
 * avançado apenas com múltipla escolha. Quem se declara acima de 1400 recebe um
 * aviso e a recomendação de dez partidas de 15+10 — e o resultado é marcado como
 * não confiável em vez de virar trilha.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/components/ProgressProvider";
import {
  declaresAdvancedExperience,
  recordOnboardingAnswers,
  type EntryPoint,
  type OnboardingAnswers,
} from "@/domain/session";
import { registrarDiagnostico } from "@/app/actions";
import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/Meters";

interface Question {
  key: keyof OnboardingAnswers;
  title: string;
  help?: string;
  options: Array<{ value: string; label: string; note?: string }>;
}

const QUESTIONS: Question[] = [
  {
    key: "experience",
    title: "Qual é a sua experiência com xadrez?",
    options: [
      { value: "NUNCA_JOGUEI", label: "Nunca joguei" },
      { value: "REGRAS", label: "Sei as regras, jogo muito pouco" },
      { value: "CASUAL", label: "Jogo online com frequência" },
      { value: "CLUBE", label: "Jogo em clube ou estudo com regularidade" },
      { value: "TORNEIO", label: "Jogo torneios oficiais" },
    ],
  },
  {
    key: "onlineRating",
    title: "Se você joga online, qual é o seu rating aproximado?",
    help: "Rating online mede desempenho dentro de uma plataforma. Não é o mesmo que competência nem que rating oficial.",
    options: [
      { value: "NAO_JOGO", label: "Não jogo online" },
      { value: "ATE_800", label: "Até 800" },
      { value: "800_1200", label: "800 a 1200" },
      { value: "1200_1600", label: "1200 a 1600" },
      { value: "ACIMA_1600", label: "Acima de 1600" },
    ],
  },
  {
    key: "tournaments",
    title: "Você já jogou em torneio oficial?",
    options: [
      { value: "NUNCA", label: "Nunca" },
      { value: "ALGUNS", label: "Já joguei alguns" },
      { value: "REGULAR", label: "Jogo regularmente" },
      { value: "FIDE", label: "Tenho rating FIDE" },
    ],
  },
  {
    key: "goal",
    title: "O que você quer alcançar?",
    options: [
      { value: "APRENDER_REGRAS", label: "Aprender a jogar de verdade" },
      { value: "SUBIR_RATING", label: "Parar de estagnar e subir de nível" },
      { value: "TORNEIO", label: "Competir em torneios" },
      { value: "TITULO", label: "Buscar um título" },
    ],
  },
  {
    key: "weeklyMinutes",
    title: "Quanto tempo por semana você consegue dedicar?",
    help: "Usamos isso para dimensionar a sessão diária e o teto da fila de revisão. Prometer mais do que cabe na sua semana é o jeito mais rápido de você abandonar.",
    options: [
      { value: "70", label: "Cerca de 10 min por dia" },
      { value: "105", label: "Cerca de 15 min por dia" },
      { value: "210", label: "Cerca de 30 min por dia" },
      { value: "420", label: "Uma hora por dia ou mais" },
    ],
  },
  {
    key: "rankings",
    title: "Quer participar de ligas e rankings?",
    help: "Você pode desligar rankings a qualquer momento nas configurações. Competição social ajuda algumas pessoas e atrapalha outras.",
    options: [
      { value: "true", label: "Sim, competir me motiva" },
      { value: "false", label: "Não, prefiro estudar sem ranking" },
    ],
  },
];

const ENTRY_POINTS: Array<{
  value: EntryPoint;
  label: string;
  time: string;
  description: string;
}> = [
  {
    value: "FROM_ZERO",
    label: "Começar do zero",
    time: "~1 min",
    description: "Nunca joguei, ou joguei muito pouco. Vamos do tabuleiro em diante.",
  },
  {
    value: "QUICK",
    label: "Teste rápido",
    time: "~5 min",
    description: "Algumas posições para estimar por onde começar. Trilha aproximada.",
  },
  {
    value: "FULL",
    label: "Diagnóstico completo",
    time: "~25 min",
    description: "Regras, tática e análise avaliadas agora — as demais competências entram conforme o conteúdo for publicado.",
  },
  {
    value: "PGN_IMPORT",
    label: "Importar partidas",
    time: "~2 min",
    description: "Traga seu PGN. Analisamos suas decisões reais em vez de perguntar sobre elas.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { state, ready, update } = useProgress();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isEntryStep = step === QUESTIONS.length;
  const question = QUESTIONS[step];

  const declaresAdvanced = declaresAdvancedExperience({
    experience: answers.experience ?? "NUNCA_JOGUEI",
    tournaments: answers.tournaments ?? "NUNCA",
    onlineRating: answers.onlineRating ?? "NAO_JOGO",
    goal: answers.goal ?? "APRENDER_REGRAS",
    weeklyMinutes: Number(answers.weeklyMinutes ?? 105),
    rankings: answers.rankings !== "false",
  });

  function choose(value: string) {
    if (!question) return;
    setAnswers((previous) => ({ ...previous, [question.key]: value }));
    setStep((s) => s + 1);
  }

  function finish(entryPoint: EntryPoint) {
    const parsed: OnboardingAnswers = {
      experience: answers.experience ?? "NUNCA_JOGUEI",
      tournaments: answers.tournaments ?? "NUNCA",
      onlineRating: answers.onlineRating ?? "NAO_JOGO",
      goal: answers.goal ?? "APRENDER_REGRAS",
      weeklyMinutes: Number(answers.weeklyMinutes ?? 105),
      rankings: answers.rankings !== "false",
    };
    const now = new Date().toISOString();
    update((previous) => recordOnboardingAnswers(previous, parsed, entryPoint, now));

    if (entryPoint === "QUICK" || entryPoint === "FULL") {
      router.push(`/onboarding/diagnostico?modo=${entryPoint.toLowerCase()}`);
      return;
    }
    if (entryPoint === "PGN_IMPORT") {
      void registrarDiagnostico("PGN_IMPORT", parsed, { estimated: {}, ratingBand: "0-800", reliable: false });
      router.push("/onboarding/importar");
      return;
    }
    void registrarDiagnostico("FROM_ZERO", parsed, { estimated: {}, ratingBand: "0-800", reliable: true });
    router.push("/mapa");
  }

  if (!ready || !state) {
    return <main className="mx-auto max-w-lg px-5 py-20 text-ink-muted">Carregando…</main>;
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-10">
      <div className="mb-8">
        <ProgressBar
          value={step}
          max={QUESTIONS.length}
          tone="brand"
          label={`Passo ${step + 1} de ${QUESTIONS.length + 1}`}
        />
        <p className="mt-2 text-xs text-ink-faint">
          {isEntryStep ? "Último passo" : `${step + 1} de ${QUESTIONS.length}`}
        </p>
      </div>

      {question && (
        <>
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{question.title}</h1>
          {question.help && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{question.help}</p>
          )}

          <ul className="mt-6 space-y-2.5">
            {question.options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => choose(option.value)}
                  className={cn(
                    "w-full rounded-xl2 border border-line bg-surface-raised px-4 py-3.5 text-left",
                    "transition-colors hover:border-brand hover:bg-brand-soft",
                  )}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  {option.note && (
                    <span className="mt-1 block text-xs text-ink-muted">{option.note}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {isEntryStep && (
        <>
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            Por onde você quer começar?
          </h1>

          {declaresAdvanced && (
            <div className="mt-5 rounded-xl2 border border-warn/40 bg-warn/10 p-4">
              <p className="text-sm font-semibold text-warn">
                Não estimamos nível avançado com múltipla escolha.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Você declarou experiência competitiva. Perguntas fechadas não medem cálculo nem
                decisão sob relógio. Para uma trilha confiável, jogue dez partidas de 15+10 sem
                assistência e importe os PGNs — é a única forma honesta de avaliar esse nível.
              </p>
            </div>
          )}

          <ul className="mt-6 space-y-2.5">
            {ENTRY_POINTS.map((entry) => (
              <li key={entry.value}>
                <button
                  type="button"
                  onClick={() => finish(entry.value)}
                  className="w-full rounded-xl2 border border-line bg-surface-raised px-4 py-4 text-left transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">{entry.label}</span>
                    <span className="shrink-0 text-xs text-ink-faint">{entry.time}</span>
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-ink-muted">
                    {entry.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-8 text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Voltar
        </button>
      )}
    </main>
  );
}
