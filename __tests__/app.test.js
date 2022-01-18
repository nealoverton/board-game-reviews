const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/invalid_url", () => {
  test("Status:404 and error message", async () => {
    const response = await request(app).get("/invalid_url");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Invalid URL");
  });
});

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
  });
});

describe("/api/reviews/:review_id", () => {
  describe("GET", () => {
    test("Status:200 and the requested review when passed valid id", async () => {
      const response = await request(app).get("/api/reviews/1");
      expect(response.status).toBe(200);
      expect(response.body.review).toEqual({
        owner: "mallionaire",
        title: "Agricola",
        review_id: 1,
        review_body: "Farmyard fun!",
        designer: "Uwe Rosenberg",
        review_img_url:
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        category: "euro game",
        created_at: new Date(1610964020514).toJSON(),
        votes: 1,
        comment_count: "0",
      });
    });

    test("Status:404 and error messsage when passed non-existent id", async () => {
      const response = await request(app).get("/api/reviews/1000");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Id not found");
    });
  });

  describe("PATCH", () => {
    test("Status:200 and the updated review when passed valid id", async () => {
      const response = await request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(200);
      expect(response.body.review.votes).toBe(3);
    });
  });
});

describe("/api/reviews", () => {
  describe("GET", () => {
    test("Status:200 and list of reviews", async () => {
      const response = await request(app).get("/api/reviews");
      expect(response.status).toBe(200);
      response.body.reviews.forEach((review) => {
        expect(review).toEqual(
          expect.objectContaining({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(String),
          })
        );
      });
    });

    test("Sorts results by date as default", async () => {
      const response = await request(app).get("/api/reviews");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("created_at");
    });

    test("?sort_by= sorts results by valid column name", async () => {
      const response = await request(app).get("/api/reviews?sort_by=votes");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("votes");

      const response2 = await request(app).get("/api/reviews?sort_by=category");
      expect(response2.status).toBe(200);
      expect(response2.body.reviews).toBeSortedBy("category");

      const response3 = await request(app).get(
        "/api/reviews?sort_by=comment_count"
      );
      expect(response3.status).toBe(200);
      expect(response3.body.reviews).toBeSortedBy("comment_count");
    });

    test("?sort_by= defaults to date when passed invalid sort_by", async () => {
      const response = await request(app).get("/api/reviews?sort_by=squirrels");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("created_at");
    });

    test("?order= sorts in DESC when specified", async () => {
      const response = await request(app).get("/api/reviews?order=DESC");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("created_at", {
        descending: true,
      });
    });

    test("?order= is case insensitive", async () => {
      const response = await request(app).get("/api/reviews?order=desc");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("created_at", {
        descending: true,
      });
    });

    test("?order= defaults to ASC when passed invalid order query", async () => {
      const response = await request(app).get("/api/reviews?order=squirrel");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeSortedBy("created_at");
    });

    test("?category= filters results by single-word category", async () => {
      const response = await request(app).get(
        "/api/reviews?category=dexterity"
      );
      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(1);
    });

    test("?category= handles multiple-word input", async () => {
      const response = await request(app).get(
        "/api/reviews?category=euro%20game"
      );
      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(1);
    });

    test("?category= returns empty array when valid catgory has no entries", async () => {
      const response = await request(app).get(
        "/api/reviews?category=children's%20games"
      );
      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(0);
    });

    test("?category= returns 400 error when passed invalid category", async () => {
      const response = await request(app).get(
        "/api/reviews?category=deckbuilding"
      );
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Invalid category");
    });
  });
});
