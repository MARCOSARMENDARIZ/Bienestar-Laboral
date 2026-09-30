import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  // Estados para el flujo de recuperación en modales
  const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false)
  const [paso, setPaso] = useState(1) // Paso 1: Validar correo, Paso 2: Cambiar contraseña
  
  const [emailRecuperacion, setEmailRecuperacion] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [procesando, setProcesando] = useState(false)

  const navigate = useNavigate()

  // Iniciar Sesión Normal
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      })

      const texto = await respuesta.text()
      let data = {}

      try {
        data = JSON.parse(texto)
      } catch {
        console.log('La respuesta no es JSON')
      }

      if (respuesta.ok && data.exito) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
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

  // PASO 1: Verificar si el correo existe
  const handleVerificarEmail = async (e) => {
    e.preventDefault()
    setProcesando(true)

    try {
      const res = await fetch('http://localhost:5000/api/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacion })
      })

      const data = await res.json()

      if (res.ok && data.exito) {
        // Correo encontrado -> Avanzamos al paso 2
        setPaso(2)
      } else {
        alert(data.mensaje || 'El correo ingresado no está registrado')
      }
    } catch (error) {
      console.error('Error al verificar correo:', error)
      alert('Error de conexión con el servidor')
    } finally {
      setProcesando(false)
    }
  }

  // PASO 2: Guardar la nueva contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault()

    if (nuevaPassword !== confirmarPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (nuevaPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setProcesando(true)

    try {
      const res = await fetch('http://localhost:5000/api/cambiar-password-directo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRecuperacion,
          nuevaPassword
        })
      })

      const data = await res.json()

      if (res.ok && data.exito) {
        alert('✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
        cerrarModalRecuperacion()
      } else {
        alert(data.mensaje || 'No se pudo actualizar la contraseña')
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      alert('Error de conexión con el servidor')
    } finally {
      setProcesando(false)
    }
  }

  // Limpiar estados al cerrar el modal
  const cerrarModalRecuperacion = () => {
    setMostrarModalRecuperar(false)
    setPaso(1)
    setEmailRecuperacion('')
    setNuevaPassword('')
    setConfirmarPassword('')
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

        <a
          href="#olvidaste-password"
          onClick={(e) => {
            e.preventDefault()
            setMostrarModalRecuperar(true)
          }}
          className="link-olvidaste"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
      {mostrarModalRecuperar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>{paso === 1 ? '🔍 Verificar Cuenta' : '🔑 Nueva Contraseña'}</h2>
              <button className="btn-cerrar-modal" onClick={cerrarModalRecuperacion}>
                ✕
              </button>
            </div>

            {/* PASO 1: Ingresar Correo */}
            {paso === 1 && (
              <form onSubmit={handleVerificarEmail} className="modal-form">
                <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                  Ingresa tu correo electrónico registrado para verificar tu cuenta.
                </p>

                <div className="form-grupo" style={{ gridColumn: 'span 2' }}>
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    value={emailRecuperacion}
                    onChange={(e) => setEmailRecuperacion(e.target.value)}
                    required
                    placeholder="ejemplo@empresa.com"
                  />
                </div>

                <div className="modal-acciones">
                  <button type="button" className="btn-cancelar" onClick={cerrarModalRecuperacion}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar" disabled={procesando}>
                    {procesando ? 'Verificando...' : 'Continuar'}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 2: Escribir Nueva Contraseña */}
            {paso === 2 && (
              <form onSubmit={handleCambiarPassword} className="modal-form">
                <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                  Cuenta verificada (<b>{emailRecuperacion}</b>). Ingresa tu nueva contraseña.
                </p>

                <div className="form-grupo" style={{ gridColumn: 'span 2' }}>
                  <label>Nueva Contraseña *</label>
                  <input
                    type="password"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-grupo" style={{ gridColumn: 'span 2' }}>
                  <label>Confirmar Nueva Contraseña *</label>
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="modal-acciones">
                  <button type="button" className="btn-cancelar" onClick={cerrarModalRecuperacion}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar" disabled={procesando}>
                    {procesando ? 'Guardando...' : 'Guardar Contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login