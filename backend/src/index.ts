import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import matchesRouter from "./routes/matches";
import playersRouter from "./routes/players";
import seasonsRouter from "./routes/seasons";
import teamsRouter from "./routes/teams";
import dashboardRouter from "./routes/dashboard";
import seasonTrendRouter from "./routes/season-trend";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns 200 if the API server is up and responding.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Backend is healthy
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is healthy" });
});

// API docs UI, served at http://localhost:4000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/matches", matchesRouter);
app.use("/api/players", playersRouter);
app.use("/api/seasons", seasonsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/season-trend", seasonTrendRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});