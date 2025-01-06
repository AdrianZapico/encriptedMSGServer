import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuração do ambiente
dotenv.config();

// Variáveis para o caminho do arquivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializa o app express
const app = express();

// Configuração de CORS
const corsOptions = {
  origin: 'https://encripted-chat-ts.netlify.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware para parsing de JSON
app.use(express.json());

// Conectar ao banco de dados
connectDB();

// Rotas de autenticação
app.use('/', authRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://encripted-chat-ts.netlify.app/", // Ajuste conforme necessário
    methods: ["GET", "POST"]
  }
});
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', { username, users: Array.from(users.values()) });
  });

  socket.on('message', (data) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('userLeft', { username, users: Array.from(users.values()) });
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

