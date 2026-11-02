"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { DiceRollResult } from "../types/dice-types";
import { Sparkles, Skull, Dices, Clock } from "lucide-react";
import { springs, isReducedMotionPreferred } from "../../../lib/motion-tokens";
import { cn } from "../../../lib/utils";

interface RollResultPanelProps {
  result: DiceRollResult | null;
  isRolling?: boolean;
  playerName?: string;
  sessionName?: string;
}

export function RollResultPanel({
  result,
  isRolling = false,
  playerName = "Fadhil",
  sessionName = "The Lost Temple",
}: RollResultPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const prefersReduced = React.useMemo(() => isReducedMotionPreferred(), []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isRolling) {
    return (
      <div
        role="status"
        aria-label="Rolling dice, please wait"
        className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-[#8a2a78] bg-[#500071]/60 p-8 text-center shadow-[0_0_30px_rgba(138,42,120,0.5)]"
      >
        <motion.div
          animate={prefersReduced ? {} : { rotate: 360, scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#eee3b0] bg-[#200033] shadow-lg"
        >
          <Dices className="h-9 w-9 text-[#eee3b0]" />
        </motion.div>
        <p className="mt-5 font-serif text-xl font-bold tracking-widest text-[#eee3b0] uppercase">
          Rolling Your Fate...
        </p>
        <span className="font-mono text-xs tracking-wider text-[#c7b5d1]">
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
        className="flex min-h-[340px] w-full flex-col items-center justify-center rounded-2xl border border-[#70418a]/40 bg-[#200033]/60 p-8 text-center shadow-inner"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#70418a]/50 bg-[#35104a]/50 text-[#c7b5d1]">
          <Dices className="h-7 w-7 opacity-60" />
        </div>
        <h3 className="mt-4 font-serif text-lg font-semibold text-[#fff8e8]">
          The Stage is Quiet
        </h3>
        <p className="mt-1.5 max-w-xs font-sans text-xs text-[#c7b5d1]/80 leading-relaxed">
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
          ? "border-[#eee3b0] bg-[#500071]/90 shadow-[0_0_35px_4px_rgba(238,227,176,0.35)]"
          : isNatural1
            ? "border-[#8e1934] bg-[#3a0815]/90 shadow-[0_0_30px_4px_rgba(142,25,52,0.45)]"
            : "border-[#70418a]/80 bg-[#500071]/70 shadow-[0_12px_32px_-4px_rgba(12,0,20,0.85)]",
      )}
    >
      {/* Screen Reader Announcement (Invisible Visually) */}
      <span className="sr-only">{announcementText}</span>

      {/* Critical Banners */}
      {isNatural20 && (
        <div
          role="status"
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-[#eee3b0] py-1.5 px-3 font-mono text-xs font-black tracking-widest text-[#200033] uppercase shadow-md"
        >
          <Sparkles className="h-4 w-4" />
          <span>NATURAL 20 • CRITICAL HIT!</span>
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      {isNatural1 && (
        <div
          role="status"
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-[#8e1934] py-1.5 px-3 font-mono text-xs font-black tracking-widest text-[#fff8e8] uppercase shadow-md"
        >
          <Skull className="h-4 w-4" />
          <span>NATURAL 1 • CRITICAL FUMBLE!</span>
          <Skull className="h-4 w-4" />
        </div>
      )}

      {/* Meta context header: Session, Player, Time */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#70418a]/40 pb-3 font-mono text-xs text-[#c7b5d1]">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#200033] px-2 py-0.5 text-[11px] font-semibold text-[#eee3b0]">
            {playerName}
          </span>
          <span className="text-[#70418a]">•</span>
          <span className="text-[11px] text-[#c7b5d1]/80 truncate max-w-[150px]">
            {sessionName}
          </span>
        </div>

        {formattedTime && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#c7b5d1]/70">
            <Clock className="h-3 w-3" />
            <span>{formattedTime}</span>
          </div>
        )}
      </div>

      {/* Main Total Number */}
      <div className="my-5 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-xs font-semibold tracking-widest text-[#c7b5d1] uppercase">
          Final Outcome
        </span>
        <div
          className={cn(
            "font-mono text-6xl sm:text-7xl font-extrabold tracking-tight select-none my-1",
            isNatural20
              ? "text-[#eee3b0] drop-shadow-[0_0_20px_rgba(238,227,176,0.6)]"
              : isNatural1
                ? "text-[#ff5a7e] drop-shadow-[0_0_18px_rgba(142,25,52,0.6)]"
                : "text-[#fff8e8]",
          )}
        >
          {total}
        </div>
        <div className="font-mono text-sm text-[#eee3b0]/90">
          Formula: <span className="font-bold">{formula}</span>
          {mode !== "normal" && (
            <span
              className={cn(
                "ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                mode === "advantage"
                  ? "bg-[#eee3b0] text-[#200033]"
                  : "bg-[#8e1934] text-[#fff8e8]",
              )}
            >
              {mode}
            </span>
          )}
        </div>
      </div>

      {/* Dice Breakdown Tray */}
      <div className="rounded-xl border border-[#70418a]/40 bg-[#200033]/90 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[#c7b5d1] uppercase">
            Dice Breakdown
          </span>
          {modifier !== 0 && (
            <span className="font-mono text-[11px] text-[#eee3b0]">
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
                    ? "border-[#70418a]/30 bg-[#35104a]/30 text-[#c7b5d1]/40 line-through"
                    : die.sides === 20 && die.value === 20
                      ? "border-[#eee3b0] bg-[#eee3b0]/20 text-[#eee3b0] shadow-[0_0_10px_rgba(238,227,176,0.3)]"
                      : die.sides === 20 && die.value === 1
                        ? "border-[#8e1934] bg-[#8e1934]/20 text-[#ff5a7e]"
                        : "border-[#70418a]/70 bg-[#500071]/80 text-[#fff8e8]",
                )}
              >
                <span className="text-[10px] text-[#c7b5d1] opacity-70">
                  d{die.sides}:
                </span>
                <span>{die.value}</span>
                {die.isDropped && (
                  <span className="text-[9px] uppercase tracking-wider text-[#c7b5d1]/50 no-underline">
                    (dropped)
                  </span>
                )}
              </div>
            );
          })}

          {modifier !== 0 && (
            <div
              aria-label={`Modifier ${modifier > 0 ? `+${modifier}` : modifier}`}
              className="flex items-center gap-1 rounded-lg border border-[#70418a]/40 bg-[#35104a]/50 px-2.5 py-1.5 font-mono text-xs font-bold text-[#eee3b0]"
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
