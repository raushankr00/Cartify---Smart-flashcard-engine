import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { deckAPI, studyAPI } from '../services/api'
import {
  ArrowLeft, Play, BarChart2, Clock, Flame,
  CheckCircle, BookOpen, RotateCcw, Target,
  ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusLabel = { new: 'New', learning: 'Learning', review: 'Review', mastered: 'Mastered' }
const statusCls   = { new: 'badge-new', learning: 'badge-learning', review: 'badge-review', mastered: 'badge-mastered' }

const CardRow = ({ card }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-sand-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-sand-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <p className="text-ink-900 text-sm font-body font-medium leading-snug">{card.front}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <span className={statusCls[card.status]}>{statusLabel[card.status]}</span>
          {open ? <ChevronUp size={14} className="text-sand-400" /> : <ChevronDown size={14} className="text-sand-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-sand-100 bg-sand-50 space-y-2">
          <p className="text-ink-700 text-sm font-body leading-relaxed">{card.back}</p>
          {card.hint && (
            <p className="flex items-center gap-1.5 text-amber text-xs font-body">
              <Lightbulb size={12} /> Hint: {card.hint}
            </p>
          )}
          {card.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {card.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-sand-200 text-sand-600 text-xs rounded-md font-body">{t}</span>
              ))}
            </div>
          )}
          <div className="flex gap-4 text-xs text-sand-400 font-body pt-1">
            <span>Reviews: {card.totalReviews}</span>
            <span>Correct: {card.correctCount}</span>
            {card.nextReview && (
              <span>Next: {new Date(card.nextReview).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DeckPage() {
  const { id } = useParams()
  const [deck, setDeck]   = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoad] = useState(true)
  const [tab, setTab]     = useState('cards')   // cards | stats

  useEffect(() => {
    Promise.all([deckAPI.get(id), studyAPI.stats(id)])
      .then(([d, s]) => { setDeck(d.data.data); setStats(s.data.data) })
      .catch(() => toast.error('Failed to load deck'))
      .finally(() => setLoad(false))
  }, [id])

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-sand-200 rounded w-1/3" />
      <div className="h-4 bg-sand-100 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-3 mt-6">
        {[1,2,3,4].map(i => <div key={i} className="card h-20" />)}
      </div>
    </div>
  )

  if (!deck) return <p className="text-sand-400">Deck not found.</p>

  const pct = deck.totalCards > 0 ? Math.round(deck.cards.filter(c => c.status === 'mastered').length / deck.totalCards * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link to="/" className="btn-ghost text-sm px-0 mb-4 -ml-1 inline-flex gap-1.5 text-sand-500 hover:text-ink-900">
          <ArrowLeft size={15} /> All Decks
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-900">{deck.title}</h1>
            <p className="text-sand-400 text-sm font-body mt-1">
              {deck.totalCards} cards · {deck.sourceFile}
            </p>
          </div>
          <Link to={`/study/${id}`} className="btn-primary flex-shrink-0">
            <Play size={15} /> Study Now
          </Link>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="card py-4">
        <div className="flex justify-between text-sm font-body mb-2">
          <span className="text-sand-500">Overall mastery</span>
          <span className="font-semibold text-ink-900">{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill bg-leaf" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs font-body">
          {[
            { label: 'New',      val: stats?.statusCounts?.new,      cls: 'text-sky' },
            { label: 'Learning', val: stats?.statusCounts?.learning, cls: 'text-amber' },
            { label: 'Review',   val: stats?.statusCounts?.review,   cls: 'text-violet' },
            { label: 'Mastered', val: stats?.statusCounts?.mastered, cls: 'text-leaf' },
          ].map(({ label, val, cls }) => (
            <span key={label} className={`${cls} font-semibold`}>{val ?? 0} <span className="text-sand-400 font-normal">{label}</span></span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-sand-100 p-1 rounded-xl w-fit">
        {['cards', 'stats'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-body font-medium capitalize transition-all
              ${tab === t ? 'bg-white text-ink-900 shadow-card' : 'text-sand-500 hover:text-ink-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Cards tab */}
      {tab === 'cards' && (
        <div className="space-y-2 animate-fade-in">
          {deck.cards.map(card => <CardRow key={card._id} card={card} />)}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && stats && (
        <div className="space-y-4 animate-fade-in">
          {/* Key numbers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Total Reviews',  value: stats.totalReviews,   icon: RotateCcw },
              { label: 'Accuracy',       value: `${stats.accuracy}%`, icon: Target },
              { label: 'Streak',         value: `${stats.streakDays}d`, icon: Flame },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card py-4">
                <Icon size={15} className="text-sand-400 mb-2" />
                <p className="font-display text-2xl font-semibold text-ink-900">{value}</p>
                <p className="text-sand-400 text-xs font-body mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* 7-day forecast */}
          <div className="card">
            <h3 className="font-display font-semibold text-ink-900 text-base mb-4">Due in the next 7 days</h3>
            <div className="flex gap-2 items-end h-20">
              {stats.upcoming?.map(day => {
                const maxCount = Math.max(...stats.upcoming.map(d => d.count), 1)
                const height   = Math.max(4, Math.round(day.count / maxCount * 64))
                return (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-ink-800 text-xs font-body font-semibold">{day.count > 0 ? day.count : ''}</span>
                    <div className="w-full rounded-lg transition-all duration-500"
                      style={{
                        height: `${height}px`,
                        background: day.label === 'Today' ? '#1A1916' : '#D8D5C4'
                      }} />
                    <span className="text-sand-400 text-xs font-body">{day.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
