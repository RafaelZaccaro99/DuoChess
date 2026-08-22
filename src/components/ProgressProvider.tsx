"use client";

/**
 * Estado do usuário no cliente.
 *
 * O provider é transporte: toda transição de estado acontece em
 * `src/domain/session`, que é puro e testado. Aqui só escolhemos onde guardar,
 * carregamos, salvamos e distribuímos.
 *
 * Dois adaptadores (ADR-005): sem conta, o progresso fica no navegador; com
 * conta, vai para o servidor e acompanha o usuário entre aparelhos. Na primeira
 * entrada, o progresso local é oferecido para importação em vez de descartado
 * em silêncio — quem estudou sem conta não pode perder o que fez.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LocalProgressRepository,
  RemoteProgressRepository,
  discardLocalProgress,
  freshProgress,
  type ProgressRepository,
} from "@/lib/storage";
import { carregarProgresso, salvarProgresso, usuarioAtual } from "@/app/actions";
import type { ProgressState } from "@/domain/session";

export interface SessionInfo {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface ProgressContextValue {
  state: ProgressState | null;
  ready: boolean;
  user: SessionInfo | null;
  storageLabel: string;
  /** Preenchido quando a última gravação falhou. Nunca falhamos em silêncio. */
  saveError: string | null;
  /** Há progresso local aguardando importação para a conta. */
  pendingImport: ProgressState | null;
  update(fn: (previous: ProgressState) => ProgressState): void;
  reset(): void;
  importLocal(): void;
  dismissImport(): void;
  /**
   * Recarrega a sessão a partir do servidor. `entrar`/`registrar` mudam o
   * cookie de sessão, mas a navegação até `/mapa` é client-side
   * (`router.push`) — sem isso, o provider continua com o `user` antigo (null)
   * até um reload de página inteira, e a tela mostra "sem conta" mesmo com o
   * cadastro tendo funcionado no servidor.
   */
  refreshSession(): Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const localRef = useRef<LocalProgressRepository | null>(null);
  if (!localRef.current) localRef.current = new LocalProgressRepository();
  const local = localRef.current;

  const remote = useMemo(
    () =>
      new RemoteProgressRepository({
        carregar: () => carregarProgresso(),
        salvar: (s) => salvarProgresso(s),
      }),
    [],
  );

  const [state, setState] = useState<ProgressState | null>(null);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionInfo | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ProgressState | null>(null);

  const repository: ProgressRepository = user ? remote : local;

  const carregarSessao = useCallback(
    async (cancelado: () => boolean) => {
      const sessao = await usuarioAtual();
      if (cancelado()) return;
      setUser(sessao);

      if (sessao) {
        const doServidor = await carregarProgresso();
        const doNavegador = await local.load();
        if (cancelado()) return;

        setState(doServidor ?? freshProgress());

        // Oferecer importação só quando há de fato algo local para trazer.
        if (doNavegador && doNavegador.attempts.length > 0) {
          const servidorVazio = (doServidor?.attempts.length ?? 0) === 0;
          if (servidorVazio) setPendingImport(doNavegador);
          else discardLocalProgress();
        }
      } else {
        setState((await local.load()) ?? freshProgress());
      }
    },
    [local],
  );

  useEffect(() => {
    let cancelado = false;
    void carregarSessao(() => cancelado).then(() => {
      if (!cancelado) setReady(true);
    });
    return () => {
      cancelado = true;
    };
  }, [carregarSessao]);

  const refreshSession = useCallback(() => carregarSessao(() => false), [carregarSessao]);

  const persist = useCallback(
    (next: ProgressState) => {
      void repository
        .save(next)
        .then(() => setSaveError(null))
        .catch((error: unknown) =>
          setSaveError(error instanceof Error ? error.message : "Não foi possível salvar."),
        );
    },
    [repository],
  );

  const update = useCallback(
    (fn: (previous: ProgressState) => ProgressState) => {
      setState((previous) => {
        if (!previous) return previous;
        const next = fn(previous);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    const next = freshProgress();
    setState(next);
    persist(next);
  }, [persist]);

  const importLocal = useCallback(() => {
    if (!pendingImport) return;
    setState(pendingImport);
    persist(pendingImport);
    discardLocalProgress();
    setPendingImport(null);
  }, [pendingImport, persist]);

  const dismissImport = useCallback(() => {
    discardLocalProgress();
    setPendingImport(null);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      ready,
      user,
      storageLabel: repository.locationLabel,
      saveError,
      pendingImport,
      update,
      reset,
      importLocal,
      dismissImport,
      refreshSession,
    }),
    [
      state,
      ready,
      user,
      repository.locationLabel,
      saveError,
      pendingImport,
      update,
      reset,
      importLocal,
      dismissImport,
      refreshSession,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress precisa estar dentro de <ProgressProvider>");
  return context;
}
