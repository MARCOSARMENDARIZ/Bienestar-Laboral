import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Encuestas({ usuario }) {
  // Estados para encuestas y carga
  const [encuestas, setEncuestas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalResponder, setMostrarModalResponder] = useState(false);
  const [mostrarModalResultados, setMostrarModalResultados] = useState(false);

  // Estado para el Análisis de IA y Carga
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);

  // Estado para la encuesta activa
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
  const [preguntasEncuesta, setPreguntasEncuesta] = useState([]);
  const [respuestasForm, setRespuestasForm] = useState({});

  // Estado para el formulario de nueva encuesta (Admin)
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevasPreguntas, setNuevasPreguntas] = useState([
    { texto_pregunta: "", tipo_respuesta: "escala", opciones: ["", ""] }
  ]);

  // Usuario y Permisos
  const usuarioActual = usuario || JSON.parse(localStorage.getItem("usuario") || "{}");
  const esAdmin = usuarioActual?.rol === "admin";

  const backendHost = window.location.hostname;
  const API_URL = `http://${backendHost}:5000/api/encuestas`;

  // 1. Obtener encuestas desde el Backend
  const cargarEncuestas = async () => {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.exito) {
        setEncuestas(data.encuestas);
      }
    } catch (error) {
      console.error("Error al obtener las encuestas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEncuestas();
  }, []);

  // 2. Abrir modal para responder encuesta
  const abrirResponder = async (encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setRespuestasForm({});
    try {
      const res = await fetch(`${API_URL}/${encuesta.id}`);
      const data = await res.json();
      if (data.exito) {
        setPreguntasEncuesta(data.encuesta.preguntas || []);
        setMostrarModalResponder(true);
      }
    } catch (error) {
      console.error("Error al cargar la encuesta:", error);
      alert("No se pudieron cargar las preguntas de esta encuesta.");
    }
  };

  // 3. Abrir modal para ver resultados (IA para Admin / Resumen personal para Usuario)
  const abrirResultados = async (encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setAnalisisIA(null);
    setMostrarModalResultados(true);

    try {
      const res = await fetch(`${API_URL}/${encuesta.id}`);
      const data = await res.json();
      if (data.exito) {
        setPreguntasEncuesta(data.encuesta.preguntas || []);
      }

      // Si el usuario es ADMIN, solicitamos el análisis automatizado con la IA
      if (esAdmin) {
        setCargandoAnalisis(true);
        const resIA = await fetch(`${API_URL}/${encuesta.id}/analizar-ia`);
        const dataIA = await resIA.json();
        if (dataIA.exito) {
          setAnalisisIA(dataIA.analisis);
        } else {
          console.error("No se pudo obtener el análisis de la IA:", dataIA.mensaje);
        }
      }
    } catch (error) {
      console.error("Error al cargar resultados:", error);
    } finally {
      setCargandoAnalisis(false);
    }
  };

  // Manejar cambios en las respuestas
  const handleRespuestaChange = (preguntaId, campo, valor) => {
    setRespuestasForm((prev) => ({
      ...prev,
      [preguntaId]: {
        ...prev[preguntaId],
        pregunta_id: preguntaId,
        [campo]: valor
      }
    }));
  };

  // 4. Guardar Respuestas del Usuario
  const enviarRespuestas = async (e) => {
    e.preventDefault();
    const payloadRespuestas = Object.values(respuestasForm);

    if (payloadRespuestas.length === 0) {
      alert("Por favor responde al menos una pregunta antes de enviar.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${encuestaSeleccionada.id}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioActual?.id || null,
          respuestas: payloadRespuestas
        })
      });

      const data = await res.json();
      if (data.exito) {
        alert("¡Respuestas enviadas con éxito!");
        setMostrarModalResponder(false);
        cargarEncuestas();
      } else {
        alert(data.mensaje || "Error al enviar respuestas.");
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
    }
  };

  // Manejo de creación de preguntas
  const handleAgregarPregunta = () => {
    setNuevasPreguntas([
      ...nuevasPreguntas,
      { texto_pregunta: "", tipo_respuesta: "escala", opciones: ["", ""] }
    ]);
  };

  const handlePreguntaChange = (index, field, value) => {
    const list = [...nuevasPreguntas];
    list[index][field] = value;
    setNuevasPreguntas(list);
  };

  const handleOpcionChange = (pIndex, oIndex, value) => {
    const list = [...nuevasPreguntas];
    list[pIndex].opciones[oIndex] = value;
    setNuevasPreguntas(list);
  };

  const handleAgregarOpcion = (pIndex) => {
    const list = [...nuevasPreguntas];
    list[pIndex].opciones.push("");
    setNuevasPreguntas(list);
  };

  // 5. Crear Nueva Encuesta
  const guardarNuevaEncuesta = async (e) => {
    e.preventDefault();

    if (!nuevoTitulo.trim()) {
      alert("El título de la encuesta es obligatorio.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: nuevoTitulo,
          descripcion: nuevaDescripcion,
          creado_por: usuarioActual?.id || null,
          preguntas: nuevasPreguntas
        })
      });

      const data = await res.json();
      if (data.exito) {
        alert("¡Encuesta publicada correctamente!");
        setMostrarModalCrear(false);
        setNuevoTitulo("");
        setNuevaDescripcion("");
        setNuevasPreguntas([{ texto_pregunta: "", tipo_respuesta: "escala", opciones: ["", ""] }]);
        cargarEncuestas();
      } else {
        alert(data.mensaje || "Error al crear la encuesta.");
      }
    } catch (error) {
      console.error("Error al guardar encuesta:", error);
    }
  };

  // Métricas Rápidas
  const encuestasActivas = encuestas.filter((e) => e.estado === "Activa").length;
  const totalRespuestas = encuestas.reduce((acc, curr) => acc + (curr.respuestasCount || 0), 0);

  return (
    <div className="evaluaciones-container">
      {/* ENCABEZADO */}
      <div className="config-header">
        <Link to="/inicio" className="btn-volver">←</Link>
        <div>
          <h1>📋 Encuestas y Cuestionarios</h1>
          <p>Crea encuestas para los usuarios y analiza sus respuestas con IA</p>
        </div>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="evaluaciones-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">📝</div>
          <div>
            <h3>Encuestas Activas</h3>
            <p className="kpi-numero">{encuestasActivas}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">💬</div>
          <div>
            <h3>Respuestas Recibidas</h3>
            <p className="kpi-numero">{totalRespuestas}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">📊</div>
          <div>
            <h3>Total Registradas</h3>
            <p className="kpi-numero">{encuestas.length}</p>
          </div>
        </div>
      </div>

      {/* TARJETAS DE ENCUESTAS */}
      <div className="config-card full-width">
        <div className="card-header">
          <h2>LISTA DE ENCUESTAS</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {esAdmin && (
              <button className="btn-agregar-usuario" onClick={() => setMostrarModalCrear(true)}>
                ➕ Crear Nueva Encuesta
              </button>
            )}
            <span className="badge-contador">{encuestas.length} encuestas</span>
          </div>
        </div>

        {cargando ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Cargando encuestas...</p>
        ) : (
          <div className="encuestas-grid">
            {encuestas.map((enc) => (
              <div key={enc.id} className="encuesta-card">
                <div className="encuesta-card-header">
                  <span className={`status-pill ${enc.estado.toLowerCase()}`}>
                    {enc.estado}
                  </span>
                  <span className="subtexto-puesto">{enc.fechaCreacion}</span>
                </div>

                <h3>{enc.titulo}</h3>
                <p className="encuesta-desc">{enc.descripcion}</p>

                <div className="encuesta-meta">
                  <span>❓ {enc.preguntasCount} Preguntas</span>
                  <span>💬 {enc.respuestasCount} Respuestas</span>
                </div>

                <div className="encuesta-acciones">
                  {enc.estado === "Activa" && (
                    <button className="btn-responder" onClick={() => abrirResponder(enc)}>
                      ✏️ Responder Encuesta
                    </button>
                  )}
                  <button className="btn-resultados" onClick={() => abrirResultados(enc)}>
                    📊 Ver Resultados
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: CREAR ENCUESTA (Admin) */}
      {mostrarModalCrear && esAdmin && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>➕ Crear Nueva Encuesta</h2>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalCrear(false)}>✕</button>
            </div>

            <form className="modal-form" onSubmit={guardarNuevaEncuesta}>
              <div className="form-grupo">
                <label>Título de la Encuesta *</label>
                <input
                  type="text"
                  placeholder="Ej. Clima Organizacional Q2"
                  className="input-estilizado"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="form-grupo">
                <label>Descripción / Instrucciones</label>
                <textarea
                  placeholder="Explica brevemente el objetivo de la encuesta..."
                  rows="2"
                  className="input-estilizado"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                ></textarea>
              </div>

              <hr />

              {nuevasPreguntas.map((p, pIdx) => (
                <div key={pIdx} className="pregunta-box" style={{ marginBottom: "15px", border: "1px solid #e5e7eb", padding: "12px", borderRadius: "8px" }}>
                  <div className="form-grupo">
                    <label>Pregunta #{pIdx + 1} *</label>
                    <input
                      type="text"
                      placeholder="Escribe la pregunta..."
                      className="input-estilizado"
                      value={p.texto_pregunta}
                      onChange={(e) => handlePreguntaChange(pIdx, "texto_pregunta", e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-grupo">
                    <label>Tipo de Respuesta</label>
                    <select
                      className="input-estilizado"
                      value={p.tipo_respuesta}
                      onChange={(e) => handlePreguntaChange(pIdx, "tipo_respuesta", e.target.value)}
                    >
                      <option value="escala">Escala de 1 a 5 estrellas</option>
                      <option value="opcion">Opción múltiple</option>
                      <option value="texto">Texto abierto</option>
                    </select>
                  </div>

                  {p.tipo_respuesta === "opcion" && (
                    <div style={{ marginLeft: "10px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Opciones:</label>
                      {p.opciones.map((op, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          placeholder={`Opción ${oIdx + 1}`}
                          className="input-estilizado"
                          style={{ marginTop: "4px" }}
                          value={op}
                          onChange={(e) => handleOpcionChange(pIdx, oIdx, e.target.value)}
                        />
                      ))}
                      <button
                        type="button"
                        style={{ marginTop: "6px", fontSize: "0.8rem", cursor: "pointer" }}
                        onClick={() => handleAgregarOpcion(pIdx)}
                      >
                        ➕ Agregar Opción
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className="btn-agregar-pregunta" onClick={handleAgregarPregunta}>
                ➕ Agregar otra pregunta
              </button>

              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModalCrear(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Publicar Encuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESPONDER ENCUESTA */}
      {mostrarModalResponder && encuestaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>✏️ {encuestaSeleccionada.titulo}</h2>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalResponder(false)}>✕</button>
            </div>

            <form className="modal-form" onSubmit={enviarRespuestas}>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{encuestaSeleccionada.descripcion}</p>

              {preguntasEncuesta.map((preg, idx) => (
                <div key={preg.id} className="pregunta-box">
                  <label className="pregunta-titulo">
                    {idx + 1}. {preg.texto_pregunta}
                  </label>

                  {/* ESCALA DE 1 A 5 */}
                  {preg.tipo_respuesta === "escala" && (
                    <div className="rating-options">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`btn-rating ${respuestasForm[preg.id]?.valor_numero === num ? "activo" : ""}`}
                          onClick={() => handleRespuestaChange(preg.id, "valor_numero", num)}
                        >
                          {num} ⭐
                        </button>
                      ))}
                    </div>
                  )}

                  {/* OPCIÓN MÚLTIPLE */}
                  {preg.tipo_respuesta === "opcion" && (
                    <div className="radio-group">
                      {preg.opciones?.map((opc) => (
                        <label key={opc.id}>
                          <input
                            type="radio"
                            name={`pregunta_${preg.id}`}
                            checked={respuestasForm[preg.id]?.opcion_id === opc.id}
                            onChange={() => handleRespuestaChange(preg.id, "opcion_id", opc.id)}
                          />
                          {opc.texto_opcion}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* TEXTO ABIERTO */}
                  {preg.tipo_respuesta === "texto" && (
                    <textarea
                      rows="3"
                      placeholder="Escribe tus comentarios..."
                      className="input-estilizado"
                      value={respuestasForm[preg.id]?.valor_texto || ""}
                      onChange={(e) => handleRespuestaChange(preg.id, "valor_texto", e.target.value)}
                    ></textarea>
                  )}
                </div>
              ))}

              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModalResponder(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Enviar Respuestas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESULTADOS (Análisis IA para Admin vs Resumen Personal para Usuario) */}
      {mostrarModalResultados && encuestaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-contenido" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h2>
                {esAdmin
                  ? `🤖 Análisis con IA: ${encuestaSeleccionada.titulo}`
                  : `👤 Mi Resumen: ${encuestaSeleccionada.titulo}`}
              </h2>
              <button className="btn-cerrar-modal" onClick={() => setMostrarModalResultados(false)}>✕</button>
            </div>

            <div style={{ padding: "15px 0" }}>
              {esAdmin ? (
                /* VISTA ADMINISTRADOR: RESULTADOS CON ANÁLISIS DE IA */
                <div>
                  <p style={{ color: "#4b5563", marginBottom: "15px" }}>
                    <strong>Modo Administrador:</strong> Diagnóstico generado automáticamente a partir de todas las respuestas recopiladas.
                  </p>

                  {cargandoAnalisis ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2563eb" }}>🤖 La IA está analizando las respuestas...</p>
                      <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Sintetizando conclusiones, áreas de oportunidad y recomendaciones.</p>
                    </div>
                  ) : analisisIA ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* MÉTRICAS CLAVE */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Sentimiento Predominante</span>
                          <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: "4px 0 0", color: "#2563eb" }}>
                            {analisisIA.sentimiento_predominante || "Neutro"}
                          </p>
                        </div>
                        <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "8px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Puntuación Estimada</span>
                          <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: "4px 0 0", color: "#16a34a" }}>
                            {analisisIA.puntuacion_promedio || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* RESUMEN EJECUTIVO */}
                      <div>
                        <h3 style={{ fontSize: "1rem", color: "#1f2937" }}>📝 Resumen Ejecutivo</h3>
                        <p style={{ color: "#4b5563", lineHeight: "1.5" }}>{analisisIA.resumen_ejecutivo}</p>
                      </div>

                      {/* HALLAZGOS CLAVE */}
                      <div>
                        <h3 style={{ fontSize: "1rem", color: "#16a34a" }}>✅ Hallazgos Clave / Puntos Fuertes</h3>
                        <ul style={{ paddingLeft: "20px", color: "#374151" }}>
                          {analisisIA.hallazgos_clave?.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* ÁREAS CRÍTICAS */}
                      <div>
                        <h3 style={{ fontSize: "1rem", color: "#dc2626" }}>⚠️ Áreas Críticas / Oportunidad</h3>
                        <ul style={{ paddingLeft: "20px", color: "#374151" }}>
                          {analisisIA.areas_criticas?.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* PLAN DE ACCIÓN */}
                      <div>
                        <h3 style={{ fontSize: "1rem", color: "#2563eb" }}>💡 Recomendaciones Sugeridas</h3>
                        <ul style={{ paddingLeft: "20px", color: "#374151" }}>
                          {analisisIA.plan_de_accion?.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p style={{ textAlign: "center", color: "#dc2626" }}>No se pudo cargar el análisis de la IA o aún no hay suficientes respuestas registradas.</p>
                  )}
                </div>
              ) : (
                /* VISTA USUARIO NORMAL: RESUMEN PERSONAL */
                <div>
                  <p style={{ color: "#4b5563", marginBottom: "15px" }}>
                    <strong>Resumen Individual:</strong> Confirmación de participación en esta evaluación.
                  </p>

                  <div style={{ padding: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", marginBottom: "20px" }}>
                    <span style={{ color: "#065f46", fontWeight: "bold" }}>
                      ✅ Estado: Encuesta completada
                    </span>
                    <p style={{ fontSize: "0.85rem", color: "#047857", margin: "4px 0 0" }}>
                      Gracias por colaborar. Tus respuestas se incorporaron al análisis global de la plataforma.
                    </p>
                  </div>

                  <h3>Preguntas Evaluadas:</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    {preguntasEncuesta.map((p, idx) => (
                      <div key={p.id} style={{ padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                        <p style={{ fontWeight: "bold", margin: 0 }}>{idx + 1}. {p.texto_pregunta}</p>
                        <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: "500" }}>
                          ✓ Registrada
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-acciones">
              <button className="btn-cancelar" onClick={() => setMostrarModalResultados(false)}>
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Encuestas;