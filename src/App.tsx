import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SessionGate } from './components/SessionGate'
import { Home } from './pages/Home'
import { AbcModule } from './pages/AbcModule'
import { ShapesModule } from './pages/ShapesModule'
import { ColorsModule } from './pages/ColorsModule'
import { NumbersModule } from './pages/NumbersModule'
import { OnlineHub } from './pages/OnlineHub'
import { ParentGate } from './pages/ParentGate'
import { ParentDashboard } from './pages/ParentDashboard'
import { useApp } from './store/AppContext'
import type { ModuleId } from './types'

function GuardedModule({ id, children }: { id: ModuleId; children: ReactNode }) {
  const { settings } = useApp()
  if (!settings.enabledModules[id]) {
    return <Navigate to="/" replace />
  }
  return <SessionGate>{children}</SessionGate>
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/abc"
          element={
            <GuardedModule id="abc">
              <AbcModule />
            </GuardedModule>
          }
        />
        <Route
          path="/shapes"
          element={
            <GuardedModule id="shapes">
              <ShapesModule />
            </GuardedModule>
          }
        />
        <Route
          path="/colors"
          element={
            <GuardedModule id="colors">
              <ColorsModule />
            </GuardedModule>
          }
        />
        <Route
          path="/numbers"
          element={
            <GuardedModule id="numbers">
              <NumbersModule />
            </GuardedModule>
          }
        />
        <Route
          path="/online"
          element={
            <SessionGate>
              <OnlineHub />
            </SessionGate>
          }
        />
        <Route path="/parent" element={<ParentGate />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
