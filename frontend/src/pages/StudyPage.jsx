import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { deckAPI, studyAPI } from '../services/api'
import {
  ArrowLeft, Trophy, RotateCcw, CheckCircle,
  ChevronRight, Eye, Lightbulb, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

// Rating config — labels the user actually sees (no SM-2 terminology)
const RATINGS = [
  { q: 0, label: 'No idea',     cls: 'bg-rose-light text-rose border-rose/25    hover:bg-rose/10' },
  { q: 2, label: 'Almost',      cls: 'bg-amber-light text-amber border-amber/25  hover:bg-amber/10' },
  { q: 3, label: 'Got it',      cls: 'bg-sky-light text-sky border-sky/25        hover:bg-sky/10' },
  { q: 5, label: 'Easy',        cls: 'bg-leaf-light text-leaf border-leaf/25     hover:bg-leaf/10' },
]

// Flip card component
const FlashCard = ({ card, flipped, onFlip }) => (
  <div className="perspective w-full cursor-pointer select-none" style={{ height: '280px' }} onClick={onFlip}>
    <div className={`flip-inner w-full h-full relative ${flipped ? 'flipped' : ''}`}>
      {/* Front */}
      <div className="flip-face absolute inset-0 card flex flex-col items-center justify-center p-8 text-center shadow-lifted">
        <span className="text-sand-300 text-xs font-body uppercase tracking-widest mb-4 font-semibold">Question</span>
        <p className="font-display font-semibold text-ink-900 text-xl leading-snug">{card.front}</p>
        {!flipped && card.hint && (
          <div className="mt-5 flex items-center gap-1.5 text-amber text-xs font-body">
            <Lightbulb size={12} /> Hint: {card.hint}
          </div>
        )}
        {!flipped && (
          <div className="mt-6 flex items-center gap-1.5 text-sand-300 text-xs font-body animate-pulse-soft">
            <Eye size={12} /> Tap to reveal answer
          </div>
        )}
      </div>

      {/* Back */}
      <div className="flip-back-face absolute inset-0 card flex flex-col items-center justify-center p-8 text-center shadow-lifted bg-ink-900">
        <span className="text-sand-500 text-xs font-body uppercase tracking-widest mb-4 font-semibold">Answer</span>
        <p className="font-body text-sand-100 text-base leading-relaxed">{card.back}</p>
        {card.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {card.tags.map(t => (
              <span key={t} className="px-2 py-0.5 bg-ink-700 text-sand-400 text-xs rounded-md font-body">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)

export default function StudyPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [deck, setDeck]       = useState(null)
  const [queue, setQueue]     = useState([])   // cards to study this session
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rating, setRating]   = useState(null)
  const [loading, setLoad]    = useState(true)
  const [saving, setSaving]   = useState(false)

  // Session result tallies
  const [results, setResults] = useState({ correct: 0, wrong: 0, easy: 0 })
  const [done, setDone]       = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await deckAPI.due(id)
      setDeck({ id: data.data.deckId, title: data.data.title })
      let cards = data.data.cards

      // If no cards are due, load all cards (user chose "Review All")
      if (cards.length === 0) {
        const full = await deckAPI.get(id)
        cards = full.data.data.cards
      }

      setQueue(cards)
    } catch { toast.error('Failed to load cards') }
    finally { setLoad(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const current = queue[idx]

  const handleRate = async (q) => {
    if (saving) return
    setRating(q)
    setSaving(true)

    try {
      await studyAPI.review(id, current._id, q)
      // Tally
      setResults(r => ({
        correct: r.correct + (q >= 3 ? 1 : 0),
        wrong:   r.wrong   + (q < 3  ? 1 : 0),
        easy:    r.easy    + (q === 5 ? 1 : 0),
      }))
    } catch { toast.error('Failed to save review') }

    // Small delay before advancing so user sees the selected rating
    setTimeout(() => {
      if (idx + 1 >= queue.length) {
        setDone(true)
      } else {
        setIdx(i => i + 1)
        setFlipped(false)
        setRating(null)
      }
      setSaving(false)
    }, 350)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (done || loading) return
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f) }
      if (flipped) {
        if (e.key === '1') handleRate(0)
        if (e.key === '2') handleRate(2)
        if (e.key === '3') handleRate(3)
        if (e.key === '4') handleRate(5)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, done, loading, idx])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-6 h-6 border-2 border-ink-800 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Done screen ──
  if (done) {
    const total = results.correct + results.wrong
    const pct   = total > 0 ? Math.round(results.correct / total * 100) : 0
    return (
      <div className="max-w-md mx-auto animate-scale-in">
        <div className="card text-center py-10 shadow-float">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4
            ${pct >= 80 ? 'bg-leaf-light' : pct >= 50 ? 'bg-amber-light' : 'bg-rose-light'}`}>
            <Trophy size={28} className={pct >= 80 ? 'text-leaf' : pct >= 50 ? 'text-amber' : 'text-rose'} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">Session complete!</h2>
          <p className="text-sand-400 font-body text-sm mt-1">{deck?.title}</p>

          <div className="flex justify-center gap-8 mt-6 mb-6">
            <div>
              <p className="font-display text-3xl font-semibold text-ink-900">{pct}<span className="text-sand-400 text-lg">%</span></p>
              <p className="text-sand-400 text-xs font-body">Accuracy</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-leaf">{results.correct}</p>
              <p className="text-sand-400 text-xs font-body">Correct</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-rose">{results.wrong}</p>
              <p className="text-sand-400 text-xs font-body">Missed</p>
            </div>
          </div>

          <p className="text-sand-400 text-sm font-body mb-6">
            {pct >= 80 ? 'Excellent retention — keep it up! 🎉'
            : pct >= 60 ? 'Good progress. A few more rounds and you\'ll have it locked in.'
            : 'Keep going — spaced repetition works best with consistency.'}
          </p>

          <div className="flex gap-3 justify-center">
            <Link to={`/deck/${id}`} className="btn-secondary">
              <Layers size={15} /> View Deck
            </Link>
            <button onClick={() => { setDone(false); setIdx(0); setFlipped(false); setRating(null); setResults({ correct: 0, wrong: 0, easy: 0 }); load() }}
              className="btn-primary">
              <RotateCcw size={15} /> Study Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return (
    <div className="empty-state">
      <div className="empty-icon"><CheckCircle size={24} className="text-leaf" /></div>
      <h3 className="font-display font-semibold text-ink-900 text-lg">Nothing due!</h3>
      <p className="text-sand-400 text-sm mt-1">All caught up. Come back tomorrow.</p>
      <Link to={`/deck/${id}`} className="btn-secondary mt-4">View Deck</Link>
    </div>
  )

  const progressPct = Math.round((idx / queue.length) * 100)

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/deck/${id}`} className="btn-ghost text-sm px-2 gap-1.5 text-sand-500 hover:text-ink-900">
          <ArrowLeft size={15} /> {deck?.title}
        </Link>
        <span className="text-sand-400 text-sm font-body">{idx + 1} / {queue.length}</span>
      </div>

      {/* Progress */}
      <div className="progress-track">
        <div className="progress-fill bg-ink-800" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Card */}
      <FlashCard card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

      {/* Rating buttons — only shown when flipped */}
      {flipped && (
        <div className="space-y-3 animate-slide-up">
          <p className="text-center text-sand-400 text-xs font-body">How well did you know this?</p>
          <div className="flex gap-2">
            {RATINGS.map(r => (
              <button key={r.q}
                onClick={() => handleRate(r.q)}
                disabled={saving}
                className={`rating-btn ${r.cls} ${rating === r.q ? 'scale-[0.97] ring-2 ring-offset-1 ring-current' : ''}`}>
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-center text-sand-200 text-xs font-mono mt-1">
            Keyboard: <kbd className="bg-sand-100 text-sand-500 px-1.5 py-0.5 rounded text-xs">1</kbd> — <kbd className="bg-sand-100 text-sand-500 px-1.5 py-0.5 rounded text-xs">4</kbd>
          </p>
        </div>
      )}

      {/* Flip hint when not flipped */}
      {!flipped && (
        <div className="text-center">
          <button onClick={() => setFlipped(true)}
            className="btn-secondary mx-auto">
            <Eye size={15} /> Reveal Answer
          </button>
          <p className="text-sand-300 text-xs font-mono mt-2">
            or press <kbd className="bg-sand-100 text-sand-500 px-1.5 py-0.5 rounded text-xs">Space</kbd>
          </p>
        </div>
      )}
    </div>
  )
}
