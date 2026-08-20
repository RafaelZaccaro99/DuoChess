"use client";

/**
 * Editor de exercício (A7).
 *
 * `id: "novo"` cria; qualquer outro valor edita um rascunho existente.
 *
 * Duas velocidades de propósito: as checagens baratas (estrutura, duplicata,
 * SOURCE_REVIEW) rodam reativas, debounced, enquanto o admin digita — sem
 * subir engine. ENGINE_REVIEW só roda no clique explícito de "Verificar e
 * publicar", com estado de carregamento visível: é deliberadamente lento (o
 * próprio `verify-engine.ts` já diz isso), não deve rodar a cada tecla.
 */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { StatusBar } from "@/components/ui/StatusBar";
import { Board } from "@/components/board/Board";
import {
  exercicioAutoradoPorId,
  publicarExercicioAction,
  salvarRascunhoDeExercicio,
  verificarRascunhoDeExercicio,
} from "@/app/actions";
import type { PublishFinding } from "@/lib/content-server";
import { COURSE } from "@/content";
import { buildIndex } from "@/domain/curriculum";
import { EXERCISE_TYPES, lessonPhaseSchema, type ExerciseInput, type ExerciseAnswer } from "@/content/schema";
import { ERROR_CAUSES } from "@/domain/errors/taxonomy";
import { sourcesFor } from "@/content/bibliografia";

const INDEX = buildIndex(COURSE);
const FASES = lessonPhaseSchema.options;

const ROTULO_TIPO: Record<(typeof EXERCISE_TYPES)[number], string> = {
  LEGAL_MOVES: "Lances legais",
  ATTACKED_SQUARES: "Casas atacadas",
  SQUARE_COLOR: "Cor da casa",
  BEST_MOVE: "Melhor lance",
  CHECK_ESCAPE: "Saída de xeque",
  CAPTURE: "Captura",
  PIECE_VALUE: "Valor de peça",
  NOTATION_READ: "Ler notação",
  NOTATION_WRITE: "Escrever notação",
  IS_MATE_OR_STALEMATE: "Mate ou afogamento",
};

type TipoDeResposta = "squares" | "moves" | "color" | "choice";

function tipoDeResposta(type: (typeof EXERCISE_TYPES)[number]): TipoDeResposta {
  if (type === "LEGAL_MOVES" || type === "ATTACKED_SQUARES") return "squares";
  if (type === "BEST_MOVE" || type === "CHECK_ESCAPE" || type === "CAPTURE") return "moves";
  if (type === "SQUARE_COLOR") return "color";
  return "choice";
}

interface PredictableErrorForm {
  answer: string;
  cause: string;
  explanation: string;
}

interface FormState {
  slug: string;
  skillIds: string[];
  type: (typeof EXERCISE_TYPES)[number];
  phase: (typeof FASES)[number];
  fen: string;
  sideToMove: "w" | "b";
  prompt: string;
  answerSquares: string;
  answerMoves: string;
  answerColor: "light" | "dark";
  answerChoice: string;
  difficulty: number;
  ratingHint: number;
  predictableErrors: PredictableErrorForm[];
  perceived: string;
  threat: string;
  bestDefense: string;
  reason: string;
  pattern: string;
  transferableRule: string;
  hint1: string;
  hint2: string;
  hint3: string;
  expectedSeconds: number;
  points: number;
  sources: string[];
  verification: "BEST" | "RULE_EXECUTION";
}

const FORM_VAZIO: FormState = {
  slug: "",
  skillIds: [],
  type: "BEST_MOVE",
  phase: "INDEPENDENT",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  sideToMove: "w",
  prompt: "",
  answerSquares: "",
  answerMoves: "",
  answerColor: "light",
  answerChoice: "",
  difficulty: 5,
  ratingHint: 400,
  predictableErrors: [{ answer: "", cause: ERROR_CAUSES[0], explanation: "" }],
  perceived: "",
  threat: "",
  bestDefense: "",
  reason: "",
  pattern: "",
  transferableRule: "",
  hint1: "",
  hint2: "",
  hint3: "",
  expectedSeconds: 30,
  points: 10,
  sources: [],
  verification: "BEST",
};

function listaDeCasas(csv: string): string[] {
  return csv
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function construirInput(form: FormState): ExerciseInput {
  let acceptedAnswer: ExerciseAnswer;
  const tr = tipoDeResposta(form.type);
  if (tr === "squares") acceptedAnswer = { squares: listaDeCasas(form.answerSquares) };
  else if (tr === "moves") acceptedAnswer = { moves: listaDeCasas(form.answerMoves) };
  else if (tr === "color") acceptedAnswer = { color: form.answerColor };
  else acceptedAnswer = { choice: form.answerChoice };

  return {
    slug: form.slug,
    phase: form.phase,
    type: form.type,
    prompt: form.prompt,
    fen: form.fen,
    sideToMove: form.sideToMove,
    skillIds: form.skillIds,
    difficulty: form.difficulty,
    ratingHint: form.ratingHint,
    acceptedAnswer,
    predictableErrors: form.predictableErrors.filter((p) => p.answer.trim().length > 0),
    explanation: {
      perceived: form.perceived,
      threat: form.threat,
      bestDefense: form.bestDefense,
      reason: form.reason,
      pattern: form.pattern,
      transferableRule: form.transferableRule,
    },
    hints: [form.hint1, form.hint2, form.hint3],
    expectedSeconds: form.expectedSeconds,
    points: form.points,
    sources: form.sources,
    verification: form.verification,
  };
}

const ROTULO_GATE: Record<PublishFinding["gate"], string> = {
  SOURCE_REVIEW: "Fonte",
  ENGINE_REVIEW: "Motor",
};

function Achado({ f }: { f: PublishFinding }) {
  const tom = f.severity === "BLOQUEIA" ? "text-danger" : "text-warn";
  const marcador = f.severity === "BLOQUEIA" ? "✗" : "!";
  return (
    <li className={`text-xs leading-relaxed ${tom}`}>
      {marcador} [{ROTULO_GATE[f.gate]}] {f.message}
    </li>
  );
}

export default function EditorDeExercicioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useProgress();
  const ehNovo = params.id === "novo";

  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [exerciseId, setExerciseId] = useState<string | undefined>(ehNovo ? undefined : params.id);
  const [carregado, setCarregado] = useState(ehNovo);
  const [achadosBaratos, setAchadosBaratos] = useState<PublishFinding[]>([]);
  const [achadosPublicacao, setAchadosPublicacao] = useState<PublishFinding[] | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    if (ehNovo || user?.role !== "ADMIN") return;
    exercicioAutoradoPorId(params.id).then((r) => {
      if (r && "slug" in r) {
        setForm({
          slug: r.slug,
          skillIds: r.skillIds,
          type: r.type,
          phase: r.phase,
          fen: r.fen,
          sideToMove: r.sideToMove,
          prompt: r.prompt,
          answerSquares: "squares" in r.acceptedAnswer ? r.acceptedAnswer.squares.join(", ") : "",
          answerMoves: "moves" in r.acceptedAnswer ? r.acceptedAnswer.moves.join(", ") : "",
          answerColor: "color" in r.acceptedAnswer ? r.acceptedAnswer.color : "light",
          answerChoice: "choice" in r.acceptedAnswer ? r.acceptedAnswer.choice : "",
          difficulty: r.difficulty,
          ratingHint: r.ratingHint,
          predictableErrors: r.predictableErrors.length
            ? r.predictableErrors
            : [{ answer: "", cause: ERROR_CAUSES[0], explanation: "" }],
          perceived: r.explanation.perceived,
          threat: r.explanation.threat,
          bestDefense: r.explanation.bestDefense,
          reason: r.explanation.reason,
          pattern: r.explanation.pattern,
          transferableRule: r.explanation.transferableRule,
          hint1: r.hints[0],
          hint2: r.hints[1],
          hint3: r.hints[2],
          expectedSeconds: r.expectedSeconds,
          points: r.points,
          sources: r.sources,
          verification: r.verification,
        });
      }
      setCarregado(true);
    });
  }, [ehNovo, params.id, user]);

  // Checagens baratas, debounced — sem subir engine.
  useEffect(() => {
    if (!carregado || user?.role !== "ADMIN") return;
    const timer = setTimeout(() => {
      verificarRascunhoDeExercicio(construirInput(form)).then((r) => {
        setAchadosBaratos(Array.isArray(r) ? r : []);
      });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, carregado, user]);

  const competenciasDasHabilidades = useMemo(
    () => [...new Set(form.skillIds.map((id) => INDEX.skills.get(id)?.competency).filter(Boolean))],
    [form.skillIds],
  );
  const fontesDisponiveis = useMemo(
    () => [...new Map(competenciasDasHabilidades.flatMap((c) => sourcesFor(c!, form.ratingHint)).map((s) => [s.id, s])).values()],
    [competenciasDasHabilidades, form.ratingHint],
  );

  const salvarRascunho = async () => {
    setSalvando(true);
    setMensagem(null);
    try {
      const r = await salvarRascunhoDeExercicio(construirInput(form), exerciseId);
      if (!("exerciseId" in r)) {
        setMensagem(r.error ?? "Não foi possível salvar.");
        return;
      }
      setExerciseId(r.exerciseId);
      setMensagem("Rascunho salvo.");
      if (ehNovo) router.replace(`/admin/exercicios/${r.exerciseId}`);
    } finally {
      setSalvando(false);
    }
  };

  const verificarEPublicar = async () => {
    setPublicando(true);
    setMensagem(null);
    setAchadosPublicacao(null);
    let novoId: string | undefined;
    try {
      const salvo = await salvarRascunhoDeExercicio(construirInput(form), exerciseId);
      if (!("exerciseId" in salvo)) {
        setMensagem(salvo.error ?? "Não foi possível salvar.");
        return;
      }
      novoId = salvo.exerciseId;
      setExerciseId(salvo.exerciseId);

      // A navegação só acontece DEPOIS da publicação terminar: trocar a URL no
      // meio do fluxo (com router.replace) cancelava a requisição da action
      // seguinte ainda em voo — o clique parecia concluir, mas o servidor nunca
      // chegava a rodar publicarExercicio, e o item ficava para sempre em DRAFT.
      const resultado = await publicarExercicioAction(salvo.exerciseId);
      if (!("findings" in resultado)) {
        setMensagem(resultado.error ?? "Não foi possível publicar.");
        return;
      }
      setAchadosPublicacao(resultado.findings);
      setMensagem(resultado.ok ? "Publicado." : "Bloqueado — veja os achados abaixo.");
    } finally {
      setPublicando(false);
      if (ehNovo && novoId) router.replace(`/admin/exercicios/${novoId}`);
    }
  };

  if (!ready) {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10 text-ink-muted">Carregando…</main>
      </>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <>
        <StatusBar />
        <main className="mx-auto max-w-2xl px-5 py-10">
          <div className="card">
            <p className="text-sm font-semibold">Esta área exige conta de administrador.</p>
          </div>
        </main>
      </>
    );
  }

  const tr = tipoDeResposta(form.type);
  const todosAchados = [...achadosBaratos, ...(achadosPublicacao ?? [])];

  return (
    <>
      <StatusBar />
      <main className="mx-auto max-w-5xl px-5 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-ink-muted hover:text-ink" aria-label="Voltar à fila">
            ←
          </Link>
          <h1 className="text-xl font-bold tracking-tight">{ehNovo ? "Novo exercício" : `Editar: ${form.slug}`}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Esquerda: formulário */}
          <div className="space-y-4">
            <div className="card space-y-3">
              <label className="block text-xs font-semibold text-ink-muted">
                Slug
                <input
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="ex.: r1.novo-exercicio.01"
                />
              </label>

              <label className="block text-xs font-semibold text-ink-muted">
                Habilidades
                <select
                  multiple
                  className="mt-1 h-32 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  value={form.skillIds}
                  onChange={(e) =>
                    setForm({ ...form, skillIds: [...e.target.selectedOptions].map((o) => o.value) })
                  }
                >
                  {[...INDEX.skills.values()].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.id})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-ink-muted">
                  Tipo
                  <select
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as FormState["type"] })}
                  >
                    {EXERCISE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ROTULO_TIPO[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-ink-muted">
                  Fase
                  <select
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.phase}
                    onChange={(e) => setForm({ ...form, phase: e.target.value as FormState["phase"] })}
                  >
                    {FASES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-xs font-semibold text-ink-muted">
                FEN
                <input
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 font-mono text-xs"
                  value={form.fen}
                  onChange={(e) => setForm({ ...form, fen: e.target.value })}
                />
              </label>

              <label className="block text-xs font-semibold text-ink-muted">
                Lado a jogar
                <select
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  value={form.sideToMove}
                  onChange={(e) => setForm({ ...form, sideToMove: e.target.value as "w" | "b" })}
                >
                  <option value="w">Brancas</option>
                  <option value="b">Pretas</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-ink-muted">
                Enunciado
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                />
              </label>
            </div>

            <div className="card space-y-3">
              <p className="label">Gabarito</p>
              {tr === "squares" && (
                <label className="block text-xs font-semibold text-ink-muted">
                  Casas aceitas (separadas por vírgula)
                  <input
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.answerSquares}
                    onChange={(e) => setForm({ ...form, answerSquares: e.target.value })}
                    placeholder="e4, e5, d4"
                  />
                </label>
              )}
              {tr === "moves" && (
                <label className="block text-xs font-semibold text-ink-muted">
                  Lances aceitos, em SAN (separados por vírgula)
                  <input
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.answerMoves}
                    onChange={(e) => setForm({ ...form, answerMoves: e.target.value })}
                    placeholder="Cc6, Cf6"
                  />
                </label>
              )}
              {tr === "color" && (
                <label className="block text-xs font-semibold text-ink-muted">
                  Cor da casa
                  <select
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.answerColor}
                    onChange={(e) => setForm({ ...form, answerColor: e.target.value as "light" | "dark" })}
                  >
                    <option value="light">Clara</option>
                    <option value="dark">Escura</option>
                  </select>
                </label>
              )}
              {tr === "choice" && (
                <label className="block text-xs font-semibold text-ink-muted">
                  Resposta
                  <input
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.answerChoice}
                    onChange={(e) => setForm({ ...form, answerChoice: e.target.value })}
                  />
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-ink-muted">
                  Dificuldade (1–10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-muted">
                  Rating de referência
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.ratingHint}
                    onChange={(e) => setForm({ ...form, ratingHint: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-ink-muted">
                Como o motor deve julgar
                <select
                  className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  value={form.verification}
                  onChange={(e) => setForm({ ...form, verification: e.target.value as FormState["verification"] })}
                >
                  <option value="BEST">Melhor lance objetivo (BEST)</option>
                  <option value="RULE_EXECUTION">Execução de regra (RULE_EXECUTION)</option>
                </select>
              </label>
            </div>

            <div className="card space-y-3">
              <p className="label">Erros previsíveis</p>
              {form.predictableErrors.map((pe, i) => (
                <div key={i} className="space-y-2 rounded-xl2 border border-line p-2">
                  <input
                    className="w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    placeholder="Resposta errada esperada"
                    value={pe.answer}
                    onChange={(e) => {
                      const next = [...form.predictableErrors];
                      next[i] = { ...next[i]!, answer: e.target.value };
                      setForm({ ...form, predictableErrors: next });
                    }}
                  />
                  <select
                    className="w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={pe.cause}
                    onChange={(e) => {
                      const next = [...form.predictableErrors];
                      next[i] = { ...next[i]!, cause: e.target.value };
                      setForm({ ...form, predictableErrors: next });
                    }}
                  >
                    {ERROR_CAUSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    placeholder="Por que tenta e por que falha"
                    value={pe.explanation}
                    onChange={(e) => {
                      const next = [...form.predictableErrors];
                      next[i] = { ...next[i]!, explanation: e.target.value };
                      setForm({ ...form, predictableErrors: next });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() =>
                  setForm({
                    ...form,
                    predictableErrors: [
                      ...form.predictableErrors,
                      { answer: "", cause: ERROR_CAUSES[0], explanation: "" },
                    ],
                  })
                }
              >
                + erro previsível
              </button>
            </div>

            <div className="card space-y-3">
              <p className="label">Explicação (os 6 campos são obrigatórios)</p>
              {(
                [
                  ["perceived", "O que o aluno parece ter visto"],
                  ["threat", "A ameaça real"],
                  ["bestDefense", "A melhor defesa"],
                  ["reason", "Por que o gabarito é o certo"],
                  ["pattern", "O padrão em jogo"],
                  ["transferableRule", "A regra transferível"],
                ] as const
              ).map(([campo, rotulo]) => (
                <label key={campo} className="block text-xs font-semibold text-ink-muted">
                  {rotulo}
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form[campo]}
                    onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                  />
                </label>
              ))}
            </div>

            <div className="card space-y-3">
              <p className="label">Dicas (3, progressivas)</p>
              {(["hint1", "hint2", "hint3"] as const).map((campo, i) => (
                <input
                  key={campo}
                  className="w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                  placeholder={`Dica ${i + 1}`}
                  value={form[campo]}
                  onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                />
              ))}

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-ink-muted">
                  Tempo esperado (s)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.expectedSeconds}
                    onChange={(e) => setForm({ ...form, expectedSeconds: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs font-semibold text-ink-muted">
                  Pontos
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl2 border border-line-strong bg-surface p-2 text-sm"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink-muted">
                  Fontes (além das já herdadas da habilidade)
                </p>
                {fontesDisponiveis.length === 0 && (
                  <p className="mt-1 text-xs text-ink-faint">
                    Escolha ao menos uma habilidade para ver fontes adequadas.
                  </p>
                )}
                <div className="mt-1 space-y-1">
                  {fontesDisponiveis.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-xs text-ink-muted">
                      <input
                        type="checkbox"
                        checked={form.sources.includes(s.id)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sources: e.target.checked
                              ? [...form.sources, s.id]
                              : form.sources.filter((id) => id !== s.id),
                          })
                        }
                      />
                      {s.author} — {s.title}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Direita: preview + checklist */}
          <div className="space-y-4">
            <div className="card">
              <Board fen={form.fen} mode="none" />
            </div>

            <div className="card space-y-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost" onClick={salvarRascunho} disabled={salvando}>
                  {salvando ? "Salvando…" : "Salvar rascunho"}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={verificarEPublicar}
                  disabled={publicando}
                >
                  {publicando ? "Consultando o motor…" : "Verificar e publicar"}
                </button>
              </div>

              {mensagem && <p className="text-sm font-semibold">{mensagem}</p>}

              <div>
                <p className="label">Checklist</p>
                {todosAchados.length === 0 && (
                  <p className="mt-1 text-xs text-ok">✓ nenhum problema encontrado até agora.</p>
                )}
                <ul className="mt-1 space-y-1">
                  {todosAchados.map((f, i) => (
                    <Achado key={i} f={f} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
