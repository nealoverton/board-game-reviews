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

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/categories");
      expect(response.status).toBe(405);
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

    test("Status:404 and error messsage when valid but non-existent id", async () => {
      const response = await request(app).get("/api/reviews/1000");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Id not found");
    });

    test("Status:400 and error messsage when invalid id", async () => {
      const response = await request(app).get("/api/reviews/squirrel");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request");

      const response2 = await request(app).get("/api/reviews/7hjdg7");
      expect(response2.status).toBe(400);
      expect(response2.body.msg).toBe("Bad request");
    });
  });

  describe("PATCH", () => {
    test("Status:200 and the updated review when passed valid id and inc_votes", async () => {
      const response = await request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(200);
      expect(response.body.review.votes).toBe(3);
    });

    test("Status:404 non-existent but valid id", async () => {
      const response = await request(app)
        .patch("/api/reviews/1000")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Id not found");
    });

    test("Status:400 when passed invalid id", async () => {
      const response = await request(app)
        .patch("/api/reviews/squirrel")
        .send({ inc_votes: 2 });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("Status:400 when body contains no inc_votes", async () => {
      const response = await request(app).patch("/api/reviews/1").send({});
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request: no inc_votes");
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/reviews/1");
      expect(response.status).toBe(405);
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

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/reviews");
      expect(response.status).toBe(405);
    });
  });
});

describe("/api/reviews/:review_id/comments", () => {
  describe("GET", () => {
    test("Status:200 and array of comments when passed valid id", async () => {
      const response = await request(app).get("/api/reviews/2/comments");
      expect(response.status).toBe(200);
      expect(response.body.comments).toHaveLength(3);
      response.body.comments.forEach((comment) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
          })
        );
      });
    });

    test("Status:200 and empty array when valid review_id has no comments", async () => {
      const response = await request(app).get("/api/reviews/1/comments");
      expect(response.status).toBe(200);
      expect(response.body.comments).toHaveLength(0);
    });

    test("Status:404 and when passed valid but non-existent review_id", async () => {
      const response = await request(app).get("/api/reviews/1000/comments");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Id not found");
    });

    test("Status:400 and when passed invalid review_id", async () => {
      const response = await request(app).get("/api/reviews/squirrel/comments");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request");
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).delete("/api/reviews/1/comments");
      expect(response.status).toBe(405);
    });
  });
});

describe("/api/reviews/:review_id/comments", () => {
  describe("POST", () => {
    test("Status:201 and returns comment when passed valid review_id and comment values", async () => {
      const response = await request(app).post("/api/reviews/1/comments").send({
        username: "dav3rid",
        body: "I agree",
      });

      expect(response.status).toBe(201);
      expect(response.body.comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          author: "dav3rid",
          body: "I agree",
          review_id: 1,
        })
      );
    });

    test("Status:400 when passed invalid or non-existent review_id", async () => {
      const response = await request(app)
        .post("/api/reviews/1000/comments")
        .send({
          username: "dav3rid",
          body: "I agree",
        });
      expect(response.status).toBe(400);
    });

    test("Status:400 when passed body without necessary keys", async () => {
      const response = await request(app).post("/api/reviews/1/comments").send({
        body: "I agree",
      });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request: username or body missing");
    });
  });
});

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

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).get("/api/comments/1");
      expect(response.status).toBe(405);
    });
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
