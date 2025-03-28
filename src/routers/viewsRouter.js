import { Router } from "express";

export default function (productsManager, cartsManager) {
	const router = Router();

	router.get("/", async (req, res) => {
		const products = await productsManager.getProducts();
		res.render("products", {
			pageTitle: "Productos",
			products: products.payload,
		});
	});

	router.get("/product/:pid", async (req, res) => {
		const pid = req.params.pid;
		const product = await productsManager.getProductById(pid);
		res.render("productDetail", {
			pageTitle: "Detalles de Producto",
			product: product,
		});
	});

	router.get("/carts", async (req, res) => {
		const products = await productsManager.getProducts();
		res.render("carts", { pageTitle: "Carritos", products: products.payload });
	});

	router.get("/realtimeproducts", async (req, res) => {
		const products = await productsManager.getProducts();
		res.render("realTimeProducts", {
			pageTitle: "Productos en Tiempo Real",
			products: products.payload,
		});
	});

	return router;
}
