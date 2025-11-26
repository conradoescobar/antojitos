import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DetallePuesto from './pages/DetallePuesto'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puesto/:id" element={<DetallePuesto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
