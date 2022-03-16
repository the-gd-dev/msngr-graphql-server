const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const app = express();
app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
server.listen(process.env.SERVER_PORT);
console.log(
  "\x1b[36m%s\x1b[0m",
  "Messenger Clone Server - http://localhost:" + process.env.SERVER_PORT
);
