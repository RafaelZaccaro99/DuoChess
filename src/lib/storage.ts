/**
 * Porta de persistência e adaptador local (ADR-005).
 *
 * O domínio nunca fala com storage direto: ele recebe e devolve `ProgressState`.
 * Este arquivo é a única fronteira com o dispositivo.
 *
 * O adaptador local guarda no `localStorage` do navegador. Isso significa que o
 * progresso é DESTE dispositivo — e a interface diz isso ao usuário, em vez de
 * fingir que existe uma conta na nuvem. O adaptador Prisma/Postgres entra na
 * Sprint 3 e substitui só este arquivo.
 */

import {
  PROGRESS_VERSION,
  emptyProgress,
  type ProgressState,
} from "@/domain/session";

export interface ProgressRepository {
  load(): Promise<ProgressState | null>;
  save(state: ProgressState): Promise<void>;
  clear(): Promise<void>;
  /** Descrição honesta de onde o dado vive, exibida na interface. */
  readonly locationLabel: string;
}

const STORAGE_KEY = "mestrexadrez.progress.v1";

export class LocalProgressRepository implements ProgressRepository {
  readonly locationLabel = "Neste navegador (sem conta, sem servidor)";

  async load(): Promise<ProgressState | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ProgressState;
      // Progresso de versão desconhecida é descartado em vez de migrado às cegas:
      // um estado meio-migrado corrompe domínio e revisões silenciosamente.
      if (parsed.version !== PROGRESS_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async save(state: ProgressState): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function createRepository(): ProgressRepository {
  return new LocalProgressRepository();
}

export function freshProgress(): ProgressState {
  return emptyProgress(new Date().toISOString());
}
