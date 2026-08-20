/**
 * `track()` do lado do cliente — fire-and-forget, nunca aguardado pela UI.
 *
 * Chama a server action fina (`registrarEvento`); erro de rede ou de escrita
 * nunca aparece para quem está estudando. Mesmo espírito do ADR-006 sobre a
 * engine nunca travar a interface.
 */

import { registrarEvento } from "@/app/actions";
import type { AnalyticsEventName } from "@/lib/analytics-server";

export function track(name: AnalyticsEventName, props: Record<string, unknown> = {}, sessionId?: string): void {
  void registrarEvento(name, props, sessionId).catch(() => {});
}
