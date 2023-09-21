import { Router } from "express";
import { __dirname } from "../utils.js";
import ProductManager from "../dao/mongomanagers/productManagerMongo.js";
const pmanager = new ProductManager();

const router = Router();

const publicAccess = (req, res, next) => {
  if (req.session.user) return res.redirect("/profile");
  next();
};

const privateAccess = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

router.get("/", async (req, res) => {
  const listadeproductos = await pmanager.getProducts();
  console.log(listadeproductos);
  res.render("home", { listadeproductos });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realtimeproducts");
});

router.get("/chat", (req, res) => {
  res.render("chat");
});

router.get("/login", publicAccess, (req, res) => {
  res.render("login");
});

router.get("/register", publicAccess, (req, res) => {
  res.render("register");
});

router.get("/profile", privateAccess, (req, res) => {
  res.render("profile", {
    user: req.session.user,
  });
});

export default router;
