import { PERSISTENCE } from "../../config/config.js";

export let Product;

switch (PERSISTENCE) {
  case "MONGO":
    const { default: ProductDAO } = await import(
      "../mongomanagers/productManagerMongo.js"
    );
    Product = ProductDAO;
    break;
  default:
    break;
}
