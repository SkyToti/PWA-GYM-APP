export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 rounded-xl ${className}`}
      aria-hidden
    />
  )
}

export function WorkoutSkeleton() {
  return (
    <div className="p-4 space-y-5">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-900/50 rounded-3xl p-5 border border-zinc-800/50 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export function ProgressSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  )
}
