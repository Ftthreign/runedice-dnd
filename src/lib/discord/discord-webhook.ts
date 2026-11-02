import type { DiceRollResult } from "../../features/dice/types/dice-types";

/**
 * Discord Embed Color Palette (RuneDice Arcane Theme)
 */
export const DISCORD_THEME_COLORS = {
  GOLD_CRITICAL: 15655856, // #eee3b0 - Natural 20 / Critical Hit
  CRIMSON_FUMBLE: 9312564, // #8e1934 - Natural 1 / Critical Failure
  MYSTIC_MAGENTA: 9054840, // #8a2a78 - Standard Roll
} as const;

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  icon_url?: string;
}

export interface DiscordEmbedPayload {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: DiscordEmbedFooter;
  timestamp?: string;
  author?: DiscordEmbedAuthor;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbedPayload[];
}

export interface RollShareMetadata {
  playerName?: string;
  sessionName?: string;
}

/**
 * Detect Discord Webhook URL directly from Vite environment (VITE_WEBHOOK_URL).
 */
export function getDiscordWebhookUrl(): string | undefined {
  const url = import.meta.env.VITE_WEBHOOK_URL;
  if (typeof url === "string" && url.trim()) {
    return url.trim().replace(/^["']|["']$/g, "").trim();
  }
  return undefined;
}

/**
 * Checks whether a Discord Webhook URL is detected in the environment.
 */
export function isDiscordWebhookConfigured(): boolean {
  return Boolean(getDiscordWebhookUrl());
}

/**
 * Builds a readable string breakdown of individual dice rolls.
 * e.g., "[18, 12, ~~4~~] + 5"
 */
export function formatDiceBreakdown(result: DiceRollResult): string {
  if (!result.allRolls || result.allRolls.length === 0) {
    return `${result.diceTotal}${
      result.modifier !== 0
        ? ` ${result.modifier > 0 ? "+" : "-"} ${Math.abs(result.modifier)}`
        : ""
    }`;
  }

  const rollsFormatted = result.allRolls.map((die) => {
    if (die.isDropped) {
      return `~~${die.value}~~`;
    }
    if (die.sides === 20 && die.value === 20) {
      return `**${die.value}**`;
    }
    if (die.sides === 20 && die.value === 1) {
      return `**${die.value}**`;
    }
    return `${die.value}`;
  });

  const dicePart = `[${rollsFormatted.join(", ")}]`;
  if (result.modifier === 0) {
    return dicePart;
  }

  const sign = result.modifier > 0 ? "+" : "-";
  return `${dicePart} ${sign} ${Math.abs(result.modifier)}`;
}

/**
 * Generates a formatted Discord Webhook Payload with an Arcane D&D theme embed.
 */
export function buildDiscordRollMessage(
  result: DiceRollResult,
  metadata?: RollShareMetadata,
): DiscordWebhookPayload {
  const playerName = metadata?.playerName || "Adventurer";
  const sessionName = metadata?.sessionName || "Active Campaign";

  // Determine Title, Highlight, and Color
  let titleBadge = "Dice Roll";
  let color: number = DISCORD_THEME_COLORS.MYSTIC_MAGENTA;

  if (result.isNatural20) {
    titleBadge = "CRITICAL HIT (Natural 20)";
    color = DISCORD_THEME_COLORS.GOLD_CRITICAL;
  } else if (result.isNatural1) {
    titleBadge = "CRITICAL FUMBLE (Natural 1)";
    color = DISCORD_THEME_COLORS.CRIMSON_FUMBLE;
  }

  // Format mode string
  let modeLabel = "Normal";
  if (result.mode === "advantage") {
    modeLabel = "Advantage (Highest Kept)";
  } else if (result.mode === "disadvantage") {
    modeLabel = "Disadvantage (Lowest Kept)";
  }

  const breakdown = formatDiceBreakdown(result);

  const embed: DiscordEmbedPayload = {
    title: `${titleBadge} — Result: ${result.total}`,
    description: `**${playerName}** rolled fate in **${sessionName}**`,
    color,
    fields: [
      {
        name: "Formula",
        value: `\`${result.formula}\``,
        inline: true,
      },
      {
        name: "Roll Mode",
        value: modeLabel,
        inline: true,
      },
      {
        name: "Total",
        value: `**\`${result.total}\`**`,
        inline: true,
      },
      {
        name: "Dice Breakdown",
        value: `\`${breakdown}\``,
        inline: false,
      },
    ],
    footer: {
      text: "RuneDice — Roll Your Fate",
    },
    timestamp: result.timestamp || new Date().toISOString(),
  };

  return {
    username: "RuneDice Oracle",
    embeds: [embed],
  };
}

/**
 * Sends a roll result to the configured Discord Webhook URL.
 * Accepts an optional override URL if provided.
 */
export async function sendRollToDiscord(
  result: DiceRollResult,
  metadata?: RollShareMetadata,
  overrideWebhookUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = overrideWebhookUrl || getDiscordWebhookUrl();

  if (!webhookUrl) {
    return {
      success: false,
      error:
        "Discord Webhook URL is not configured. Please set WEBHOOK_URL or VITE_DISCORD_WEBHOOK_URL in your environment.",
    };
  }

  try {
    const payload = buildDiscordRollMessage(result, metadata);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Discord Webhook returned status ${response.status}: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Network error contacting Discord";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
