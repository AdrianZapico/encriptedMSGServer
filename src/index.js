import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173', // Permitir a origem do front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
};

app.use(cors(corsOptions));
// Conectar ao banco de dados
connectDB();

// Rotas
app.use('/', authRoutes); // Configura as rotas de autenticação
app.use('/todos', todoRoutes); // Configura as rotas de tarefas

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
