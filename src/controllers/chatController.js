
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken'

const chats = [
    {
        chat_id: 1,
        name: "My chat",
        lastmessage: "hi",
        avatar: '/img/icon.png',
        type: "ls",
        owner: 5
    },
    {
        chat_id: 2,
        name: "My chat2",
        lastmessage: "hi",
        avatar: '/img/icon.png',
        type: "ls",
        owner: 1
    },
    {
        chat_id: 3,
        name: "My chat3",
        lastmessage: "hi",
        avatar: '/img/icon.png',
        isGroup: false,
        owner: 1
    },
] // Все чаты
const messages = {
    1: []
}; // Сообщения по ID чата (messages[chatId] = [...])

const getChats = async (req, res) => {
    
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    res.json(chats.filter(val => val.owner == decoded?.id))
    //res.json(chats.filter(val => val))  ;
}
  
const postChats = async(req, res) => {
    const newChat = {
      id: uuidv4(),
      name: req.body.name || "New Chat",
      createdBy: "user-1", // Заглушка для пользователя
    };
    chats.push(newChat);
    messages[newChat.id] = [];
    res.status(201).json(newChat);
};

export { getChats, postChats };
  
// // API для сообщений
// app.get("/api/chats/:id/messages", (req, res) => {
//     const chatMessages = messages[req.params.id] || [];
//     res.json(chatMessages);
//   });
  
// app.post("/api/chats/:id/messages", (req, res) => {
//     const chatId = req.params.id;
//     const newMessage = {
//         id: uuidv4(),
//         body: req.body.body,
//         chatId: chatId,
//         sender: "user-1", // Заглушка для отправителя
//         timestamp: new Date(),
//     };

//     if (!messages[chatId]) messages[chatId] = [];
//     messages[chatId].push(newMessage);

//     // Отправляем сообщение через WebSocket
//     io.to(`chat-${chatId}`).emit("new_message", newMessage);
//     res.status(201).json(newMessage);
// });

// WebSocket логика

