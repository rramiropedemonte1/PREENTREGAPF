import PERSISTENCE from "../../config/config.js";

export let Cart;

switch (PERSISTENCE) {
  case "MONGO":
    const { default: CartDAO } = await import(
      "../mongomanagers/cartManagerMongo.js"
    );
    Cart = CartDAO;
    break;
  default:
    break;
}
