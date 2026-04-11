import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import HomePage     from './pages/HomePage'
import DeckPage     from './pages/DeckPage'
import StudyPage    from './pages/StudyPage'
import UploadPage   from './pages/UploadPage'

const Guard = ({ children }) => {
  const { user, ready } = useAuth()
  if (!ready) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-ink-800 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

const Public = ({ children }) => {
  const { user, ready } = useAuth()
  if (!ready) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <div className="grain">
        <Routes>
          <Route path="/login"  element={<Public><LoginPage /></Public>} />
          <Route path="/signup" element={<Public><SignupPage /></Public>} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index          element={<HomePage />} />
            <Route path="upload"  element={<UploadPage />} />
            <Route path="deck/:id"      element={<DeckPage />} />
            <Route path="study/:id"     element={<StudyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
