const express = require("express");
const router = express.Router();
const { userModel } = require("../dao/models/user.js");
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../config/config.js";
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get("/register", (req, res) => {
  try {
    res.render("register.handlebars");
  } catch (error) {
    res.status(500).send("Error de presentación.");
  }
});

router.get("/", (req, res) => {
  try {
    res.render("login.handlebars");
  } catch (error) {
    res.status(500).send("Error de presentación.");
  }
});

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/api/sessions");
      }

      let { first_name, last_name, email, age, role, carts } = req.session.user;

      res.render("profile.handlebars", {
        first_name,
        last_name,
        email,
        age,
        role,
        carts,
      });
    } catch (error) {
      res.status(500).send("Error de presentación.");
    }
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.redirect("/api/sessions");
    } else {
      res.send("Error al intentar salir.");
    }
  });
});

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/failRegister",
  }),
  async (req, res) => {
    try {
      console.log("Usuario registrado correctamente.");
      res.redirect("/api/sessions");
    } catch (error) {
      res.status(500).send("Error de registro.");
    }
  }
);

router.get("/failRegister", async (req, res) => {
  console.log("Failed strategy");
  res.send({ error: "Failed" });
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) return res.send({ message: "Usuario no registrado" });

  if (!isValidatePassword(user, password))
    return res.send({ message: "Contraseña incorrecta." });

  let token = jwt.sign({ email, password }, "coderSecret", {
    expiresIn: "24h",
  });

  res.cookie("coderCookieToken", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  });

  req.session.user = {
    first_name: user.first_name,
    last_name: user.last_name,
    age: user.age,
    email: user.email,
    role: user.role,
    carts: user.carts,
  };

  res.redirect("/api/sessions/profile");
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/api/sessions/" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/sessions/profile");
  }
);

router.get("/restore", (req, res) => {
  try {
    res.render("restore.handlebars");
  } catch (error) {
    res.status(500).send("Error de presentación.");
  }
});

router.post("/restore", async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res
        .status(400)
        .send({ status: "error", error: "Valores inexistentes" });

    let user = await userModel.findOne({ email: email });

    if (!user)
      return res
        .status(400)
        .send({ status: "error", error: "Usuario no encontrado" });

    user.password = createHash(newPassword);

    await userModel.updateOne({ _id: user._id }, user);

    res.redirect("/api/sessions");
  } catch (error) {
    res.status(500).send("Error al cambiar contraseña.");
  }
});

module.exports = router;
