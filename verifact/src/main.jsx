import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          fontFamily: "'Inter', -apple-system, sans-serif",
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '40px', maxWidth: '420px', width: '100%' }}>
            <h1 style={{ color: '#0F172A', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Something went wrong</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 24px', background: '#22C55E', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
