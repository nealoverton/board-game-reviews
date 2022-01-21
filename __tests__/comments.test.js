const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("Status:204 when passed valid id", async () => {
      const response = await request(app).delete("/api/comments/1");
      expect(response.status).toBe(204);
    });

    test("Status:404 when passed valid but non-existent id", async () => {
      const response = await request(app).delete("/api/comments/1");
      expect(response.status).toBe(204);

      const response2 = await request(app).delete("/api/comments/1");
      expect(response2.status).toBe(404);
    });

    test("Status:400 when passed invalid id", async () => {
      const response = await request(app).delete("/api/comments/squirrel");
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH", () => {
    test("Status:200 and the updated comment when passed valid inc_votes", async () => {
      const response = await request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 1 });
      expect(response.status).toBe(200);
      expect(response.body.comment).toEqual({
        comment_id: 1,
        body: "I loved this game too!",
        votes: 17,
        author: "bainesface",
        review_id: 2,
        created_at: new Date(1511354613389).toJSON(),
      });
    });

    test("Status:404 non-existent but valid id", async () => {
      const response = await request(app)
        .patch("/api/comments/1000")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Id not found");
    });

    test("Status:400 when passed invalid id", async () => {
      const response = await request(app)
        .patch("/api/comments/puffin")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("Status:400 when body contains no inc_votes", async () => {
      const response = await request(app).patch("/api/comments/1").send({});
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request: no inc_votes");
    });

    test("Status:400 when inc_votes is not a number", async () => {
      const response = await request(app).patch("/api/comments/1").send({});
      expect(response.status).toBe(400);
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).get("/api/comments/1");
      expect(response.status).toBe(405);
    });
  });
});
