import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Bienestar() {
  const [usuario, setUsuario] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [misPropuestas, setMisPropuestas] = useState([]);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const enviarPropuesta = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch("http://localhost:5000/api/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario ? usuario.id : null,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
        }),
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.exito) {
        alert("¡Propuesta enviada correctamente!");
        
        // Agregar la nueva propuesta al historial local
        if (data.propuesta) {
          setMisPropuestas((prev) => [data.propuesta, ...prev]);
        }

        setTitulo("");
        setDescripcion("");
      } else {
        alert(data.mensaje || "Error al enviar la propuesta.");
      }
    } catch (error) {
      console.error("Error al enviar propuesta:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
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
            <Link to="/configuracion" className="menu-item">
              ⚙️ Configuración
            </Link>
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

          <form onSubmit={enviarPropuesta} className="form-propuesta">
            <div className="form-grupo">
              <label htmlFor="titulo">Título de la propuesta *</label>
              <br />
              <input
                id="titulo"
                type="text"
                placeholder="Ej. Mejora en la cafetería / Torneo de integración"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={enviando}
                required
              />
            </div>

            <br />

            <div className="form-grupo">
              <label htmlFor="descripcion">Descripción detallada *</label>
              <br />
              <textarea
                id="descripcion"
                placeholder="Escribe tu propuesta aquí..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={5}
                disabled={enviando}
                required
              ></textarea>
            </div>

            <br />

            <button type="submit" disabled={enviando} className="btn-enviar">
              {enviando ? "Enviando propuesta..." : "Enviar propuesta"}
            </button>
          </form>
        </section>

        {/* HISTORIAL RECIENTE DE ENVIOS EN ESTA SESIÓN */}
        {misPropuestas.length > 0 && (
          <section className="welcome" style={{ marginTop: "20px" }}>
            <h3>Propuestas enviadas en esta sesión</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {misPropuestas.map((p, idx) => (
                <li
                  key={p.id || idx}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "10px",
                    backgroundColor: "#f9fafb"
                  }}
                >
                  <strong>{p.titulo}</strong>
                  <p style={{ margin: "5px 0 0 0", color: "#4b5563" }}>
                    {p.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default Bienestar;