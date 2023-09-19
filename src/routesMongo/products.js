const { Router } = require("express");
const productManager = require("../dao/mongomanagers/productManagerMongo");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("products", {
      products,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    !product
      ? res.status(404).send(notFound)
      : res.status(200).send({
          status: "success",
          payload: product,
        });
  } catch (error) {
    console.log(error);
  }
});
router.post("/", uploader.array("thumbnail", 10), async (req, res) => {
  try {
    const newProduct = req.body;
    const imgPaths = req.files.map((file) => file.path);
    let result = await productManager.addProduct(newProduct, imgPaths);
    res.status(201).send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.put("/:pid", uploader.array("thumbnail", 10), async (req, res) => {
  try {
    const { pid } = req.params;
    const data = req.body;
    let result = await productManager.updateProduct({ _id: pid }, data);
    res.status(200).send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    let result = await productManager.deleteProduct(pid);
    res.status(200).send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
  }
});
