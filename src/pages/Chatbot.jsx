import { useState, useEffect, useRef } from "react";

function Chatbot() {
  const [mensajes, setMensajes] = useState([
    { remitente: "bot", texto: "¡Hola! 👋 Soy tu asistente de Bienestar IA. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const finChatRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!input.trim() || cargando) return;

    const mensajeUsuario = input;
    const nuevosMensajes = [...mensajes, { remitente: "usuario", texto: mensajeUsuario }];
    
    setInput("");
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mensaje: mensajeUsuario,
          historial: nuevosMensajes // Enviamos el historial completo a Node.js
        }),
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.respuesta) {
        setMensajes((prev) => [...prev, { remitente: "bot", texto: data.respuesta }]);
      } else {
        setMensajes((prev) => [
          ...prev,
          { remitente: "bot", texto: "Lo siento, ocurrió un error al procesar tu mensaje." }
        ]);
      }
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { remitente: "bot", texto: "No se pudo conectar con el servidor del chatbot." }
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>🤖 Chatbot Bienestar</h3>
      </div>

      <div className="chat-box">
        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={`mensaje ${msg.remitente === "usuario" ? "mensaje-usuario" : "mensaje-bot"}`}
          >
            {msg.texto}
          </div>
        ))}
        {cargando && <div className="mensaje mensaje-bot">Escribiendo... 💬</div>}
        <div ref={finChatRef} />
      </div>

      <form onSubmit={enviarMensaje} className="chat-input-form">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={cargando}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Chatbot;