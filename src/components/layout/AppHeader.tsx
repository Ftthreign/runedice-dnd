import { Link } from "@tanstack/react-router";
import { Sparkles, Dices, User, Layers } from "lucide-react";

interface AppHeaderProps {
  sessionName?: string | null;
  playerName?: string | null;
  onOpenSessionModal?: () => void;
  onOpenPlayerModal?: () => void;
}

export function AppHeader({
  sessionName = "The Lost Temple",
  playerName = "Fadhil",
  onOpenSessionModal,
  onOpenPlayerModal,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-subtle-border/40 bg-[#200033]/90 px-4 py-3 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="group flex items-center gap-3 no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#70418a] bg-[#500071] shadow-[0_0_14px_rgba(138,42,120,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Dices className="h-5 w-5 text-[#eee3b0]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-wider text-[#fff8e8] group-hover:text-[#eee3b0] transition-colors">
                RuneDice
              </span>
              <Sparkles className="h-3.5 w-3.5 text-[#8a2a78] animate-pulse" />
            </div>
            <p className="m-0 font-mono text-[10px] tracking-widest text-[#c7b5d1] uppercase">
              Roll Your Fate
            </p>
          </div>
        </Link>

        {/* Session & Player Quick Context Chips */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Session Pill */}
          <button
            type="button"
            onClick={onOpenSessionModal}
            aria-label="Active Session"
            className="flex items-center gap-1.5 rounded-md border border-[#70418a]/70 bg-[#35104a]/80 px-2.5 py-1.5 text-xs text-[#fff8e8] transition-all hover:border-[#8a2a78] hover:bg-[#500071] hover:shadow-[0_0_12px_rgba(138,42,120,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2a78]"
          >
            <Layers className="h-3.5 w-3.5 text-[#c7b5d1]" />
            <span className="hidden text-[10px] font-medium tracking-wider text-[#c7b5d1] uppercase sm:inline">
              Session:
            </span>
            <span className="max-w-[100px] truncate font-medium text-[#eee3b0] sm:max-w-[160px]">
              {sessionName || "Default Session"}
            </span>
          </button>

          {/* Active Player Pill */}
          <button
            type="button"
            onClick={onOpenPlayerModal}
            aria-label="Active Player"
            className="flex items-center gap-1.5 rounded-md border border-[#70418a]/70 bg-[#35104a]/80 px-2.5 py-1.5 text-xs text-[#fff8e8] transition-all hover:border-[#8a2a78] hover:bg-[#500071] hover:shadow-[0_0_12px_rgba(138,42,120,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2a78]"
          >
            <User className="h-3.5 w-3.5 text-[#c7b5d1]" />
            <span className="hidden text-[10px] font-medium tracking-wider text-[#c7b5d1] uppercase sm:inline">
              Player:
            </span>
            <span className="max-w-[90px] truncate font-semibold text-[#eee3b0] sm:max-w-[140px]">
              {playerName || "No Player"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
export default AppHeader;
