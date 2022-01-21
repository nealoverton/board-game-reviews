const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/categories", () => {
  describe("GET", () => {
    test("Status:200 and list of categories", async () => {
      const response = await request(app).get("/api/categories");
      expect(response.status).toBe(200);
      response.body.categories.forEach((category) => {
        expect(category).toEqual(
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String),
          })
        );
      });
    });

    test("Limits list of catgories to number passed as limit query", async () => {
      const response = await request(app).get("/api/categories?limit=2");
      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(2);
    });

    test("Status:400 when limit is not a number", async () => {
      const response = await request(app).get("/api/categories?limit=hello");
      expect(response.status).toBe(400);

      const response2 = await request(app).get("/api/categories?limit=    ");
      expect(response2.status).toBe(400);
    });

    test("Responds with another list of (limit) categories when page number is provided", async () => {
      const page1 = await request(app).get("/api/categories?limit=2");
      const page2 = await request(app).get("/api/categories?limit=2&&p=2");
      for (page2Category of page2.body.categories) {
        for (page1Category of page1.body.categories) {
          expect(page2Category).not.toEqual(page1Category);
        }
      }
    });

    test("Status:400 when p is not a number", async () => {
      const response = await request(app).get("/api/categories?p=hello");
      expect(response.status).toBe(400);

      const response2 = await request(app).get("/api/categories?p=    ");
      expect(response2.status).toBe(400);
    });

    test("Response body includes total_count key with total number of categories returned", async () => {
      const response = await request(app).get("/api/categories?limit=2");
      expect(response.status).toBe(200);
      expect(
        parseInt(response.body.total_count) > response.body.categories.length
      ).toBe(true);
    });
  });

  describe("POST", () => {
    test("Status:201 and returns new category", async () => {
      const response = await request(app).post("/api/categories").send({
        slug: "Deck-building",
        description:
          "Games that involve drawing cards to construct a deck that defeats the opponent's",
      });
      expect(response.status).toBe(201);
      expect(response.body.category).toEqual({
        slug: "Deck-building",
        description:
          "Games that involve drawing cards to construct a deck that defeats the opponent's",
      });
    });

    test("Status:400 when either value is missing from request body", async () => {
      const response = await request(app).post("/api/categories").send({
        slug: "Deck-building",
      });
      expect(response.status).toBe(400);

      const response2 = await request(app).post("/api/categories").send({
        description:
          "Games that involve drawing cards to construct a deck that defeats the opponent's",
      });
      expect(response2.status).toBe(400);
    });

    test("Status:400 when slug is not unique", async () => {
      const response = await request(app).post("/api/categories").send({
        slug: "euro game",
        description:
          "Games that involve drawing cards to construct a deck that defeats the opponent's",
      });
      expect(response.status).toBe(400);
    });
  });
  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/categories");
      expect(response.status).toBe(405);
    });
  });
});
