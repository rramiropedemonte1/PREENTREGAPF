const { Router } = require("express");
const cartManager = require("../dao/mongomanagers/cartManagerMongo");

const router = Router();
const notFound = { error: "Cart not found" };

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).send({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    return console.log(error);
  }
});
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);
    !cart
      ? res.status(404).send(notFound)
      : res.status(200).send({
          status: "success",
          payload: cart,
        });
  } catch (error) {
    return console.log(error);
  }
});
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    cartManager.deleteAllProducts(cid);
    const updatedCart = await cartManager.getById(cid);
    !updatedCart
      ? res.status(404).send(notFound)
      : res.status(200).send({
          status: "success",
          message: "empty cart",
        });
  } catch (error) {
    return console.log(error);
  }
});
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.addToCart(cid, pid);
    !cart
      ? res.status(404).send(notFound)
      : res.status(200).send({
          status: "success",
          payload: cart,
        });
  } catch (error) {
    return console.log(error);
  }
});
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    let cart = await cartManager.getById(cid);
    if (cart == null) {
      res.status(404).send({
        status: "error",
        message: "cart not found",
      });
    }
    let result = await cartManager.updateCartProduct(cid, pid, quantity);
    res.status(200).send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    return new Error(error);
  }
});
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.deleteProduct(cid, pid);
    !cart
      ? res.status(404).send(notFound)
      : res.status(200).send({
          status: "success",
          payload: cart,
        });
  } catch (error) {
    return console.log(error);
  }
});

module.exports = router;
