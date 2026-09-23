
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  const navigate = useNavigate()

  const iniciarSesion = async (e) => {
    e.preventDefault()

    if (usuario === '' || password === '') {
      alert('Completa todos los campos')
      return
    }

    setCargando(true)

    try {
      const respuesta = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario, password })
      })

    const texto = await respuesta.text()

console.log('Status:', respuesta.status)
console.log('Respuesta del servidor:', texto)

let data = {}

try {
  data = JSON.parse(texto)
} catch {
  console.log('La respuesta no es JSON')
}

if (respuesta.ok && data.exito) {
        // Guardar la sesión o datos del usuario si es necesario
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        // Redirigir a la pantalla de Inicio
        navigate('/inicio')
      } else {
        alert(data.mensaje || 'Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error)
      alert('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
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

          <button type="submit" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  )
}

export default Login