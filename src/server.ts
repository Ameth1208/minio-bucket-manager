import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { config } from "./config";

// Import routes
import authRoutes from "./routes/auth";
import bucketRoutes from "./routes/buckets";
import objectRoutes from "./routes/objects";
import uiRoutes from "./routes/ui";

const app = express();

// Ensure upload directory exists
if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Use Routers
app.use("/api", authRoutes);
app.use("/api", bucketRoutes);
app.use("/api", objectRoutes);
app.use("/", uiRoutes);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
