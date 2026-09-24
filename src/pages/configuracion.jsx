import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Configuracion() {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para el modal y formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
    puesto: "",
    departamento: "",
    telefono: ""
  });

  // Cargar lista de usuarios
  const obtenerUsuarios = () => {
    fetch("http://localhost:5000/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          setListaUsuarios(data.usuarios);
        }
      })
      .catch((err) => console.error("Error al obtener lista de usuarios:", err))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleChange = (e) => {
    setNuevoUsuario({
      ...nuevoUsuario,
      [e.target.name]: e.target.value
    });
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await fetch("http://localhost:5000/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await res.json();

      if (res.ok && data.exito) {
        alert("¡Usuario registrado exitosamente!");
        setMostrarModal(false);
        // Limpiar formulario
        setNuevoUsuario({
          nombre: "",
          email: "",
          password: "",
          rol: "usuario",
          puesto: "",
          departamento: "",
          telefono: ""
        });
        // Recargar la tabla
        obtenerUsuarios();
      } else {
        alert(data.mensaje || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error al enviar petición:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="config-container">
      {/* ENCABEZADO */}
      <div className="config-header">
        <Link to="/inicio" className="btn-volver">
          ←
        </Link>
        <div>
          <h1>⚙️ Configuración del Sistema</h1>
          <p>Gestión de opciones globales y usuarios registrados</p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="config-contenido">
        <div className="config-card full-width">
          <div className="card-header">
            <h2>👥 Usuarios Registrados</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn-agregar-usuario" 
                onClick={() => setMostrarModal(true)}
              >
                ➕ Agregar Nuevo Usuario
              </button>
              <span className="badge-contador">{listaUsuarios.length} usuarios</span>
            </div>
          </div>

          {cargando ? (
            <p className="cargando-texto">Cargando lista de usuarios...</p>
          ) : (
            <div className="tabla-responsive">
              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Rol</th>
                    <th>Puesto</th>
                    <th>Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {listaUsuarios.map((usr) => (
                    <tr key={usr.id}>
                      <td>#{usr.id}</td>
                      <td className="columna-nombre">
                        <div className="user-avatar-mini">👤</div>
                        {usr.nombre}
                      </td>
                      <td>{usr.email}</td>
                      <td>
                        <span className={`badge-rol ${usr.rol}`}>
                          {usr.rol}
                        </span>
                      </td>
                      <td>{usr.puesto || "—"}</td>
                      <td>{usr.departamento || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTRAR USUARIO */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>➕ Registrar Nuevo Usuario</h2>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRegistrar} className="modal-form">
              <div className="form-grupo">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoUsuario.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej. María López"
                />
              </div>

              <div className="form-grupo">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="email"
                  value={nuevoUsuario.email}
                  onChange={handleChange}
                  required
                  placeholder="ejemplo@empresa.com"
                />
              </div>

              <div className="form-grupo">
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="form-grupo">
                <label>Rol de Usuario *</label>
                <select name="rol" value={nuevoUsuario.rol} onChange={handleChange}>
                  <option value="usuario">Usuario / Colaborador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-grupo">
                <label>Puesto</label>
                <input
                  type="text"
                  name="puesto"
                  value={nuevoUsuario.puesto}
                  onChange={handleChange}
                  placeholder="Ej. Analista de RH"
                />
              </div>

              <div className="form-grupo">
                <label>Departamento</label>
                <input
                  type="text"
                  name="departamento"
                  value={nuevoUsuario.departamento}
                  onChange={handleChange}
                  placeholder="Ej. Recursos Humanos"
                />
              </div>

              <div className="form-grupo">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={nuevoUsuario.telefono}
                  onChange={handleChange}
                  placeholder="Ej. 555 123 4567"
                />
              </div>

              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? "Registrando..." : "Registrar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Configuracion;