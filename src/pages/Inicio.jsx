
import { Link } from "react-router-dom";
function Inicio() {
  return (
    <div className="inicio-container">

      {/* MENÚ LATERAL */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>Bienestar IA</h2>
        </div>

        <nav className="sidebar-menu">

          <a href="#" className="menu-item active">
            🏠 Inicio
          </a>

          

          <a href="#" className="menu-item">
            ❤️ Bienestar
          </a>

          <a href="#" className="menu-item">
            📋 Evaluaciones
          </a>

          <Link to="/perfil" className="menu-item">
  👤 Mi perfil
</Link>

        </nav>

        <div className="sidebar-bottom">

          <a href="#" className="menu-item">
            ⚙️ Configuración
          </a>

          <a href="/" className="menu-item logout">
            🚪 Cerrar sesión
          </a>

        </div>

      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">

        <div className="top-bar">
          <h1>Bienvenido a Bienestar IA</h1>

          <div className="user">
            👤 Usuario
          </div>
        </div>

        <section className="welcome">

          <h2>¡Hola! 👋</h2>

          <p>
            Has iniciado sesión correctamente.
          </p>

        </section>

      </main>

    </div>
  )
}

export default Inicio
