const { Router } = require("express");
const productManager = require("../dao/mongomanagers/productManagerMongo");
const cartManager = require("../dao/mongomanagers/cartManagerMongo");

const router = Router();

router.get("/products", async (req, res) => {
  const {
    limit = 10,
    page = 1,
    sort = "asc",
    title = "",
    category = "",
  } = req.query;
  const products = await productManager.getAllPaginated(
    limit,
    page,
    sort,
    title,
    category
  );
  try {
    products.docs = await products.docs.map((product) => {
      const {
        _id,
        title,
        description,
        price,
        code,
        stock,
        category,
        thumbnail,
      } = product;
      return {
        id: _id,
        title,
        description,
        price,
        code,
        stock,
        category,
        thumbnail,
      };
    });
    const info = {
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `http://localhost:8080/products?page=${products.prevPage}`
        : null,
      nextLink: products.hasNextPage
        ? `http://localhost:8080/products?page=${products.nextPage}`
        : null,
    };
    const productsList = products.docs;
    const { hasPrevPage, hasNextPage, page, prevLink, nextLink } = info;
    res.render("products", {
      productsList,
      hasPrevPage,
      hasNextPage,
      page,
      prevLink,
      nextLink,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .send({ status: "error", error: "Error getting all products" });
  }
});
router.get("/carts", async (req, res) => {
  res.render("carts", {
    style: "carts.css",
    title: "Carts",
  });
});
router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  const cart = await cartManager.getById(cid);
  const cartsProducts = cart.products;
  res.render("cartsId", {
    style: "cartId.css",
    title: "CartsId",
    cartsProducts,
  });
});

module.exports = router;
