// backend/src/swagger.ts
//
// Generates the OpenAPI spec from JSDoc comments placed above each route
// handler (see the @swagger blocks in src/routes/*.ts). Mounted in index.ts
// at /api-docs.

import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IPL Dashboard API",
      version: "1.0.0",
      description:
        "REST API serving IPL match, player, team, and season statistics " +
        "aggregated from ball-by-ball delivery data (1,095 matches, 260,920 deliveries).",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Health", description: "Service health check" },
      { name: "Matches", description: "Match listings and detail" },
      { name: "Players", description: "Career batting/bowling statistics" },
      { name: "Seasons", description: "Season-by-season summaries" },
      { name: "Teams", description: "Franchise win/loss/title records" },
      { name: "Dashboard", description: "Aggregate headline statistics" },
    ],
  },
  // Glob pattern(s) telling swagger-jsdoc where to find @swagger comment blocks.
  apis: ["./src/index.ts", "./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);