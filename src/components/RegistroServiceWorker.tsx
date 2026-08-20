"use client";

/**
 * Registra o service worker do app shell instalável (A8) — só o cache dos
 * assets estáticos, ver `public/sw.js`. Silencioso de propósito: um service
 * worker é melhoria progressiva, nunca deve aparecer como erro para quem usa
 * um navegador sem suporte ou está em desenvolvimento sem HTTPS.
 */

import { useEffect } from "react";

export function RegistroServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
