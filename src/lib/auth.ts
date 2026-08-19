/**
 * Autenticação: senha, sessão e cookie.
 *
 * Escolhas e por quê:
 *  - bcrypt para a senha. Nunca guardamos a senha, só o hash com sal.
 *  - JWT assinado em cookie httpOnly, não em localStorage: script na página não
 *    consegue ler um cookie httpOnly, e é isso que limita o estrago de um XSS.
 *  - `sameSite: lax` corta CSRF nas requisições de outro site sem quebrar a
 *    navegação normal.
 */

import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const COOKIE = "mx_sessao";
const DIAS = 30;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  // Falhar alto: um segredo padrão em produção significa sessão forjável.
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET ausente ou curto demais. Defina-o antes de subir.");
  }
  return new TextEncoder().encode(value);
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 86_400,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** Usuário da requisição atual, ou null. Nunca lança: sessão inválida é anônimo. */
export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (typeof id !== "string") return null;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true },
    });
    return user;
  } catch {
    return null; // expirado, adulterado ou segredo trocado
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface CredentialProblem {
  field: "email" | "password" | "displayName";
  message: string;
}

/** Validação de cadastro. Mensagens dizem como corrigir, não só o que houve. */
export function validateCredentials(input: {
  email: string;
  password: string;
  displayName?: string;
}): CredentialProblem[] {
  const problems: CredentialProblem[] = [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    problems.push({ field: "email", message: "Digite um e-mail válido, como voce@exemplo.com." });
  }
  if (input.password.length < 8) {
    problems.push({ field: "password", message: "A senha precisa de pelo menos 8 caracteres." });
  }
  if (input.displayName !== undefined && input.displayName.trim().length < 2) {
    problems.push({ field: "displayName", message: "Diga como quer ser chamado — ao menos 2 letras." });
  }
  return problems;
}
