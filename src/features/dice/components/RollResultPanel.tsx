"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { DiceRollResult } from "../types/dice-types";
import { Sparkles, Skull, Dices, Clock, Send, Check } from "lucide-react";
import { springs, isReducedMotionPreferred } from "../../../lib/motion-tokens";
import { cn } from "../../../lib/utils";
import {
  isDiscordWebhookConfigured,
  sendRollToDiscord,
} from "../../../lib/discord/discord-webhook";

interface RollResultPanelProps {
  result: DiceRollResult | null;
  isRolling?: boolean;
  playerName?: string;
  sessionName?: string;
}

export function RollResultPanel({
  result,
  isRolling = false,
  playerName = "Aragorn",
  sessionName = "Varakh",
}: RollResultPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isDiscordSending, setIsDiscordSending] = React.useState(false);
  const [discordStatus, setDiscordStatus] = React.useState<"idle" | "success" | "error">("idle");
  const prefersReduced = React.useMemo(() => isReducedMotionPreferred(), []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleShareDiscord = async () => {
    if (!result || isDiscordSending) return;
    setIsDiscordSending(true);
    setDiscordStatus("idle");
    const res = await sendRollToDiscord(result, { playerName, sessionName });
    setIsDiscordSending(false);
    if (res.success) {
      setDiscordStatus("success");
      setTimeout(() => setDiscordStatus("idle"), 3000);
    } else {
      setDiscordStatus("error");
      setTimeout(() => setDiscordStatus("idle"), 4000);
    }
  };

  if (isRolling) {
    return (
      <div
        role="status"
        aria-label="Rolling dice, please wait"
        className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-mystic-magenta bg-surface-elevated/60 p-8 text-center shadow-[0_0_30px_rgba(138,42,120,0.5)]"
      >
        <motion.div
          animate={prefersReduced ? {} : { rotate: 360, scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-parchment-gold bg-inset-dark shadow-lg"
        >
          <Dices className="h-9 w-9 text-parchment-gold" />
        </motion.div>
        <p className="mt-5 font-serif text-xl font-bold tracking-widest text-parchment-gold uppercase">
          Rolling Your Fate...
        </p>
        <span className="font-mono text-xs tracking-wider text-text-secondary">
          Consulting the arcane polyhedrals
        </span>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        role="region"
        aria-label="Dice Roll Result Area"
        className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-subtle-border/40 bg-inset-dark/60 p-8 text-center shadow-inner"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-subtle-border/50 bg-surface-muted/50 text-text-secondary">
          <Dices className="h-7 w-7 opacity-60" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-semibold text-text-primary">
          The Stage is Quiet
        </h3>
        <p className="mt-1.5 max-w-xs font-sans text-xs text-text-secondary/80 leading-relaxed">
          Select your polyhedrals above or inscribe a custom formula, then
          unleash the roll.
        </p>
      </div>
    );
  }

  const {
    isNatural20,
    isNatural1,
    total,
    formula,
    modifier,
    allRolls,
    mode,
    timestamp,
  } = result;

  const formattedTime = mounted
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  const announcementText = `Rolled ${formula}. Outcome is ${total}.${
    isNatural20 ? " Critical hit!" : isNatural1 ? " Critical fumble!" : ""
  }`;

  return (
    <motion.div
      initial={mounted && !prefersReduced ? { opacity: 0, scale: 0.96 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.gentle}
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Dice Roll Result"
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border p-5 sm:p-7 transition-all duration-300",
        isNatural20
          ? "border-parchment-gold bg-surface-elevated/90 shadow-[0_0_35px_4px_rgba(238,227,176,0.35)]"
          : isNatural1
            ? "border-fumble-crimson bg-[#3a0815]/90 shadow-[0_0_30px_4px_rgba(142,25,52,0.45)]"
            : "border-subtle-border/80 bg-surface-elevated/70 shadow-[0_12px_32px_-4px_rgba(12,0,20,0.85)]",
      )}
    >
      {/* Screen Reader Announcement (Invisible Visually) */}
      <span className="sr-only">{announcementText}</span>

      {/* Critical Banners */}
      {isNatural20 && (
        <div
          role="status"
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-parchment-gold py-1.5 px-3 font-mono text-xs font-black tracking-widest text-inset-dark uppercase shadow-md"
        >
          <Sparkles className="h-4 w-4" />
          <span>NATURAL 20 • CRITICAL HIT!</span>
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      {isNatural1 && (
        <div
          role="status"
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-fumble-crimson py-1.5 px-3 font-mono text-xs font-black tracking-widest text-text-primary uppercase shadow-md"
        >
          <Skull className="h-4 w-4" />
          <span>NATURAL 1 • CRITICAL FUMBLE!</span>
          <Skull className="h-4 w-4" />
        </div>
      )}

      {/* Meta context header: Session, Player, Time */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle-border/40 pb-3 font-mono text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="rounded bg-inset-dark px-2 py-0.5 text-[11px] font-semibold text-parchment-gold">
            {playerName}
          </span>
          <span className="text-subtle-border">•</span>
          <span className="text-[11px] text-text-secondary/80 truncate max-w-[150px]">
            {sessionName}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {formattedTime && (
            <div className="flex items-center gap-1 text-[11px] text-text-secondary/70">
              <Clock className="h-3 w-3" />
              <span>{formattedTime}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleShareDiscord}
            disabled={isDiscordSending}
            aria-label="Broadcast roll result to Discord channel"
            title={
              isDiscordWebhookConfigured()
                ? "Broadcast outcome to Discord Channel via WEBHOOK_URL"
                : "Configured via WEBHOOK_URL in environment"
            }
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] sm:text-[11px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mystic-magenta",
              discordStatus === "success"
                ? "border-emerald-500/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                : discordStatus === "error"
                  ? "border-rose-500/80 bg-rose-950/60 text-rose-300"
                  : "border-subtle-border/60 bg-surface-muted/60 text-text-secondary hover:border-mystic-magenta hover:bg-surface-elevated hover:text-text-primary",
            )}
          >
            {discordStatus === "success" ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Sent!</span>
              </>
            ) : discordStatus === "error" ? (
              <span>Failed</span>
            ) : isDiscordSending ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="h-3 w-3 text-mystic-magenta" />
                <span>Discord</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Total Number */}
      <div className="my-5 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-xs font-semibold tracking-widest text-text-secondary uppercase">
          Final Outcome
        </span>
        <div
          className={cn(
            "font-mono text-6xl sm:text-7xl font-extrabold tracking-tight select-none my-1",
            isNatural20
              ? "text-parchment-gold drop-shadow-[0_0_20px_rgba(238,227,176,0.6)]"
              : isNatural1
                ? "text-[#ff5a7e] drop-shadow-[0_0_18px_rgba(142,25,52,0.6)]"
                : "text-text-primary",
          )}
        >
          {total}
        </div>
        <div className="font-mono text-sm text-parchment-gold/90">
          Formula: <span className="font-bold">{formula}</span>
          {mode !== "normal" && (
            <span
              className={cn(
                "ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                mode === "advantage"
                  ? "bg-parchment-gold text-inset-dark"
                  : "bg-fumble-crimson text-text-primary",
              )}
            >
              {mode}
            </span>
          )}
        </div>
      </div>

      {/* Dice Breakdown Tray */}
      <div className="rounded-xl border border-subtle-border/40 bg-inset-dark/90 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
            Dice Breakdown
          </span>
          {modifier !== 0 && (
            <span className="font-mono text-[11px] text-parchment-gold">
              Modifier: {modifier > 0 ? `+${modifier}` : modifier}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allRolls.map((die) => {
            const labelText = die.isDropped
              ? `d${die.sides} rolled ${die.value}, dropped due to ${mode}`
              : `d${die.sides} rolled ${die.value}`;

            return (
              <div
                key={die.id}
                aria-label={labelText}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold transition-all",
                  die.isDropped
                    ? "border-subtle-border/30 bg-surface-muted/30 text-text-secondary/40 line-through"
                    : die.sides === 20 && die.value === 20
                      ? "border-parchment-gold bg-parchment-gold/20 text-parchment-gold shadow-[0_0_10px_rgba(238,227,176,0.3)]"
                      : die.sides === 20 && die.value === 1
                        ? "border-fumble-crimson bg-fumble-crimson/20 text-[#ff5a7e]"
                        : "border-subtle-border/70 bg-surface-elevated/80 text-text-primary",
                )}
              >
                <span className="text-[10px] text-text-secondary opacity-70">
                  d{die.sides}:
                </span>
                <span>{die.value}</span>
                {die.isDropped && (
                  <span className="text-[9px] uppercase tracking-wider text-text-secondary/50 no-underline">
                    (dropped)
                  </span>
                )}
              </div>
            );
          })}

          {modifier !== 0 && (
            <div
              aria-label={`Modifier ${modifier > 0 ? `+${modifier}` : modifier}`}
              className="flex items-center gap-1 rounded-lg border border-subtle-border/40 bg-surface-muted/50 px-2.5 py-1.5 font-mono text-xs font-bold text-parchment-gold"
            >
              <span>Mod:</span>
              <span>{modifier > 0 ? `+${modifier}` : modifier}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default RollResultPanel;
