// Carga las variables de tu archivo .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log("🔒 Password cargada correctamente:", process.env.DB_PASSWORD ? "SÍ" : "NO");

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL leyendo desde el .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de Node.js funcionando correctamente');
});

// =========================================================================
// RUTAS DE USUARIOS Y AUTENTICACIÓN
// =========================================================================

// Endpoint de inicio de sesión (Corregido para comparar hash con bcrypt)
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE nombre = $1 OR email = $1',
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }

    delete user.password_hash; // Evitar enviar el hash al frontend
    res.json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso',
      usuario: user
    });
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error en el servidor'
    });
  }
});

// Endpoint para obtener el perfil de un usuario específico
app.get('/api/perfil/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         u.id, 
         u.nombre, 
         u.email, 
         u.rol, 
         p.telefono, 
         COALESCE(p.puesto, u.rol) AS puesto, 
         p.departamento, 
         p.fecha_ingreso
       FROM usuarios u 
       LEFT JOIN perfiles p ON u.id = p.usuario_id 
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      res.json({ exito: true, perfil: result.rows[0] });
    } else {
      res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ exito: false, mensaje: 'Error en el servidor' });
  }
});

// GET: Obtener la lista completa de usuarios con sus perfiles
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol, p.puesto, p.departamento 
       FROM usuarios u 
       LEFT JOIN perfiles p ON u.id = p.usuario_id 
       ORDER BY u.id ASC`
    );

    res.json({ exito: true, usuarios: result.rows });
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al consultar usuarios' });
  }
});

// POST: Registrar un nuevo usuario y crear su perfil asociado (Corregido con bcrypt)
app.post('/api/usuarios/registrar', async (req, res) => {
  const { nombre, email, password, rol, puesto, departamento, telefono } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const hash = await bcrypt.hash(password, 10);

    const insertUsuarioQuery = `
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const resUsuario = await client.query(insertUsuarioQuery, [nombre, email, hash, rol || 'usuario']);
    const nuevoUsuarioId = resUsuario.rows[0].id;

    const insertPerfilQuery = `
      INSERT INTO perfiles (usuario_id, telefono, puesto, departamento, fecha_ingreso)
      VALUES ($1, $2, $3, $4, CURRENT_DATE);
    `;
    await client.query(insertPerfilQuery, [nuevoUsuarioId, telefono || null, puesto || null, departamento || null]);

    await client.query('COMMIT');

    res.json({ exito: true, mensaje: 'Usuario registrado correctamente', usuarioId: nuevoUsuarioId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ exito: false, mensaje: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ exito: false, mensaje: 'Error interno en el servidor al crear usuario.' });
  } finally {
    client.release();
  }
});

// DELETE: Eliminar un usuario y su perfil asociado
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Eliminar el perfil asociado en la tabla 'perfiles'
    await client.query('DELETE FROM perfiles WHERE usuario_id = $1', [id]);

    // 2. Eliminar el registro de la tabla 'usuarios'
    const result = await client.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }

    await client.query('COMMIT');
    res.json({ exito: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al eliminar el usuario en la base de datos' });
  } finally {
    client.release();
  }
});

// =========================================================================
// ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA
// =========================================================================

// Endpoint 1: Verificar si el correo existe
app.post('/api/verificar-email', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT id, email FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'El correo electrónico no está registrado' });
    }

    return res.json({ exito: true, mensaje: 'Usuario encontrado' });
  } catch (error) {
    console.error('Error al verificar correo:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
  }
});

// Endpoint 2: Cambiar la contraseña directamente (Corregido a password_hash)
app.post('/api/cambiar-password-directo', async (req, res) => {
  const { email, nuevaPassword } = req.body;

  try {
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    const result = await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE email = $2 RETURNING id',
      [passwordHash, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ exito: false, mensaje: 'No se pudo encontrar el usuario' });
    }

    return res.json({ exito: true, mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ exito: false, mensaje: 'Error al actualizar la contraseña' });
  }
});

// =========================================================================
// ENDPOINTS DE ENCUESTAS
// =========================================================================

// 1. GET: Obtener todas las encuestas con total de preguntas y respuestas
app.get('/api/encuestas', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.titulo,
        e.descripcion,
        e.estado,
        TO_CHAR(e.fecha_creacion, 'DD/MM/YYYY') AS "fechaCreacion",
        COUNT(DISTINCT p.id)::INT AS "preguntasCount",
        COUNT(DISTINCT re.id)::INT AS "respuestasCount"
      FROM encuestas e
      LEFT JOIN preguntas p ON e.id = p.encuesta_id
      LEFT JOIN respuestas_encuesta re ON e.id = re.encuesta_id
      GROUP BY e.id
      ORDER BY e.fecha_creacion DESC;
    `;

    const result = await pool.query(query);
    res.json({ exito: true, encuestas: result.rows });
  } catch (error) {
    console.error('Error al obtener encuestas:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al consultar las encuestas' });
  }
});

// 2. GET: Obtener detalle de una encuesta específica (con preguntas y opciones)
app.get('/api/encuestas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const encuestaRes = await pool.query('SELECT * FROM encuestas WHERE id = $1', [id]);
    if (encuestaRes.rows.length === 0) {
      return res.status(404).json({ exito: false, mensaje: 'Encuesta no encontrada' });
    }

    const preguntasRes = await pool.query(
      'SELECT id, texto_pregunta, tipo_respuesta, orden FROM preguntas WHERE encuesta_id = $1 ORDER BY orden ASC',
      [id]
    );

    const preguntas = preguntasRes.rows;

    for (let pregunta of preguntas) {
      if (pregunta.tipo_respuesta === 'opcion') {
        const opcionesRes = await pool.query(
          'SELECT id, texto_opcion FROM opciones_pregunta WHERE pregunta_id = $1',
          [pregunta.id]
        );
        pregunta.opciones = opcionesRes.rows;
      }
    }

    res.json({
      exito: true,
      encuesta: {
        ...encuestaRes.rows[0],
        preguntas
      }
    });
  } catch (error) {
    console.error('Error al obtener detalle de encuesta:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al cargar el detalle de la encuesta' });
  }
});

// 3. POST: Crear una nueva encuesta con preguntas y opciones (Transacción SQL)
app.post('/api/encuestas', async (req, res) => {
  const { titulo, descripcion, creado_por, preguntas } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertEncuestaQuery = `
      INSERT INTO encuestas (titulo, descripcion, creado_por)
      VALUES ($1, $2, $3)
      RETURNING id, titulo, descripcion, estado, fecha_creacion;
    `;
    const encuestaResult = await client.query(insertEncuestaQuery, [titulo, descripcion, creado_por || null]);
    const nuevaEncuesta = encuestaResult.rows[0];

    if (preguntas && Array.isArray(preguntas)) {
      for (let i = 0; i < preguntas.length; i++) {
        const p = preguntas[i];
        const insertPreguntaQuery = `
          INSERT INTO preguntas (encuesta_id, texto_pregunta, tipo_respuesta, orden)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `;
        const preguntaResult = await client.query(insertPreguntaQuery, [
          nuevaEncuesta.id,
          p.texto_pregunta,
          p.tipo_respuesta,
          i + 1
        ]);

        if (p.tipo_respuesta === 'opcion' && Array.isArray(p.opciones)) {
          for (let opcionTexto of p.opciones) {
            await client.query(
              'INSERT INTO opciones_pregunta (pregunta_id, texto_opcion) VALUES ($1, $2)',
              [preguntaResult.rows[0].id, opcionTexto]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ exito: true, mensaje: 'Encuesta creada con éxito', encuesta: nuevaEncuesta });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear encuesta:', error);
    res.status(500).json({ exito: false, mensaje: 'Error interno al guardar la encuesta' });
  } finally {
    client.release();
  }
});

// 4. POST: Guardar las respuestas de un usuario
app.post('/api/encuestas/:id/respuestas', async (req, res) => {
  const encuesta_id = req.params.id;
  const { usuario_id, respuestas } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertRespuestaCabecera = `
      INSERT INTO respuestas_encuesta (encuesta_id, usuario_id)
      VALUES ($1, $2)
      RETURNING id;
    `;
    const resCabecera = await client.query(insertRespuestaCabecera, [encuesta_id, usuario_id || null]);
    const respuestaEncuestaId = resCabecera.rows[0].id;

    if (respuestas && Array.isArray(respuestas)) {
      const insertDetalle = `
        INSERT INTO detalle_respuestas (respuesta_encuesta_id, pregunta_id, opcion_id, valor_numero, valor_texto)
        VALUES ($1, $2, $3, $4, $5);
      `;

      for (let r of respuestas) {
        await client.query(insertDetalle, [
          respuestaEncuestaId,
          r.pregunta_id,
          r.opcion_id || null,
          r.valor_numero || null,
          r.valor_texto || null
        ]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ exito: true, mensaje: 'Respuestas guardadas con éxito' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al responder encuesta:', error);
    res.status(500).json({ exito: false, mensaje: 'Error al registrar tus respuestas' });
  } finally {
    client.release();
  }
});

// Arrancar el servidor AL FINAL de las rutas
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});