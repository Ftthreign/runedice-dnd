"use client";

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Dices, User, Layers } from "lucide-react";
import { useAppState } from "../../features/app-state/AppStateContext";
import {
  SessionModal,
  DeleteSessionDialog,
  SessionDrawerMobile,
} from "../../features/sessions";
import { PlayerManagerModal } from "../../features/players";

export function AppHeader() {
  const {
    activeSession,
    activePlayer,
    createSession,
    renameSession,
    deleteSession,
    isPlayerModalOpen,
    setIsPlayerModalOpen,
  } = useAppState();

  // Session Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [sessionModalState, setSessionModalState] = React.useState<{
    isOpen: boolean;
    mode: "create" | "rename";
    sessionId?: string;
    initialName: string;
  }>({
    isOpen: false,
    mode: "create",
    initialName: "",
  });

  const [deleteDialogState, setDeleteDialogState] = React.useState<{
    isOpen: boolean;
    sessionId: string;
    sessionName: string;
  }>({
    isOpen: false,
    sessionId: "",
    sessionName: "",
  });

  const effectiveSessionName = activeSession?.name || "No Active Session";
  const effectivePlayerName = activePlayer?.name || "No Active Player";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-subtle-border/40 bg-inset-dark/95 px-4 py-3 sm:backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="group flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-subtle-border/60 bg-inset-dark shadow-[0_0_14px_rgba(138,42,120,0.4)] transition-transform duration-200 group-hover:scale-105">
              <Dices className="h-5 w-5 text-parchment-gold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-wider text-text-primary group-hover:text-parchment-gold transition-colors">
                  RuneDice
                </span>
                <Sparkles className="h-3.5 w-3.5 text-mystic-magenta transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              </div>
              <p className="m-0 font-mono text-[10px] tracking-widest text-text-secondary uppercase">
                Roll Your Fate
              </p>
            </div>
          </Link>

          {/* Session & Player Quick Context Chips */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Pill */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Manage Sessions"
              className="flex items-center gap-1.5 rounded-md border border-subtle-border/50 bg-inset-dark px-2.5 py-1.5 text-xs text-text-secondary transition-all hover:border-parchment-gold hover:bg-surface-muted hover:shadow-[0_0_12px_rgba(138,42,120,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-text-secondary" />
              <span className="hidden text-[10px] font-medium tracking-wider text-text-secondary uppercase sm:inline">
                Session:
              </span>
              <span className="max-w-25 truncate font-medium text-parchment-gold sm:max-w-40">
                {effectiveSessionName}
              </span>
            </button>

            {/* Active Player Pill */}
            <button
              type="button"
              onClick={() => setIsPlayerModalOpen(true)}
              aria-label="Manage Players"
              className="flex items-center gap-1.5 rounded-md border border-subtle-border/60 bg-surface-muted/80 px-2.5 py-1.5 text-xs text-text-secondary transition-all hover:border-mystic-magenta hover:bg-inset-dark hover:shadow-[0_0_12px_rgba(138,42,120,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-magenta cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-text-secondary" />
              <span className="hidden text-[10px] font-medium tracking-wider text-text-secondary uppercase sm:inline">
                Player:
              </span>
              <span className="max-w-25 truncate font-semibold text-parchment-gold sm:max-w-35">
                {effectivePlayerName}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Session Management Drawer (Mobile & Responsive) */}
      <SessionDrawerMobile
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenCreateModal={() => {
          setSessionModalState({
            isOpen: true,
            mode: "create",
            initialName: "",
          });
        }}
        onOpenRenameModal={(id, name) => {
          setSessionModalState({
            isOpen: true,
            mode: "rename",
            sessionId: id,
            initialName: name,
          });
        }}
        onOpenDeleteDialog={(id, name) => {
          setDeleteDialogState({
            isOpen: true,
            sessionId: id,
            sessionName: name,
          });
        }}
      />

      {/* Create / Rename Session Modal */}
      <SessionModal
        isOpen={sessionModalState.isOpen}
        mode={sessionModalState.mode}
        initialName={sessionModalState.initialName}
        onClose={() =>
          setSessionModalState((prev) => ({ ...prev, isOpen: false }))
        }
        onSubmit={(name) => {
          if (sessionModalState.mode === "create") {
            createSession(name);
          } else if (sessionModalState.sessionId) {
            renameSession(sessionModalState.sessionId, name);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSessionDialog
        isOpen={deleteDialogState.isOpen}
        sessionName={deleteDialogState.sessionName}
        onClose={() =>
          setDeleteDialogState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          deleteSession(deleteDialogState.sessionId);
        }}
      />

      {/* Player Manager Modal */}
      <PlayerManagerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
      />
    </>
  );
}

export default AppHeader;
