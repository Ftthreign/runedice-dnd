export type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

export const SUPPORTED_DICE: readonly DieType[] = [
  "d4",
  "d6",
  "d8",
  "d10",
  "d12",
  "d20",
] as const;

export const DIE_SIDES_MAP: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

export type RollMode = "normal" | "advantage" | "disadvantage";

export interface DieRollDetail {
  id: string;
  sides: number;
  value: number;
  isDropped?: boolean;
  isAdvantageRoll?: boolean;
}

export interface ParsedDieTerm {
  type: "die";
  count: number;
  sides: number;
  sign: 1 | -1;
}

export interface ParsedModifierTerm {
  type: "modifier";
  value: number;
  sign: 1 | -1;
}

export type ParsedTerm = ParsedDieTerm | ParsedModifierTerm;

export interface ParsedFormula {
  rawFormula: string;
  terms: ParsedTerm[];
  totalDiceCount: number;
  staticModifier: number;
}

export interface DiceRollResult {
  id: string;
  formula: string;
  mode: RollMode;
  allRolls: DieRollDetail[];
  keptRolls: DieRollDetail[];
  diceResults: number[];
  diceTotal: number;
  modifier: number;
  total: number;
  isNatural20: boolean;
  isNatural1: boolean;
  timestamp: string;
}
