import express from "express";
import { __dirname } from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import viewRouter from "./routes/view.router.js";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import cartManager from "./dao/mongomanagers/cartManagerMongo.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import sessionsRouter from "./routes/sessions.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/", viewRouter);
app.use("/api/sessions", sessionsRouter);

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: "Tu URL de mongo",
      ttl: 3600,
    }),
    secret: "CoderSecret",
    resave: false,
    saveUninitialized: false,
  })
);

const httpServer = app.listen(PORT, () => {
  console.log("Server ON");
});

const socketServer = new Server(httpServer);

import ProductManager from "./dao/mongomanagers/productManagerMongo.js";
const pmanagersocket = new ProductManager();

import MessagesManager from "./dao/mongomanagers/messageManagerMongo.js";
const messagesManager = new MessagesManager();

socketServer.on("connection", async (socket) => {
  console.log("client connected con ID:", socket.id);
  const listadeproductos = await pmanagersocket.getProducts();
  socketServer.emit("enviodeproducts", listadeproductos);

  socket.on("addProduct", async (obj) => {
    await pmanagersocket.addProduct(obj);
    const listadeproductos = await pmanagersocket.getProducts();
    socketServer.emit("enviodeproducts", listadeproductos);
  });

  socket.on("deleteProduct", async (id) => {
    console.log(id);
    await pmanagersocket.deleteProduct(id);
    const listadeproductos = await pmanagersocket.getProducts({});
    socketServer.emit("enviodeproducts", listadeproductos);
  });

  socket.on("nuevousuario", (usuario) => {
    console.log("usuario", usuario);
    socket.broadcast.emit("broadcast", usuario);
  });
  socket.on("disconnect", () => {
    console.log(`Usuario con ID : ${socket.id} esta desconectado `);
  });

  socket.on("mensaje", async (info) => {
    console.log(info);
    await messagesManager.createMessage(info);

    socketServer.emit("chat", await messagesManager.getMessages());
  });

  socket.on("cart", async (id) => {
    const cart = await cartManager.getById(id);
    socket.emit("cart", cart);
  });
});
