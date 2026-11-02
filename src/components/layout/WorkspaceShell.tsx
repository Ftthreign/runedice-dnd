import * as React from 'react'
import { cn } from '../../lib/utils'

interface WorkspaceShellProps {
  children: React.ReactNode
  className?: string
}

export function WorkspaceShell({ children, className }: WorkspaceShellProps) {
  return (
    <div
      className={cn(
        'relative mx-auto min-h-screen w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8',
        className
      )}
    >
      {/* Ambient Arcane Glow orbs in background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-10 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#8a2a78]/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-10 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#500071]/20 blur-[130px]"
      />

      {children}
    </div>
  )
}

export default WorkspaceShell
