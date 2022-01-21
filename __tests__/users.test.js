const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/users", () => {
  describe("GET", () => {
    test("Status:200 and array of usernames", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
      response.body.users.forEach((user) => {
        expect(user).toEqual(
          expect.objectContaining({
            username: expect.any(String),
          })
        );
      });
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/users");
      expect(response.status).toBe(405);
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("Status:200 and the requested user when passed valid username", async () => {
      const response = await request(app).get("/api/users/mallionaire");
      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        username: "mallionaire",
        name: "haz",
        avatar_url:
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
      });
    });

    test("Status:404 when passed valid username", async () => {
      const response = await request(app).get("/api/users/puffin");
      expect(response.status).toBe(404);

      const response2 = await request(app).get("/api/users/67676767");
      expect(response2.status).toBe(404);

      const response3 = await request(app).get('/api/users/{msg:"hello"}');
      expect(response3.status).toBe(404);
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/users/mallionaire");
      expect(response.status).toBe(405);
    });
  });
});
