import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  signup: d  => api.post('/auth/signup', d),
  login:  d  => api.post('/auth/login', d),
  me:     () => api.get('/auth/me'),
}

export const deckAPI = {
  upload:   (form)  => api.post('/decks/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list:     ()      => api.get('/decks'),
  get:      (id)    => api.get(`/decks/${id}`),
  delete:   (id)    => api.delete(`/decks/${id}`),
  due:      (id)    => api.get(`/decks/${id}/due`),
}

export const studyAPI = {
  review: (deckId, cardId, rating) => api.post(`/study/${deckId}/review`, { cardId, rating }),
  stats:  (deckId)                  => api.get(`/study/${deckId}/stats`),
}

export default api
