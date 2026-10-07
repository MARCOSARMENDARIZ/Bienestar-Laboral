
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Perfil from './pages/Perfil' 

import './App.css'
import Configuracion from './pages/configuracion'
import Evaluaciones from './pages/Evaluaciones'
import Bienestar from './pages/Bienestar'
import Chatbot from './pages/Chatbot'

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PANTALLA DE LOGIN */}
        <Route path="/" element={<Login />} />

        {/* SISTEMA */}
        <Route path="/inicio" element={<Inicio />} />

        {/* PERFIL */}
        <Route path="/perfil" element={<Perfil />} />

        {/* CONFIGURACION */}
        <Route path="/configuracion" element={<Configuracion />} />

        {/* EVALUACIONES */}
        <Route path="/evaluaciones" element={<Evaluaciones />} />

        {/* EVALUACIONES */}
        <Route path="/bienestar" element={<Bienestar />} />

        {/* CHAT */}
        <Route path="/chat" element={<Chatbot />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App
