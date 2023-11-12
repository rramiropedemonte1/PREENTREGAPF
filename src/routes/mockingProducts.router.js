import {
  createProductController,
  getProductsController,
} from "../controllers/mockingProductsController.js";
import appRouter from "./sessions.js";

export default class MockingProducts extends appRouter {
  init() {
    this.get("/", ["PUBLIC"], getProductsController);

    this.post("/", ["PUBLIC"], createProductController);
  }
}
