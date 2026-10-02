import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Once the connection is open, log it
mongoose.connection.once("open", () => console.log("Connected to MongoDB", mongoose.connection.name))

// If there is an error, log it
mongoose.connection.on('error', (error) => console.error("Error in connection", error))

// Once the connection is closed, log it
mongoose.connection.once("close", () => console.log("Connection closed"))

// Export the connection
export default mongoose;