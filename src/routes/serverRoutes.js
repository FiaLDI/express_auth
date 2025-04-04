const express = require("express");

const { getServers, getServerInfo } = require("../controllers/serverController");

const serverRouter = express.Router();

serverRouter.get("/server", getServers);
serverRouter.get("/server/:id", getServerInfo);

module.exports = serverRouter;