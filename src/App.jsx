import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component } from 'react'
import Home from './pages/Home'
import DetallePuesto from './pages/DetallePuesto'

// ErrorBoundary para capturar errores de React
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#FDF6E3'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😢</div>
            <h1 style={{ color: '#E63946', marginBottom: '8px', fontSize: '20px' }}>
              Algo salió mal
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #E63946 0%, #FFB703 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/puesto/:id" element={<DetallePuesto />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
