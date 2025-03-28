import ProductModel from "../models/product.js";

class ProductManager {
	async addProduct(product) {
		try {
			const newProduct = new ProductModel(product);
			await newProduct.save();
			console.log("Product added:", newProduct);
			return newProduct;
		} catch (error) {
			console.error("Error adding product:", error);
			throw error;
		}
	}

	async getProducts(filters = {}, options = {}) {
		try {
			const { limit = 10, page = 1, sort, query } = options;
			const mongoFilters = { ...filters };
			let parsedQuery = {};

			if (query) {
				parsedQuery = typeof query === "string" ? JSON.parse(query) : query;
			}

			if (parsedQuery.stock === "available") {
				mongoFilters.stock = { $gt: 0 };
			} else if (parsedQuery.stock === "unavailable") {
				mongoFilters.stock = 0;
			}

			const queryOptions = {
				limit: parseInt(limit),
				skip: (parseInt(page) - 1) * parseInt(limit),
				sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : undefined,
			};

			const [products, totalDocs] = await Promise.all([
				ProductModel.find(mongoFilters)
					.sort(queryOptions.sort || {})
					.limit(queryOptions.limit)
					.skip(queryOptions.skip)
					.lean(),
				ProductModel.countDocuments(mongoFilters),
			]);

			const totalPages = Math.ceil(totalDocs / queryOptions.limit);
			const hasPrevPage = page > 1;
			const hasNextPage = page < totalPages;

			const buildLink = (newPage) => {
				const params = new URLSearchParams();
				if (limit) params.append("limit", limit);
				if (sort) params.append("sort", sort);
				if (query) params.append("query", query);
				params.append("page", newPage);
				return `/api/products?${params.toString()}`;
			};

			return {
				status: "success",
				payload: products,
				totalPages,
				prevPage: hasPrevPage ? parseInt(page) - 1 : null,
				nextPage: hasNextPage ? parseInt(page) + 1 : null,
				page: parseInt(page),
				hasPrevPage,
				hasNextPage,
				prevLink: hasPrevPage ? buildLink(parseInt(page) - 1) : null,
				nextLink: hasNextPage ? buildLink(parseInt(page) + 1) : null,
			};
		} catch (error) {
			console.error("Error retrieving products:", error);
			return {
				status: "error",
				error: error.message,
			};
		}
	}

	async getProductById(pid) {
		try {
			const product = await ProductModel.findById(pid);
			if (!product) {
				throw new Error("Product not found");
			}
			return product;
		} catch (error) {
			console.error(`Error retrieving product with ID ${pid}:`, error);
			throw error;
		}
	}
}

export default ProductManager;
