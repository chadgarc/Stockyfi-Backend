// Import .env from the beginning of the file and initialize it 
import dotenv from "dotenv";
dotenv.config();

// Import connection to MongoDB
import "./config/connection.js";

import express from "express";
// import routes from "./routes/index.js";

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware to handle JSON data
app.use(express.json());

// routes
// app.use("/api", routes);

// Default route - Test MongoDB connection
app.get("/", (req, res) => res.json({ success: true, message: "Welcome to Stockify Backend" }));

// 404 handler
app.use((req, res) => {
    return res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));