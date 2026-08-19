"use server";

/**
 * Server actions: a fronteira entre o cliente e o banco.
 *
 * Toda ação confere a sessão do lado do servidor. O cliente nunca manda um
 * `userId` — se mandasse, bastaria trocar o número para ler o progresso alheio.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createSession,
  currentUser,
  destroySession,
  hashPassword,
  normalizeEmail,
  validateCredentials,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth";
import { loadProgress, saveProgress } from "@/lib/progress-server";
import type { ProgressState } from "@/domain/session";

export interface ActionResult {
  ok: boolean;
  /** Mensagem pronta para exibir: diz o que houve e como resolver. */
  error?: string;
  field?: "email" | "password" | "displayName";
}

export async function registrar(formData: FormData): Promise<ActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const problemas = validateCredentials({ email, password, displayName });
  if (problemas[0]) return { ok: false, error: problemas[0].message, field: problemas[0].field };

  const existente = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existente) {
    return {
      ok: false,
      field: "email",
      error: "Já existe uma conta com este e-mail. Entre em vez de criar outra.",
    };
  }

  const user = await prisma.user.create({
    data: { email, displayName, passwordHash: await hashPassword(password) },
  });

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function entrar(formData: FormData): Promise<ActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem para e-mail inexistente e senha errada: dizer qual dos dois
  // falhou entrega ao atacante quais e-mails estão cadastrados.
  const generico = { ok: false as const, error: "E-mail ou senha incorretos.", field: "password" as const };

  if (!user?.passwordHash) return generico;
  if (!(await verifyPassword(password, user.passwordHash))) return generico;

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function sair(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
}

export async function usuarioAtual(): Promise<SessionUser | null> {
  return currentUser();
}

export async function carregarProgresso(): Promise<ProgressState | null> {
  const user = await currentUser();
  if (!user) return null;
  return loadProgress(user.id);
}

export async function salvarProgresso(state: ProgressState): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Sua sessão expirou. Entre novamente para sincronizar." };

  await saveProgress(user.id, state);
  return { ok: true };
}
