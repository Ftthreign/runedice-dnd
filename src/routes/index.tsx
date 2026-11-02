import { createFileRoute } from '@tanstack/react-router'
import { DiceWorkspace } from '../features/dice'
import WorkspaceShell from '../components/layout/WorkspaceShell'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <WorkspaceShell>
      <DiceWorkspace />
    </WorkspaceShell>
  )
}

export default HomePage
