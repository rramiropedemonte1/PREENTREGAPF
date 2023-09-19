import { cartModel } from "../models/carts.model.js";

import ProductManager from "../mongomanagers/productManagerMongo.js";

const pm = new ProductManager();

class CartManager {
  getCarts = async () => {
    try {
      const carts = await cartModel.find();
      return carts;
    } catch (err) {
      console.error("Error en el carrito", err.message);
      return [];
    }
    z;
  };

  deleteCart = async (id) => {
    try {
      const cart = await cartModel.getById(id);
      if (!cart) {
        throw new Error(`No se encuentra el id`);
      } else {
        await cartsModel.findOneAndDelete({ _id: id });
        return "Se borro el carrito correctamente";
      }
    } catch (error) {
      console.log(`Error en borrar el carrito: ${error.message}`);
    }
  };

  updateCartProduct = async (cid, pid, quantity) => {
    try {
      const cart = await cartModel.findOne({
        _id: cid,
        "products.product": pid,
      });
      if (cart == null) {
        throw new Error(`Does not exist.`);
      }
      const newCart = await cartModel.findOneAndUpdate(
        { _id: cid, "products.product": pid },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
      );
      return newCart;
    } catch (error) {
      console.log(`Error al encontrar el producto: ${error.message}`);
    }
  };

  getCartById = async (cartId) => {
    try {
      const cart = await cartModel.findById(cartId);
      return cart;
    } catch (err) {
      console.error("Error al obtener el id:", err.message);
      return err;
    }
  };

  addCart = async (products) => {
    try {
      let cartData = {};
      if (products && products.length > 0) {
        cartData.products = products;
      }

      const cart = await cartModel.create(cartData);
      return cart;
    } catch (err) {
      console.error("Error al crear el carrito:", err.message);
      return err;
    }
  };

  addProductInCart = async (cid, obj) => {
    try {
      const filter = { _id: cid, "products._id": obj._id };
      const cart = await cartModel.findById(cid);
      const findProduct = cart.products.some(
        (product) => product._id.toString() === obj._id
      );

      if (findProduct) {
        const update = { $inc: { "products.$.quantity": obj.quantity } };
        await cartModel.updateOne(filter, update);
      } else {
        const update = {
          $push: { products: { _id: obj._id, quantity: obj.quantity } },
        };
        await cartModel.updateOne({ _id: cid }, update);
      }

      return await cartModel.findById(cid);
    } catch (err) {
      console.error("No se pudo agregar el producto al carrito:", err.message);
      return err;
    }
  };
}

export default CartManager;
