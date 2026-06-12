import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { routes } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.FRONTEND_URL
  })
);
app.use(express.json());
app.use(routes);
app.use(errorMiddleware);
