const socket = io();
const form = document.querySelector("#product-form");
const productsContainer = document.querySelector("#products-container");

if (!form || !productsContainer) {
	console.error("Error: No se encontró el formulario o el contenedor de productos.");
}

function deleteProduct(id) {
	socket.emit("deleteProduct", id);
}

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const product = {
		title: document.querySelector("#title").value,
		description: document.querySelector("#description").value,
		image: document.querySelector("#image").value,
		code: document.querySelector("#code").value,
		price: document.querySelector("#price").value,
		status: true,
		stock: document.querySelector("#stock").value,
		category: document.querySelector("#category").value,
	};

	socket.emit("addProduct", product);

	form.reset();
});

function renderProducts(products) {
	const productsContainer = document.querySelector("#products-container");
	productsContainer.innerHTML = "";

	products.forEach((product) => {
		const productElement = document.createElement("div");
		productElement.innerHTML = `
			<p><strong>${product.title}</strong> - ${product.description}</p>
			<button onclick="deleteProduct(${product.id})">Eliminar</button>
		`;
		productsContainer.appendChild(productElement);
	});
}

socket.on("products", (products) => {
	renderProducts(products);
});
