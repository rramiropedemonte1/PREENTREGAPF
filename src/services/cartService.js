import { sendEmail } from "./nodemailer/mailer.js";
import { generateUniqueCode } from "../utils.js";
import CartRepository from "../repositories/cartRepository.js";
import { Cart } from "../dao/factory/cartFactory.js";
import { ProductService } from "./productsService.js";

export const CartService = new CartRepository(new Cart());

const calculateTotalAmount = async (cart) => {
  let totalAmount = 0;

  try {
    for (const item of cart) {
      const product = await ProductService.getById(item.product);
      if (!product) {
        throw new Error(`Product not found for id: ${item.product}`);
      }
      totalAmount += product.price * item.quantity;
    }
  } catch (error) {
    console.log(error.message);
  }

  totalAmount = Number(totalAmount.toFixed(2));
  return totalAmount;
};

export const purchaseService = async (req, res) => {
  const userEmail = req.user.user.email;
  const cid = req.params.cid;
  const cart = await CartService.getCart(cid);
  if (!cart)
    return res.sendRequestError(`The cart with id ${cid} does not exist`);

  const productsToPurchase = [];
  const productsToRemove = [];

  for (const productInfo of cart.products) {
    const product = await ProductService.getById(productInfo.product._id);

    if (!product) {
      productsToRemove.push(productInfo.product._id);
      continue;
    }

    if (product.stock === 0) {
      product.status = false;
      await ProductService.update(product._id, product);
    }

    if (product.stock >= productInfo.quantity) {
      product.stock -= productInfo.quantity;
      await ProductService.update(product._id, product);

      productsToPurchase.push(productInfo);
    }
  }

  if (productsToPurchase.length > 0) {
    const newTicket = {
      code: generateUniqueCode(),
      purchase_datetime: new Date(),
      amount: await calculateTotalAmount(productsToPurchase),
      purchaser: userEmail,
      products: productsToPurchase.map((prod) => ({
        product: prod.product._id,
        quantity: prod.quantity,
      })),
    };

    const saveTicket = await CartService.createPurchase(newTicket);

    cart.products = cart.products.filter(
      (productInfo) =>
        !productsToPurchase.some(
          (prod) => prod.product._id === productInfo.product._id
        )
    );

    cart.ticket = saveTicket._id;
    await CartService.updatedCart({ _id: cid }, cart);

    const ticket = await CartService.getPurchase(saveTicket._id);
    const productsNotPurchased = await CartService.getCart(cid);
    const existNotPurchased =
      productsNotPurchased.products.length !== 0 ? true : false;

    await sendEmail(userEmail, ticket);

    return res.render("ticket", {
      ticket,
      productsNotPurchased,
      existNotPurchased,
    });
  } else {
    return res.render("errors/errorPage", {
      error: "No products were purchased.",
    });
  }
};
