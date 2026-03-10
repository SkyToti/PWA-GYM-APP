import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import WorkoutView from './components/WorkoutView'
import ProgressView from './components/ProgressView'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [skippedAuth, setSkippedAuth] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false)
      setUserId(null)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setCheckingAuth(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    )
  }

  const showAuth = !skippedAuth && supabase && !userId

  if (showAuth) {
    return <Auth onAuth={() => setSkippedAuth(true)} />
  }

  return <MainApp userId={userId} />
}

function MainApp({ userId }: { userId: string | null }) {
  const [activeTab, setActiveTab] = useState<'workout' | 'progress'>('workout')
  return activeTab === 'workout' ? (
    <WorkoutView userId={userId} activeTab={activeTab} onTabChange={setActiveTab} />
  ) : (
    <ProgressView userId={userId} activeTab={activeTab} onTabChange={setActiveTab} />
  )
}
