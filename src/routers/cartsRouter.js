import { Router } from "express";

export default function (cartsManager) {
	const router = Router();

	router.post("/", async (req, res) => {
		const cart = await cartsManager.createCart();
		res.status(201).json(cart);
	});

	router.get("/:id", async (req, res) => {
		const cart = await cartsManager.getCartById(parseInt(req.params.id));
		res.status(200).json(cart);
	});

	router.post("/:cid/product/:pid", async (req, res) => {
		const product = await cartsManager.addProductToCart(
			parseInt(req.params.cid),
			parseInt(req.params.pid)
		);
		res.status(201).json(product);
	});

	router.delete("/:cid/product/:pid", async (req, res) => {
		const product = await cartsManager.addProductToCart(
			parseInt(req.params.cid),
			parseInt(req.params.pid)
		);
		res.status(201).json(product);
	});

	router.put("/:cid/product/:pid", async (req, res) => {
		const { quantity } = req.body;
		const product = await cartsManager.updateProductQuantity(
			parseInt(req.params.cid),
			parseInt(req.params.pid),
			quantity
		);
		res.status(201).json(product);
	});

	return router;
}
