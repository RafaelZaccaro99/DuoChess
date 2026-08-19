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

/**
 * Adaptador de servidor.
 *
 * Chama as server actions, que conferem a sessão do lado do servidor. O cliente
 * nunca informa de quem é o progresso — quem informa é o cookie assinado.
 */
export class RemoteProgressRepository implements ProgressRepository {
  readonly locationLabel = "Na sua conta (sincroniza entre aparelhos)";

  constructor(
    private readonly actions: {
      carregar(): Promise<ProgressState | null>;
      salvar(state: ProgressState): Promise<{ ok: boolean; error?: string }>;
    },
  ) {}

  async load(): Promise<ProgressState | null> {
    return this.actions.carregar();
  }

  async save(state: ProgressState): Promise<void> {
    const r = await this.actions.salvar(state);
    // Falha de gravação não pode passar em silêncio: o usuário continuaria
    // estudando achando que está sendo salvo.
    if (!r.ok) throw new Error(r.error ?? "Não foi possível salvar seu progresso.");
  }

  async clear(): Promise<void> {
    await this.actions.salvar(emptyProgress(new Date().toISOString()));
  }
}

export function createRepository(): ProgressRepository {
  return new LocalProgressRepository();
}

/** Progresso local que ainda não foi para o servidor. */
export function hasLocalProgress(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function discardLocalProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function freshProgress(): ProgressState {
  return emptyProgress(new Date().toISOString());
}
