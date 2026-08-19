"use client";

/**
 * Estado do usuário no cliente.
 *
 * O provider é apenas transporte: toda transição de estado acontece em
 * `src/domain/session`, que é puro e testado. Aqui só carregamos, salvamos e
 * distribuímos.
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
import { createRepository, freshProgress, type ProgressRepository } from "@/lib/storage";
import type { ProgressState } from "@/domain/session";

interface ProgressContextValue {
  state: ProgressState | null;
  /** false enquanto o estado ainda não foi lido do dispositivo. */
  ready: boolean;
  update(fn: (previous: ProgressState) => ProgressState): void;
  reset(): void;
  storageLabel: string;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const repositoryRef = useRef<ProgressRepository | null>(null);
  if (!repositoryRef.current) repositoryRef.current = createRepository();
  const repository = repositoryRef.current;

  const [state, setState] = useState<ProgressState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void repository.load().then((loaded) => {
      if (cancelled) return;
      setState(loaded ?? freshProgress());
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const update = useCallback(
    (fn: (previous: ProgressState) => ProgressState) => {
      setState((previous) => {
        if (!previous) return previous;
        const next = fn(previous);
        void repository.save(next);
        return next;
      });
    },
    [repository],
  );

  const reset = useCallback(() => {
    const next = freshProgress();
    setState(next);
    void repository.save(next);
  }, [repository]);

  const value = useMemo<ProgressContextValue>(
    () => ({ state, ready, update, reset, storageLabel: repository.locationLabel }),
    [state, ready, update, reset, repository.locationLabel],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress precisa estar dentro de <ProgressProvider>");
  return context;
}
