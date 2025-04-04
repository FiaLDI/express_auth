import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken'
import { chats } from './chatController.js';

const voices = [
    {
        id: 1,
        name: "voice 0",
        type: "voice",
    },
    {
        id: 2,
        name: "voice 1",
        type: "voice",
    },
]

const servers = [
    {
        id: 1,
        name: "server 0",
        owner: 1,
        chats: [1, 2],
        voices: [1]
    },
    {
        id: 2,
        name: "server 1",
        owner: 1,
        chats: [],
        voices: [2]
    },
    {
        id: 3,
        name: "server 2",
        owner: 2,
        chats: [1, 2],
    },
] 
  
const getServers = async (req, res) => {
    
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    res.json(servers.filter(val => val.owner == decoded?.id))
}

const getServerInfo = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const serverId = parseInt(req.params.id);
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
        return res.status(404).json({ message: 'Server not found' });
    }

    if (server.owner !== decoded.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Get chat details for this server
    const serverChats = chats.filter(chat => server.chats.includes(chat.id));
    const serverVoices = voices.filter(voice => server.voices.includes(voice.id));
    
    const serverInfo = {
        ...server,
        chats: serverChats,
        voices: serverVoices
    };

    res.json(serverInfo);
}
  

export { getServers,getServerInfo };