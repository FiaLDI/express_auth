import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import { authRoutes } from './routes/authRoutes.js';
import { chatRouter }from './routes/ChatRoutes.js';
import { serverRouter } from './routes/serverRoutes.js';
import { Server } from 'socket.io';
import https from 'https';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const options = {
  key: fs.readFileSync('./src/selfsigned_key.pem'),
  cert: fs.readFileSync('./src/selfsigned.pem'),
};

const app = express();
app.use(cors({
    origin: "https://26.234.138.233:5173",
    credentials: true,
}));
const server = https.createServer(options, app);
export const io = new Server(server, {
  cors: {
    origin: "https://26.234.138.233:5173",
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
    const { room, text, user_name } = msg;
    console.log(msg)
    console.log(room)
    if (rooms[room]) {
      const message = {
        id: uuidv4(),
        content: text,
        user_id: socket.user.id,
        user_name: user_name,
        is_edited: false,
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


app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", chatRouter);
app.use("/api", serverRouter)

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => { // Запускаем сервер
  console.log(`Server is running on port ${PORT}`);
});
