import { productModel } from "../dao/models/products.models";

export const getProductsService = async (req) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || "";
  const category = req.query.category || "";
  const availability = parseInt(req.query.stock) || "";

  let filter = {};

  if (req.query.category) {
    filter = { category };
  }

  if (req.query.stock) {
    filter = { ...filter, stock: availability };
  }
  let sortOptions = {};

  if (sort === "asc") {
    sortOptions = { price: 1 };
  } else if (sort === "desc") {
    sortOptions = { price: -1 };
  }
  const options = {
    limit,
    page,
    sort: sortOptions,
    lean: true,
  };
  const result = await productModel.paginate(filter, options);
  const totalPages = result.totalPages;
  const prevPage = result.prevPage;
  const nextPage = result.nextPage;
  const currentPage = result.page;
  const hasPrevPage = result.hasPrevPage;
  const hasNextPage = result.hasNextPage;
  const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null;
  const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null;

  return {
    payload: result.docs,
    limit: result.limit,
    totalPages,
    prevPage,
    nextPage,
    page: currentPage,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink,
  };
};

export const getProductsByIdService = async (req) => {
  const pid = req.params.pid;

  const product = await productModel.findById(pid).lean().exec();

  if (product === null) {
    return { status: "error", message: `The product does not exist` };
  }
  return product;
};

export const addProductsService = async (req) => {
  if (!req.file) {
    console.log("No image");
  }
  if (!req.body) {
    return {
      status: "error",
      message: "Product no can be created without properties",
    };
  }
  let product = {
    title: req.body.title,
    description: req.body.description,
    price: parseFloat(req.body.price),
    thumbnails: [req?.file?.originalname] || [],
    code: req.body.code,
    category: req.body.category,
    stock: parseInt(req.body.stock),
  };
  const addProduct = await productModel.create(product);
  const products = await productModel.find().lean().exec();
  req.app.get("socketio").emit("updatedProducts", products);
  return addProduct;
};

export const updateProductsService = async (req) => {
  const pid = req.params.pid;

  if (req.body._id === pid) {
    return { status: "error", message: "Cannot modify product id" };
  }
  const updated = req.body;

  const productFind = await productModel.findById(pid);
  producto;
  if (!productFind) {
    return { status: "error", message: `The product does not exist` };
  }

  await productModel.updateOne({ _id: pid }, updated);
  const updatedProducts = await productModel.find();

  req.app.get("socketio").emit("updatedProducts", updatedProducts);

  const result = await productModel.findById(pid);

  return result;
};

export const deleteProductsService = async (req) => {
  const productId = req.params.pid;
  const result = await productModel.findByIdAndDelete(productId);
  if (result === null) {
    return {
      status: "error",
      message: `No such product with id: ${productId}`,
    };
  }

  const updatedProducts = await productModel.find().lean().exec();

  req.app.get("socketio").emit("updatedProducts", updatedProducts);
  return updatedProducts;
};
