import { createProduct, generateProduct } from "../services/fakerProducts.js";

const products = [];

export const getProductsController = async (req, res) => {
  try {
    for (let i = 0; i < 100; i++) {
      products.push(await generateProduct());
    }
    res.sendSuccess(products);
  } catch (error) {
    console.log(error);
    return res.sendServerError(error.message);
  }
};

export const createProductController = async (req, res, next) => {
  try {
    const product = await createProduct(req);
    products.push(product);
    res.createdSuccess(products);
  } catch (error) {
    next(error);
  }
};
