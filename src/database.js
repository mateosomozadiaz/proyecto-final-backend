import mongoose from "mongoose";

const MONGO_URL =
	"mongodb+srv://database:BIcbp8lbEtYXCYUF@cluster0.kb08p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

try {
	await mongoose.connect(MONGO_URL);
	console.log("Connected to MongoDB");
} catch (error) {
	console.error("Error connecting to MongoDB:", error);
}
