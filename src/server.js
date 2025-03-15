import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import chatrouter from './routes/ChatRoutes.js';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken'

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {}; // Определяем переменную rooms

// Middleware для проверки токена
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
 
  if (!token) {
    return next(new Error('Токен отсутствует'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded; // Сохраняем данные пользователя в сокете
    
    next();
  } catch (err) {
    return next(new Error('Неверный токен'));
  }
};

io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('Новый пользователь подключился:', socket.user);

  socket.on('join-room', (room) => {
    
    if (!rooms[room]) {
      rooms[room] = []; // Создаем комнату, если она не существует
    }
    socket.join(room);
    socket.emit('message-history', rooms[room]);
    console.log(`Пользователь присоединился к комнате: ${room}`);
    console.log(rooms)
  });

  socket.on('send-message', (msg) => {
    const { room, text } = msg;

    if (rooms[room]) {
      const message = {
        id: Date.now(),
        text: text,
        user: socket.user.username,
        timestamp: new Date().toLocaleTimeString(),
      };

      rooms[room].push(message); // Сохраняем сообщение в комнате
      io.to(room).emit('new-message', message); // Отправляем сообщение всем в комнате
    } else {
      socket.emit('error', 'Комната не найдена');
    }
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", chatrouter);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => { // Запускаем сервер
  console.log(`Server is running on port ${PORT}`);
});
