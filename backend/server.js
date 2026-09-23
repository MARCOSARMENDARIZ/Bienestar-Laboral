// Carga las variables de tu archivo .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log("🔒 Password cargada correctamente:", process.env.DB_PASSWORD ? "SÍ" : "NO");

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint de inicio de sesión
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE nombre = $1 AND password_hash = $2',
      [usuario, password]
    );

    if (result.rows.length > 0) {
      res.json({
        exito: true,
        mensaje: 'Inicio de sesión exitoso',
        usuario: result.rows[0]
      });
    } else {
      res.status(401).json({
        exito: false,
        mensaje: 'Usuario o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error en el servidor'
    });
  }
});

// Arrancar el servidor AL FINAL de las rutas
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});