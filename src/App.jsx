import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import DetallePuesto from './pages/DetallePuesto'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/puesto/:id" element={<DetallePuesto />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
