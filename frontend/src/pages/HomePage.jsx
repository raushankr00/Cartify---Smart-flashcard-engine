import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deckAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Upload, BookOpen, Flame, Play, Trash2,
  Clock, CheckCircle, AlertCircle, Target, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusColor = {
  new:      'bg-sky      text-white',
  learning: 'bg-amber    text-white',
  review:   'bg-violet   text-white',
  mastered: 'bg-leaf     text-white',
}

const DeckCard = ({ deck, onDelete }) => {
  const navigate  = useNavigate()
  const pct       = deck.totalCards > 0 ? Math.round(deck.masteredCards / deck.totalCards * 100) : 0
  const hasDue    = deck.dueCards > 0

  return (
    <div className="card group relative overflow-hidden" style={{ borderTop: `3px solid ${deck.coverColor}` }}>
      {/* Due badge */}
      {hasDue && (
        <span className="absolute top-3 right-3 badge badge-due">
          {deck.dueCards} due
        </span>
      )}

      <div className="pr-16">
        <h3 className="font-display font-semibold text-ink-900 text-base leading-snug line-clamp-2">
          {deck.title}
        </h3>
        {deck.sourceFile && (
          <p className="text-sand-400 text-xs font-body mt-1 truncate flex items-center gap-1">
            <BookOpen size={11} /> {deck.sourceFile}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-4 text-xs font-body text-sand-500">
        <span className="flex items-center gap-1"><Target size={12} /> {deck.totalCards} cards</span>
        <span className="flex items-center gap-1"><CheckCircle size={12} className="text-leaf" /> {deck.masteredCards} mastered</span>
        {deck.streakDays > 0 && (
          <span className="flex items-center gap-1 text-amber"><Flame size={12} /> {deck.streakDays}d streak</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-sand-400 font-body mb-1.5">
          <span>Mastery</span>
          <span className="font-semibold text-ink-800">{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill bg-leaf" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Last studied */}
      {deck.lastStudied && (
        <p className="text-sand-300 text-xs font-body mt-2 flex items-center gap-1">
          <Clock size={10} />
          Last studied {new Date(deck.lastStudied).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Link to={`/study/${deck._id}`}
          className={`btn flex-1 text-sm py-2 ${hasDue ? 'btn-primary' : 'btn-secondary'}`}>
          <Play size={13} /> {hasDue ? `Study (${deck.dueCards})` : 'Review All'}
        </Link>
        <Link to={`/deck/${deck._id}`} className="btn btn-ghost text-sm py-2 px-3">
          <ChevronRight size={15} />
        </Link>
        <button onClick={() => onDelete(deck._id, deck.title)}
          className="btn btn-ghost text-sm py-2 px-3 hover:text-rose hover:bg-rose-light">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [decks, setDecks]   = useState([])
  const [loading, setLoad]  = useState(true)

  const load = () => {
    setLoad(true)
    deckAPI.list()
      .then(r => setDecks(r.data.data))
      .catch(() => toast.error('Failed to load decks'))
      .finally(() => setLoad(false))
  }

  useEffect(load, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deckAPI.delete(id)
      setDecks(d => d.filter(x => x._id !== id))
      toast.success('Deck deleted')
    } catch { toast.error('Delete failed') }
  }

  // Summary stats
  const totalCards    = decks.reduce((s, d) => s + d.totalCards, 0)
  const totalMastered = decks.reduce((s, d) => s + d.masteredCards, 0)
  const totalDue      = decks.reduce((s, d) => s + d.dueCards, 0)
  const overallPct    = totalCards > 0 ? Math.round(totalMastered / totalCards * 100) : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="section-title">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="section-sub">
            {decks.length > 0
              ? `${decks.length} deck${decks.length > 1 ? 's' : ''} · ${totalDue > 0 ? `${totalDue} cards due today` : 'all caught up!'}`
              : 'Upload your first PDF to get started.'}
          </p>
        </div>
        <Link to="/upload" className="btn-primary hidden md:inline-flex">
          <Upload size={15} /> New Deck
        </Link>
      </div>

      {/* Summary stats — only when there's data */}
      {!loading && decks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Decks',    value: decks.length,   icon: BookOpen,    color: 'text-sky',    bg: 'bg-sky-light' },
            { label: 'Cards',    value: totalCards,      icon: Target,      color: 'text-violet', bg: 'bg-violet-light' },
            { label: 'Mastered', value: totalMastered,   icon: CheckCircle, color: 'text-leaf',   bg: 'bg-leaf-light' },
            { label: 'Due Today',value: totalDue,        icon: AlertCircle, color: 'text-amber',  bg: 'bg-amber-light' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card py-4 px-5">
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={15} className={color} />
              </div>
              <p className="font-display text-2xl font-semibold text-ink-900">{value}</p>
              <p className="text-sand-400 text-xs font-body mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Decks */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-sand-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-sand-100 rounded w-1/3 mb-4" />
              <div className="h-2 bg-sand-200 rounded mb-3" />
              <div className="h-9 bg-sand-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><BookOpen size={24} /></div>
          <h3 className="font-display font-semibold text-ink-900 text-lg">No decks yet</h3>
          <p className="text-sand-400 text-sm mt-1 mb-6 max-w-xs">
            Drop in a PDF — a textbook chapter, lecture slides, or an article — and we'll build your first deck.
          </p>
          <Link to="/upload" className="btn-primary">
            <Upload size={15} /> Upload your first PDF
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {decks.map(deck => (
            <DeckCard key={deck._id} deck={deck} onDelete={handleDelete} />
          ))}
          {/* Add card */}
          <Link to="/upload"
            className="card border-2 border-dashed border-sand-300 hover:border-sand-500
                       bg-transparent hover:bg-white flex flex-col items-center justify-center
                       gap-3 py-10 transition-all duration-200 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-sand-100 group-hover:bg-sand-200 flex items-center justify-center transition-colors">
              <Upload size={18} className="text-sand-400" />
            </div>
            <span className="text-sand-400 font-body font-medium text-sm group-hover:text-ink-700 transition-colors">
              Add another deck
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
