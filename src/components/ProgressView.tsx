import { useState } from 'react'
import { ChevronDown, ChevronUp, Trophy, Calendar, Flame } from 'lucide-react'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { routine } from '../lib/routine'
import type { WorkoutSession } from '../lib/sessions'
import TabNav from './TabNav'
import Header from './Header'

interface ProgressViewProps {
  userId: string | null
  activeTab: 'workout' | 'progress'
  onTabChange: (tab: 'workout' | 'progress') => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function SessionCard({ session, expanded, onToggle }: { session: WorkoutSession; expanded: boolean; onToggle: () => void }) {
  const dayInfo = routine[session.day_id as keyof typeof routine]
  const dayName = dayInfo?.title.split(': ')[1] ?? session.day_id
  const setsDone = Object.values(session.logs).reduce(
    (acc, sets) => acc + Object.values(sets).filter(s => s.done).length,
    0
  )
  const totalSets = dayInfo?.exercises.reduce((a, e) => a + e.sets, 0) ?? 0
  const pct = totalSets > 0 ? Math.round((setsDone / totalSets) * 100) : 0

  return (
    <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left active:bg-zinc-800/50 transition-colors min-h-[44px] touch-manipulation"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Trophy size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-zinc-100">{dayName}</p>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar size={12} /> {formatDate(session.completed_at)} · {formatTime(session.completed_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold text-sm">{pct}%</span>
          {expanded ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-zinc-800/50">
          <div className="mt-3 space-y-3">
            {dayInfo?.exercises.map((ex) => {
              const exLogs = session.logs[ex.id] || {}
              const doneSets = Object.values(exLogs).filter(s => s.done)
              if (doneSets.length === 0) return null
              const details = doneSets
                .map((s) => (s.weight || s.reps ? `${s.weight ?? '-'}kg × ${s.reps ?? '-'}` : null))
                .filter(Boolean)
              return (
                <div key={ex.id} className="flex justify-between items-start text-sm">
                  <span className="text-zinc-300 flex-1">{ex.name}</span>
                  <span className="text-emerald-400 font-medium shrink-0 ml-2">
                    {doneSets.length}/{ex.sets} sets
                    {details.length > 0 && ` · ${details.join(', ')}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProgressView({ userId, activeTab, onTabChange }: ProgressViewProps) {
  const { sessions, loading } = useWorkoutSessions(userId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterDay, setFilterDay] = useState<string | 'all'>('all')

  const filtered = filterDay === 'all'
    ? sessions
    : sessions.filter(s => s.day_id === filterDay)

  const totalSessions = sessions.length
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.completed_at)
    const now = new Date()
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }).length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32 selection:bg-emerald-500/30">
      <Header showProgress={false} />
      <TabNav activeTab={activeTab} onTabChange={onTabChange} />

      <div className="p-4 pt-2">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <Flame size={16} />
              Total entrenos
            </div>
            <p className="text-2xl font-black text-emerald-400">{totalSessions}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <Calendar size={16} />
              Esta semana
            </div>
            <p className="text-2xl font-black text-teal-400">{thisWeek}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFilterDay('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filterDay === 'all' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Todos
          </button>
          {Object.values(routine).map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setFilterDay(day.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all touch-manipulation ${
                filterDay === day.id ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              {day.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-zinc-500 py-12">Cargando historial...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={48} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 font-medium">Aún no hay entrenos registrados</p>
            <p className="text-zinc-600 text-sm mt-1">Finaliza un entreno para ver tu progreso aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                expanded={expandedId === session.id}
                onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
