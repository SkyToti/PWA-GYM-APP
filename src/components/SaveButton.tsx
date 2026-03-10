import { CheckCircle } from 'lucide-react'

interface SaveButtonProps {
  isSaved: boolean
  onSave: () => void
}

export default function SaveButton({ isSaved, onSave }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onSave}
      aria-label={isSaved ? 'Entreno registrado' : 'Finalizar entrenamiento'}
      className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] min-h-[56px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
        isSaved
          ? 'bg-zinc-800 text-emerald-500 border border-emerald-500/50'
          : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
      }`}
    >
      {isSaved ? (
        <>
          <CheckCircle size={24} />
          ¡ENTRENO REGISTRADO!
        </>
      ) : (
        'FINALIZAR ENTRENAMIENTO'
      )}
    </button>
  )
}
