// Omris Home Kitchen — Backend API Server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import dns from "dns";


import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://omris-home-kitchen-frontend.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Node.js API'ssssssssss is running successfully",
  });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();