import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import entryRoutes from './routes/entryRoutes.js';

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://daily-diary-frontend-eight.vercel.app'
} ));

connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

app.get('/', (req, res) => {
  res.send('API do Diário Pessoal a funcionar');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor a correr em modo na porta ${PORT}`);
});
