const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");
const fs = require("fs/promises");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/invalid_url", () => {
  test("Status:404 and error message", async () => {
    const response = await request(app).get("/invalid_url");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Invalid URL");
  });
});

describe("/api", () => {
  describe("GET", () => {
    test("Status:200 and list of available endpoints, methods, and queries", async () => {
      const response = await request(app).get("/api");
      const endpoints = await fs.readFile("./endpoints.json", "utf-8");
      const parsedEndpoints = JSON.parse(endpoints);
      expect(response.status).toBe(200);
      expect(response.body.endpoints).toEqual(parsedEndpoints);
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api");
      expect(response.status).toBe(405);
    });
  });
});
