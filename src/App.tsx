import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SessionGate } from './components/SessionGate'
import { Home } from './pages/Home'
import { AbcModule } from './pages/AbcModule'
import { ShapesModule } from './pages/ShapesModule'
import { ColorsModule } from './pages/ColorsModule'
import { NumbersModule } from './pages/NumbersModule'
import { SignsModule } from './pages/SignsModule'
import { FoodsModule } from './pages/FoodsModule'
import { OnlineHub } from './pages/OnlineHub'
import { MixQuiz } from './pages/online/MixQuiz'
import { GentleTimer } from './pages/online/GentleTimer'
import { MultiMatch } from './pages/online/MultiMatch'
import { MeltdownMode } from './pages/care/MeltdownMode'
import { CalmToolkit } from './pages/care/CalmToolkit'
import { FeelingsCheckIn } from './pages/care/FeelingsCheckIn'
import { AacEmotionCheckIn } from './pages/care/AacEmotionCheckIn'
import { RoutineActive } from './pages/care/RoutineActive'
import { FirstThenBoard } from './pages/care/FirstThenBoard'
import { RoutineBuilder } from './pages/care/RoutineBuilder'
import { SocialStories } from './pages/care/SocialStories'
import { TalkAac } from './pages/care/TalkAac'
import { SocialCues } from './pages/care/SocialCues'
import { InterestRewards } from './pages/care/InterestRewards'
import { LearningVideos } from './pages/care/LearningVideos'
import { ParentGate } from './pages/ParentGate'
import { ParentDashboard } from './pages/ParentDashboard'
import { ParentBilling } from './pages/ParentBilling'
import { Privacy } from './pages/Privacy'
import { useApp } from './store/AppContext'
import type { CareModuleId, ModuleId } from './types'

function GuardedModule({ id, children }: { id: ModuleId; children: ReactNode }) {
  const { settings } = useApp()
  if (!settings.enabledModules[id]) return <Navigate to="/" replace />
  return <SessionGate>{children}</SessionGate>
}

function GuardedCare({ id, children }: { id: CareModuleId; children: ReactNode }) {
  const { settings } = useApp()
  if (!settings.enabledCareModules[id]) return <Navigate to="/" replace />
  return <SessionGate>{children}</SessionGate>
}

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meltdown" element={<MeltdownMode />} />
        <Route
          path="/calm"
          element={
            <GuardedCare id="calm">
              <CalmToolkit />
            </GuardedCare>
          }
        />
        <Route
          path="/check-in"
          element={
            <GuardedCare id="checkin">
              <AacEmotionCheckIn />
            </GuardedCare>
          }
        />
        <Route
          path="/feelings"
          element={
            <GuardedCare id="feelings">
              <FeelingsCheckIn />
            </GuardedCare>
          }
        />
        <Route
          path="/schedule"
          element={
            <GuardedCare id="schedule">
              <RoutineActive />
            </GuardedCare>
          }
        />
        <Route
          path="/schedule/board"
          element={
            <GuardedCare id="schedule">
              <FirstThenBoard />
            </GuardedCare>
          }
        />
        <Route
          path="/schedule/builder"
          element={
            <GuardedCare id="schedule">
              <RoutineBuilder />
            </GuardedCare>
          }
        />
        <Route
          path="/stories"
          element={
            <GuardedCare id="stories">
              <SocialStories />
            </GuardedCare>
          }
        />
        <Route
          path="/videos"
          element={
            <GuardedCare id="videos">
              <LearningVideos />
            </GuardedCare>
          }
        />
        <Route
          path="/talk"
          element={
            <GuardedCare id="talk">
              <TalkAac />
            </GuardedCare>
          }
        />
        <Route
          path="/friends"
          element={
            <GuardedCare id="friends">
              <SocialCues />
            </GuardedCare>
          }
        />
        <Route
          path="/interest"
          element={
            <GuardedCare id="interest">
              <InterestRewards />
            </GuardedCare>
          }
        />
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
          path="/signs"
          element={
            <GuardedModule id="signs">
              <SignsModule />
            </GuardedModule>
          }
        />
        <Route
          path="/foods"
          element={
            <GuardedModule id="foods">
              <FoodsModule />
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
        <Route
          path="/online/mix-quiz"
          element={
            <SessionGate>
              <MixQuiz />
            </SessionGate>
          }
        />
        <Route
          path="/online/gentle-timer"
          element={
            <SessionGate>
              <GentleTimer />
            </SessionGate>
          }
        />
        <Route
          path="/online/multi-match"
          element={
            <SessionGate>
              <MultiMatch />
            </SessionGate>
          }
        />
        <Route path="/parent" element={<ParentGate />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/billing" element={<ParentBilling />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
