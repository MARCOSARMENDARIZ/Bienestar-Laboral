import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Bienestar() {
  const [usuario, setUsuario] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const enviarPropuesta = async (e) => {
    e.preventDefault();

    if (!titulo || !descripcion) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:5000/api/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario ? usuario.id : null,
          titulo,
          descripcion,
        }),
      });

      if (respuesta.ok) {
        alert("Propuesta enviada correctamente");
        setTitulo("");
        setDescripcion("");
      } else {
        alert("Error al enviar la propuesta");
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="inicio-container">
      {/* MENÚ LATERAL */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Bienestar IA</h2>
        </div>

        <nav className="sidebar-menu">
          <Link to="/inicio" className="menu-item">
            🏠 Inicio
          </Link>
          <Link to="/bienestar" className="menu-item active">
            ❤️ Bienestar
          </Link>
          <a href="#" className="menu-item">
            📋 Evaluaciones
          </a>
          <Link to="/perfil" className="menu-item">
            👤 Mi perfil
          </Link>
        </nav>

        <div className="sidebar-bottom">
          {usuario?.rol === "admin" && (
            <a href="#" className="menu-item">
              ⚙️ Configuración
            </a>
          )}
          <a
            href="/"
            className="menu-item logout"
            onClick={() => localStorage.removeItem("usuario")}
          >
            🚪 Cerrar sesión
          </a>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="top-bar">
          <h1>Bienestar</h1>
          <div className="user">
            👤 {usuario ? usuario.nombre : "Cargando..."}
          </div>
        </div>

        <section className="welcome">
          <h2>Ideas y Propuestas 💡</h2>

          <form onSubmit={enviarPropuesta}>
            <div>
              <label>Título:</label>
              <br />
              <input
                type="text"
                placeholder="Ingresa el título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <br />

            <div>
              <label>Descripción:</label>
              <br />
              <textarea
                placeholder="Escribe tu propuesta aquí..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
            </div>

            <br />

            <button type="submit">Enviar propuesta</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Bienestar;