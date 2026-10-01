import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Inicio() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <div className="inicio-container">

      {/* MENÚ LATERAL */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>Bienestar IA</h2>
        </div>

        <nav className="sidebar-menu">

          <a href="#" className="menu-item active">
            📊 Tablero
          </a>

          <Link to="/bienestar" className="menu-item">
            ❤️ Bienestar
          </Link>

          <Link to="/evaluaciones" className="menu-item">
            📋 Evaluaciones
          </Link>

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

          <a href="/" className="menu-item logout">
            🚪 Cerrar sesión
          </a>

        </div>

      </aside>


      {/* CONTENIDO PRINCIPAL - TABLERO EJECUTIVO */}
      <main className="main-content">

        {/* TOP BAR */}
        <div className="top-bar">
          <div>
            <h1>Tablero Ejecutivo</h1>
            <p className="subtitle">Resumen general del estado de bienestar organizacional</p>
          </div>

          <div className="user">
            👤 {usuario ? usuario.nombre : "Cargando..."}
          </div>
        </div>

        {/* METRICAS PRINCIPALES (KPIS) */}
        <section className="kpi-grid">

          <div className="kpi-card">
            <div className="kpi-icon icon-blue">📊</div>
            <div className="kpi-data">
              <span className="kpi-title">Índice del Bienestar</span>
              <h3 className="kpi-value">84%</h3>
              <span className="kpi-trend positive">↑ +3.2% este mes</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon icon-green">📋</div>
            <div className="kpi-data">
              <span className="kpi-title">Evaluaciones Completadas</span>
              <h3 className="kpi-value">128</h3>
              <span className="kpi-trend positive">85% de participación</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon icon-orange">⚡</div>
            <div className="kpi-data">
              <span className="kpi-title">Nivel de Estrés Promedio</span>
              <h3 className="kpi-value">Bajo</h3>
              <span className="kpi-trend neutral">Estable vs mes anterior</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon icon-purple">👤</div>
            <div className="kpi-data">
              <span className="kpi-title">Usuarios Activos</span>
              <h3 className="kpi-value">45</h3>
              <span className="kpi-trend positive">↑ 5 nuevos esta semana</span>
            </div>
          </div>

        </section>


        {/* SECCIÓN DOS COLUMNAS: ACCESOS RÁPIDOS Y ACTIVIDAD RECIENTE */}
        <div className="dashboard-grid">

          {/* ACCESOS RÁPIDOS */}
          <section className="dashboard-card">
            <h3>🚀 Accesos Rápidos</h3>
            <p className="card-description">Navega directamente a las áreas clave del sistema</p>

            <div className="quick-actions">
              <Link to="/evaluaciones" className="quick-btn">
                <span className="quick-icon">📋</span>
                <div>
                  <strong>Realizar Evaluación</strong>
                  <span>Mide tu nivel de bienestar actual</span>
                </div>
              </Link>

              <Link to="/bienestar" className="quick-btn">
                <span className="quick-icon">❤️</span>
                <div>
                  <strong>Módulo de Bienestar</strong>
                  <span>Revisa recomendaciones y planes</span>
                </div>
              </Link>

              <Link to="/perfil" className="quick-btn">
                <span className="quick-icon">👤</span>
                <div>
                  <strong>Mi Perfil</strong>
                  <span>Actualiza tu información personal</span>
                </div>
              </Link>
            </div>
          </section>


          {/* ACTIVIDAD Y ALERTAS RECIENTES */}
          <section className="dashboard-card">
            <h3>🔔 Actividad y Novedades</h3>
            <p className="card-description">Eventos recientes en la plataforma</p>

            <ul className="activity-list">
              <li className="activity-item">
                <span className="activity-badge badge-green">Novedad</span>
                <div>
                  <p>Nueva evaluación del clima organizacional disponible.</p>

                </div>
              </li>

              <li className="activity-item">
                <span className="activity-badge badge-blue">Recomendación</span>
                <div>
                  <p>Revisa tu reporte mensual de equilibrio laboral.</p>

                </div>
              </li>

              <li className="activity-item">
                <span className="activity-badge badge-orange">Recordatorio</span>
                <div>
                  <p>Próxima sesión de pausas activas grupales.</p>

                </div>
              </li>
            </ul>
          </section>

        </div>

      </main>

    </div>
  );
}

export default Inicio;