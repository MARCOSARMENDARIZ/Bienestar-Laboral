
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const iniciarSesion = (e) => {
    e.preventDefault()

    // Verificar que los campos estén llenos
    if (usuario === '' || password === '') {
      alert('Completa todos los campos')
      return
    }

    // Mandar a la pantalla de Inicio
    navigate('/inicio')
  }

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>Bienestar IA</h1>

        <p>Inicia sesión para continuar</p>

        <form onSubmit={iniciarSesion}>

          <label>Usuario</label>

          <input
            type="text"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Iniciar sesión
          </button>

        </form>

        <a href="#">
          ¿Olvidaste tu contraseña?
        </a>

      </div>

    </div>
  )
}

export default Login