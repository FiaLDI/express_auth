const express = require("express");

const { getChats, postChats } = require("../controllers/chatController");
const { authenticate } = require("../middleware/authMiddleware");

const chatRouter = express.Router();

chatRouter.get("/chats", getChats);
chatRouter.post("/api/chats", postChats)

module.exports = chatRouter;