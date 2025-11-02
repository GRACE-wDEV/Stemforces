import { config } from "dotenv";

config();

export const {
  PORT,
  MONGO_URI,
  JWT_SECRET,
} = process.env;