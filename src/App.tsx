import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { MapProvider } from './context/MapContext'
import Home from './pages/Home'
import Visor from './pages/Visor'
import Glosario from './pages/Glosario'
import Recorridos from './pages/Recorridos'
import Guia from './pages/Guia'
import Privacidad from './pages/Privacidad'
import Creditos from './pages/Creditos'

export default function App() {
  return (
    <MapProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visor" element={<Visor />} />
            <Route path="/glosario" element={<Glosario />} />
            <Route path="/recorridos" element={<Recorridos />} />
            <Route path="/guia" element={<Guia />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/creditos" element={<Creditos />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </MapProvider>
  )
}
