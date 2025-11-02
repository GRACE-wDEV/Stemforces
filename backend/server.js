import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dp.js";
import cors from "cors";
import { PORT } from "./config/env.js";
import questionRoutes from "./routes/question.routes.js";
import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import homeRoutes from "./routes/home.routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/home", homeRoutes);

app.listen(PORT || 5000, () => console.log(`Server running on  http://localhost:${PORT || 5000}`));
