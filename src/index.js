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
  origin: 'http://localhost:5173',
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

// Criação do servidor HTTP e do Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Mapeamento dos usuários conectados
const users = new Map();

// Lógica de comunicação com o Socket.IO
io.on('connection', (socket) => {
  console.log('User connected');

  // Evento de entrada de usuário
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', { username, users: Array.from(users.values()) });
  });

  // Evento de recebimento de mensagem
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  // Evento de desconexão
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('userLeft', { username, users: Array.from(users.values()) });
    console.log('User disconnected');
  });
});

// Iniciar o servidor na porta configurada
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
