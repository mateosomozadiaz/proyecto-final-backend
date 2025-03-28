import express from "express";
import exphbs from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import path from "path";
import productsRouter from "./routers/productsRouter.js";
import cartsRouter from "./routers/cartsRouter.js";
import viewsRouter from "./routers/viewsRouter.js";
import ProductsManager from "./managers/productsManager.js";
import CartsManager from "./managers/cartsManager.js";
import "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsManager = new ProductsManager();
const cartsManager = new CartsManager();

const PORT = 8080;

const app = express();
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const httpServer = app.listen(PORT, () =>
	console.log(`Server running at http://localhost:${PORT}`)
);

const io = new Server(httpServer);

app.use((req, res, next) => {
	req.io = io;
	next();
});

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.set("io", io);

io.on("connection", async (socket) => {
	console.log("User connected...");

	try {
		const products = await productsManager.getProducts();
		socket.emit("reloadProducts", products.payload);
	} catch (error) {
		console.error("Error loading products:", error);
	}

	socket.on("addProduct", async (product) => {
		try {
			await productsManager.addProduct(product);
			const updatedProducts = await productsManager.getProducts();
			io.emit("reloadProducts", updatedProducts.payload);
		} catch (error) {
			console.error("Error adding product:", error);
		}
	});

	socket.on("createCart", async () => {
		try {
			const newCart = await cartsManager.createCart();
			io.emit("cartUpdated", newCart);
		} catch (error) {
			console.error("Error creating cart:", error);
		}
	});

	socket.on("getCarts", async () => {
		try {
			const carts = await cartsManager.getCarts();
			socket.emit("cartsList", carts);
		} catch (error) {
			console.error("Error retrieving carts:", error);
		}
	});

	socket.on("getCartById", async (cid) => {
		try {
			const cart = await cartsManager.getCartById(cid);
			socket.emit("cartDetails", cart);
		} catch (error) {
			console.error("Error retrieving cart:", error);
		}
	});

	socket.on("addProductToCart", async ({ cid, pid }) => {
		try {
			const updatedCart = await cartsManager.addProductToCart(cid, pid);
			io.emit("cartUpdated", updatedCart);
		} catch (error) {
			console.error(`Error adding product ${pid} to cart ${cid}:`, error);
		}
	});

	socket.on("deleteProductFromCart", async ({ cid, pid }) => {
		try {
			const updatedCart = await cartsManager.deleteProductFromCart(cid, pid);
			io.emit("cartUpdated", updatedCart);
		} catch (error) {
			console.error(`Error removing product ${pid} from cart ${cid}:`, error);
		}
	});

	socket.on("updateProductQuantity", async ({ cid, pid, quantity }) => {
		try {
			const updatedCart = await cartsManager.updateProductQuantity(cid, pid, quantity);
			io.emit("cartUpdated", updatedCart);
		} catch (error) {
			console.error(`Error updating quantity for product ${pid} in cart ${cid}:`, error);
		}
	});
});
