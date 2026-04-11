import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1916',
            color: '#FAFAF7',
            border: '1px solid #3D3B35',
            borderRadius: '12px',
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#3D6B4F', secondary: '#FAFAF7' } },
          error:   { iconTheme: { primary: '#B5433A', secondary: '#FAFAF7' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
