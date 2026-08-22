"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { entrar, registrar, type ActionResult } from "@/app/actions";
import { useProgress } from "@/components/ProgressProvider";
import { cn } from "@/lib/cn";

type Modo = "entrar" | "criar";

export default function EntrarPage() {
  const router = useRouter();
  const { refreshSession } = useProgress();
  const [modo, setModo] = useState<Modo>("entrar");
  const [resultado, setResultado] = useState<ActionResult | null>(null);
  const [pendente, iniciar] = useTransition();

  // React zera o formulário depois de uma action. Sem guardar estes campos, quem
  // errasse a senha teria que redigitar o e-mail e o nome também.
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");

  function enviar(formData: FormData) {
    iniciar(async () => {
      const r = modo === "entrar" ? await entrar(formData) : await registrar(formData);
      setResultado(r);
      if (r.ok) {
        await refreshSession();
        router.push("/mapa");
      }
    });
  }

  const erroNo = (campo: string) => resultado?.field === campo && !resultado.ok;

  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <Link href="/" className="text-sm font-bold tracking-tight text-brand">
        MestreXadrez
      </Link>

      <h1 className="mt-8 text-2xl font-bold tracking-tight">
        {modo === "entrar" ? "Entrar na sua conta" : "Criar sua conta"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Com conta, seu progresso passa a ficar no servidor e acompanha você entre aparelhos.
        Sem conta, ele fica só neste navegador.
      </p>

      <form action={enviar} className="mt-8 space-y-4">
        {modo === "criar" && (
          <div>
            <label htmlFor="displayName" className="label">
              Como quer ser chamado
            </label>
            <input
              id="displayName"
              name="displayName"
              autoComplete="nickname"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={cn(campoClasses, erroNo("displayName") && "border-danger")}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={erroNo("email") || undefined}
            className={cn(campoClasses, erroNo("email") && "border-danger")}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            required
            minLength={8}
            aria-invalid={erroNo("password") || undefined}
            className={cn(campoClasses, erroNo("password") && "border-danger")}
          />
          {modo === "criar" && (
            <p className="mt-1.5 text-xs text-ink-faint">Pelo menos 8 caracteres.</p>
          )}
        </div>

        {resultado && !resultado.ok && resultado.error && (
          <p role="alert" className="rounded-xl2 border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
            {resultado.error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={pendente}>
          {pendente ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setModo(modo === "entrar" ? "criar" : "entrar");
          setResultado(null);
        }}
        className="mt-6 text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
      >
        {modo === "entrar" ? "Não tenho conta ainda" : "Já tenho conta"}
      </button>

      <p className="mt-10 text-xs leading-relaxed text-ink-faint">
        Guardamos apenas e-mail, nome de exibição e seu progresso de estudo. A senha nunca é
        armazenada — só um hash com sal, do qual não dá para recuperá-la.
      </p>
    </main>
  );
}

const campoClasses =
  "mt-2 w-full rounded-xl2 border border-line bg-surface-sunken px-4 py-3 text-sm text-ink " +
  "placeholder:text-ink-faint focus:border-brand";
