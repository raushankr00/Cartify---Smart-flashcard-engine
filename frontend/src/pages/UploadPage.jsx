import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { deckAPI } from '../services/api'
import { Upload, FileText, X, Sparkles, ChevronRight, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const navigate = useNavigate()
  const fileRef  = useRef(null)
  const [file, setFile]         = useState(null)
  const [title, setTitle]       = useState('')
  const [cardCount, setCount]   = useState(20)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState('')   // step label

  const onFile = (f) => {
    if (!f || f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (f.size > 20 * 1024 * 1024) { toast.error('File too large — max 20 MB'); return }
    setFile(f)
    // Pre-fill title from filename
    if (!title) setTitle(f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    onFile(e.dataTransfer.files[0])
  }, [title])

  const submit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Upload a PDF first'); return }
    setLoading(true)

    const steps = [
      'Reading your PDF…',
      'Identifying key concepts…',
      'Writing flashcard fronts…',
      'Crafting answers…',
      'Organising your deck…',
    ]
    let si = 0
    setProgress(steps[0])
    const interval = setInterval(() => {
      si = (si + 1) % steps.length
      setProgress(steps[si])
    }, 3500)

    try {
      const form = new FormData()
      form.append('pdf', file)
      form.append('title', title.trim() || file.name)
      form.append('cardCount', String(cardCount))
      const { data } = await deckAPI.upload(form)
      toast.success(`Deck ready — ${data.data.totalCards} cards created!`)
      navigate(`/deck/${data.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed — please try again')
    } finally {
      clearInterval(interval)
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title">New Deck</h1>
        <p className="section-sub">Upload a PDF and we'll build a study-ready flashcard deck from it.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragEnter={e => { e.preventDefault(); setDragging(true) }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
            ${file ? 'border-ink-700 bg-sand-100 cursor-default' : 'border-sand-300 hover:border-sand-500 bg-white hover:bg-sand-50'}
            ${dragging ? 'drag-over' : ''}`}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => onFile(e.target.files[0])} />

          {file ? (
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-10 h-10 bg-ink-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-sand-50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink-900 font-semibold font-body text-sm truncate">{file.name}</p>
                <p className="text-sand-400 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button type="button" onClick={() => { setFile(null); setTitle('') }}
                className="w-7 h-7 rounded-full bg-sand-200 hover:bg-rose-light flex items-center justify-center text-sand-500 hover:text-rose transition-colors flex-shrink-0">
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 bg-sand-100 rounded-2xl flex items-center justify-center mb-3 border border-sand-200">
                <Upload size={20} className="text-sand-400" />
              </div>
              <p className="text-ink-800 font-semibold font-body">Drop your PDF here</p>
              <p className="text-sand-400 text-sm mt-1">or <span className="text-ink-900 underline">browse files</span></p>
              <p className="text-sand-300 text-xs mt-3">Textbooks, lecture notes, articles — up to 20 MB</p>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="label">Deck Title</label>
          <input type="text" placeholder="e.g. Chapter 4 — Cell Biology" maxLength={120}
            className="input" value={title}
            onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Card count */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Number of Cards</label>
            <span className="font-display font-semibold text-ink-900 text-lg">{cardCount}</span>
          </div>
          <input type="range" min="10" max="30" step="5" value={cardCount}
            onChange={e => setCount(Number(e.target.value))}
            className="w-full h-2 bg-sand-200 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-ink-900 [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:shadow-card" />
          <div className="flex justify-between text-xs text-sand-400 font-body mt-1.5">
            <span>10 — Quick review</span>
            <span>20 — Balanced</span>
            <span>30 — Deep study</span>
          </div>
        </div>

        {/* Info note */}
        <div className="flex gap-2.5 bg-sand-100 border border-sand-200 rounded-xl px-4 py-3">
          <Info size={15} className="text-sand-400 flex-shrink-0 mt-0.5" />
          <p className="text-sand-500 text-xs font-body leading-relaxed">
            Works best with text-based PDFs — lecture notes, textbook chapters, articles. 
            Scanned image PDFs won't extract well.
          </p>
        </div>

        <button type="submit" disabled={loading || !file} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2.5">
              <span className="w-4 h-4 border-2 border-sand-400 border-t-sand-50 rounded-full animate-spin" />
              <span className="animate-pulse-soft">{progress}</span>
            </span>
          ) : (
            <> <Sparkles size={16} /> Generate Flashcards <ChevronRight size={15} /> </>
          )}
        </button>
      </form>
    </div>
  )
}
