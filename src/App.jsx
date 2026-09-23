
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Perfil from './pages/Perfil' 

import './App.css'

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

      </Routes>

    </BrowserRouter>
  )
}

export default App
