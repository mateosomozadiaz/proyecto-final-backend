import CartModel from "../models/cart.js";
import ProductModel from "../models/product.js";

class CartManager {
	constructor() {
		this.CartModel = CartModel;
		this.ProductModel = ProductModel;
	}

	async createCart() {
		try {
			const newCart = new this.CartModel({ products: [] });
			await newCart.save();
			return newCart;
		} catch (error) {
			throw new Error(`Error creating cart: ${error.message}`);
		}
	}

	async getCarts() {
		try {
			return await this.CartModel.find().populate("products.product").lean();
		} catch (error) {
			console.error("Error retrieving carts:", error);
			throw new Error("Error retrieving carts");
		}
	}

	async getCartById(cid) {
		try {
			const cart = await this.CartModel.findById(cid).populate("products.product").lean();
			if (!cart) throw new Error("Cart not found");
			return cart;
		} catch (error) {
			console.error(`Error retrieving cart ${cid}:`, error);
			throw error;
		}
	}

	async addProductToCart(cid, pid) {
		try {
			const product = await this.ProductModel.findById(pid);
			if (!product) throw new Error("Product not found");
			if (product.stock < 1) throw new Error("Product out of stock");

			let updatedCart = await this.CartModel.findOneAndUpdate(
				{ _id: cid, "products.product": pid },
				{ $inc: { "products.$.quantity": 1 } },
				{ new: true }
			);

			if (!updatedCart) {
				updatedCart = await this.CartModel.findByIdAndUpdate(
					cid,
					{ $push: { products: { product: pid, quantity: 1 } } },
					{ new: true }
				);
			}

			await this.ProductModel.findByIdAndUpdate(pid, { $inc: { stock: -1 } });

			return this.getCartById(cid);
		} catch (error) {
			console.error(`Error adding product ${pid} to cart ${cid}:`, error);
			throw error;
		}
	}

	async deleteProductFromCart(cid, pid) {
		try {
			const cart = await this.CartModel.findById(cid);
			if (!cart) throw new Error("Cart not found");

			const productIndex = cart.products.findIndex((item) => item.product.toString() === pid);
			if (productIndex === -1) throw new Error("Product not found in cart");

			cart.products.splice(productIndex, 1);
			await cart.save();

			return await this.CartModel.findById(cid).populate("products.product").lean();
		} catch (error) {
			console.error(`Error removing product ${pid} from cart ${cid}:`, error);
			throw new Error(`Error removing product from cart: ${error.message}`);
		}
	}

	async updateProductQuantity(cid, pid, quantity) {
		try {
			if (quantity < 1) throw new Error("Quantity must be at least 1");

			const cart = await this.CartModel.findById(cid);
			if (!cart) throw new Error("Cart not found");

			const product = await this.ProductModel.findById(pid);
			if (!product) throw new Error("Product not found");

			const productInCart = cart.products.find((item) => item.product.toString() === pid);
			if (!productInCart) throw new Error("Product not in cart");

			productInCart.quantity = quantity;
			await cart.save();

			return await this.getCartById(cid);
		} catch (error) {
			console.error(`Error updating product quantity in cart ${cid}:`, error);
			throw new Error(`Error updating quantity: ${error.message}`);
		}
	}
}

export default CartManager;
