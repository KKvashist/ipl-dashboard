import request from "supertest";
import app from "../index";

describe("GET /api/matches", () => {
  it("returns a paginated list of matches", async () => {
    const res = await request(app).get("/api/matches");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("respects pagination params", async () => {
    const res = await request(app).get("/api/matches?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });
});

describe("GET /api/matches/:id", () => {
  it("returns a single match for a valid id", async () => {
    const listRes = await request(app).get("/api/matches?limit=1");
    const sampleId = listRes.body.data[0].id;

    const res = await request(app).get(`/api/matches/${sampleId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", sampleId);
  });

  it("returns 404 for a nonexistent id", async () => {
    const res = await request(app).get("/api/matches/999999999");
    expect(res.status).toBe(404);
  });
});