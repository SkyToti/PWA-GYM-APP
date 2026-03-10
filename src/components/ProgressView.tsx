import { useState } from 'react'
import { ChevronDown, ChevronUp, Trophy, Calendar, Flame, Trash2, Target, TrendingUp, Zap } from 'lucide-react'
import { useWorkoutSessions } from '../hooks/useWorkoutSessions'
import { deleteSession } from '../lib/sessions'
import {
  computePRs,
  computeProgressions,
  computeSessionStats,
  computeStreak,
} from '../lib/progressMetrics'
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

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

interface SessionCardProps {
  session: WorkoutSession
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}

function SessionCard({ session, expanded, onToggle, onDelete }: SessionCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dayInfo = routine[session.day_id as keyof typeof routine]
  const dayName = dayInfo?.title.split(': ')[1] ?? session.day_id
  const setsDone = Object.values(session.logs).reduce(
    (acc, sets) => acc + Object.values(sets).filter(s => s.done).length,
    0
  )
  const totalSets = dayInfo?.exercises.reduce((a, e) => a + e.sets, 0) ?? 0
  const pct = totalSets > 0 ? Math.round((setsDone / totalSets) * 100) : 0

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center justify-between p-4 text-left active:bg-zinc-800/50 transition-colors min-h-[44px] touch-manipulation"
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
        <button
          type="button"
          onClick={handleDelete}
          className={`p-3 m-2 rounded-xl transition-all min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center ${
            confirmDelete ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:bg-zinc-800 hover:text-red-400'
          }`}
          title={confirmDelete ? 'Toca de nuevo para confirmar' : 'Eliminar'}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-zinc-800/50">
          {confirmDelete && (
            <p className="text-red-400 text-sm py-2">Toca el icono de nuevo para confirmar eliminación</p>
          )}
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
  const { sessions, loading, reload } = useWorkoutSessions(userId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterDay, setFilterDay] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<'history' | 'prs' | 'progression'>('history')

  const filtered = filterDay === 'all' ? sessions : sessions.filter(s => s.day_id === filterDay)

  const totalSessions = sessions.length
  const thisWeek = sessions.filter(s => {
    const d = new Date(s.completed_at)
    const now = new Date()
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }).length
  const streak = computeStreak(sessions)
  const stats = computeSessionStats(sessions)
  const totalVolume = stats.reduce((a, s) => a + s.volume, 0)
  const prs = computePRs(sessions)
  const progressions = computeProgressions(sessions).slice(0, 10)

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession(userId, sessionId)
      reload()
      setExpandedId(null)
    } catch (e) {
      console.error('Error eliminando:', e)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-32 selection:bg-emerald-500/30">
      <Header showProgress={false} />
      <TabNav activeTab={activeTab} onTabChange={onTabChange} />

      <div className="p-4 pt-2">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Flame size={14} />
              Total entrenos
            </div>
            <p className="text-xl font-black text-emerald-400">{totalSessions}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Calendar size={14} />
              Esta semana
            </div>
            <p className="text-xl font-black text-teal-400">{thisWeek}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Zap size={14} />
              Racha actual
            </div>
            <p className="text-xl font-black text-amber-400">{streak} días</p>
          </div>
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Target size={14} />
              Volumen total
            </div>
            <p className="text-xl font-black text-emerald-300">
              {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume} kg
            </p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl mb-4">
          {(['history', 'prs', 'progression'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all touch-manipulation ${
                viewMode === mode ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'
              }`}
            >
              {mode === 'history' && 'Historial'}
              {mode === 'prs' && 'Records'}
              {mode === 'progression' && 'Progreso'}
            </button>
          ))}
        </div>

        {/* History view */}
        {viewMode === 'history' && (
          <>
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

            {loading ? (
              <p className="text-center text-zinc-500 py-12">Cargando historial...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
                <Trophy size={40} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-500 font-medium">Aún no hay entrenos</p>
                <p className="text-zinc-600 text-sm mt-1">Finaliza un entreno para ver el historial</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    expanded={expandedId === session.id}
                    onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    onDelete={() => handleDelete(session.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* PRs view */}
        {viewMode === 'prs' && (
          <div className="space-y-3">
            {prs.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
                <Target size={40} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-500 font-medium">Sin records aún</p>
                <p className="text-zinc-600 text-sm mt-1">Registra pesos para ver tus PRs</p>
              </div>
            ) : (
              prs.map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-zinc-100">{pr.exerciseName}</p>
                    <p className="text-xs text-zinc-500">{pr.dayName} · {formatShortDate(pr.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black text-lg">{pr.maxWeight} kg</p>
                    <p className="text-xs text-zinc-500">× {pr.maxReps} reps</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Progression view */}
        {viewMode === 'progression' && (
          <div className="space-y-4">
            {progressions.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
                <TrendingUp size={40} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-500 font-medium">Necesitas más datos</p>
                <p className="text-zinc-600 text-sm mt-1">Varios entrenos del mismo ejercicio para ver tendencias</p>
              </div>
            ) : (
              progressions.map((p) => (
                <div
                  key={p.exerciseId}
                  className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-zinc-100 text-sm">{p.exerciseName}</p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.trend === 'up'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : p.trend === 'down'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {p.trend === 'up' && '↑ Subiendo'}
                      {p.trend === 'down' && '↓ Bajando'}
                      {p.trend === 'stable' && '— Estable'}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {p.history.slice(-6).map((h, i) => (
                      <div
                        key={i}
                        className="shrink-0 bg-zinc-800/60 rounded-lg px-2 py-1.5 text-center min-w-[60px]"
                      >
                        <p className="text-emerald-400 font-bold text-sm">{h.weight} kg</p>
                        <p className="text-[10px] text-zinc-500">{formatShortDate(h.date)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Último: {p.lastWeight} kg · Mejor: {p.bestWeight} kg
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
