"use client";

/**
 * Medidores da barra de status.
 *
 * Cada sistema tem cor e forma próprias e aparece como um item separado — a
 * tradução visual da tese do produto. Somar XP com Chess Score numa mesma barra
 * seria contradizer a arquitetura na interface.
 */

import { cn } from "@/lib/cn";

export function StatChip({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: "xp" | "mastery" | "focus" | "streak";
  icon: string;
}) {
  const toneClass = {
    xp: "text-xp",
    mastery: "text-mastery",
    focus: "text-focus",
    streak: "text-streak",
  }[tone];

  // O rótulo some abaixo de sm; o valor nunca é truncado. Um "1.." no lugar do XP
  // não informa nada, e a barra de status existe justamente para mostrar que os
  // quatro números são grandezas diferentes.
  return (
    <div className="flex shrink-0 items-center gap-1.5" title={hint}>
      <span aria-hidden="true" className={cn("text-[15px] leading-none", toneClass)}>
        {icon}
      </span>
      <span className="hidden text-[10px] uppercase tracking-wider text-ink-faint sm:inline">
        {label}
      </span>
      <span className={cn("text-sm font-bold tabular-nums", toneClass)}>{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = "mastery",
  label,
}: {
  value: number;
  max?: number;
  tone?: "xp" | "mastery" | "focus" | "brand";
  label?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const bg = { xp: "bg-xp", mastery: "bg-mastery", focus: "bg-focus", brand: "bg-brand" }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500", bg)} style={{ width: `${percent}%` }} />
    </div>
  );
}
