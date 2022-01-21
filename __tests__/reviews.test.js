const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

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
      expect(response.body.msg).toBe("Bad request");
    });

    test("Status:400 when inc_votes is not a number", async () => {
      const response = await request(app).patch("/api/reviews/1").send({});
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE", () => {
    test("Status:204 when passed valid id", async () => {
      const response = await request(app).delete("/api/reviews/1");
      expect(response.status).toBe(204);
    });

    test("Status:404 when passed valid but non-existent id", async () => {
      const response = await request(app).delete("/api/reviews/1");
      expect(response.status).toBe(204);

      const response2 = await request(app).delete("/api/reviews/1");
      expect(response2.status).toBe(404);
    });

    test("Status:400 when passed invalid id", async () => {
      const response = await request(app).delete("/api/reviews/squirrel");
      expect(response.status).toBe(400);
    });
  });

  describe("method not allowed", () => {
    test("Status:405", async () => {
      const response = await request(app).post("/api/reviews/1");
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
        expect(isNaN(Date.parse(review.created_at))).toBe(false);
        expect(review).toEqual(
          expect.objectContaining({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
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

    test("Limits list of reviews to 10 per page by default", async () => {
      const response = await request(app).get("/api/reviews");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(10);
    });

    test("Limits list of reviews to number passed as limit query", async () => {
      const response = await request(app).get("/api/reviews?limit=5");
      expect(response.status).toBe(200);
      expect(response.body.reviews).toHaveLength(5);
    });

    test("Status:400 when limit is not a number", async () => {
      const response = await request(app).get("/api/reviews?limit=hello");
      expect(response.status).toBe(400);

      const response2 = await request(app).get("/api/reviews?limit=    ");
      expect(response2.status).toBe(400);
    });

    test("Responds with another list of 10 reviews when page number is provided", async () => {
      const page1 = await request(app).get("/api/reviews");
      const page2 = await request(app).get("/api/reviews?p=2");
      for (page2Review of page2.body.reviews) {
        for (page1Review of page1.body.reviews) {
          expect(page2Review).not.toEqual(page1Review);
        }
      }
    });

    test("Status:400 when p is not a number", async () => {
      const response = await request(app).get("/api/reviews?p=hello");
      expect(response.status).toBe(400);

      const response2 = await request(app).get("/api/reviews?p=    ");
      expect(response2.status).toBe(400);
    });

    test("Response body includes total_count key with total number of reviews returned", async () => {
      const response = await request(app).get("/api/reviews");
      expect(response.status).toBe(200);
      expect(
        parseInt(response.body.total_count) > response.body.reviews.length
      ).toBe(true);
    });

    test("Total_count handles category filter", async () => {
      const response1 = await request(app).get("/api/reviews");
      const response2 = await request(app).get(
        "/api/reviews?category=dexterity"
      );

      expect(response1.body.total_count > response2.body.total_count).toBe(
        true
      );
    });
  });

  describe("POST", () => {
    test("Status:201 and returns new review", async () => {
      const response = await request(app).post("/api/reviews").send({
        owner: "mallionaire",
        title: "Mine a Million",
        review_body: "A management sim ahead of its time",
        designer: "Peter and Philip Bergner",
        category: "euro game",
      });
      expect(response.status).toBe(201);
      expect(isNaN(Date.parse(response.body.review.created_at))).toBe(false);
      expect(response.body.review).toEqual(
        expect.objectContaining({
          owner: "mallionaire",
          title: "Mine a Million",
          review_body: "A management sim ahead of its time",
          designer: "Peter and Philip Bergner",
          category: "euro game",
          review_id: expect.any(Number),
          votes: 0,
          comment_count: 0,
        })
      );
    });

    test("Status:400 when owner does not already exist in users", async () => {
      const response = await request(app).post("/api/reviews").send({
        owner: "lordcholmonderly",
        title: "Mine a Million",
        review_body: "A management sim ahead of its time",
        designer: "Peter and Philip Bergner",
        category: "euro game",
      });

      expect(response.status).toBe(400);
    });

    test("Status:400 when category does not already exist in categories", async () => {
      const response = await request(app).post("/api/reviews").send({
        owner: "mallionaire",
        title: "Mine a Million",
        review_body: "A management sim ahead of its time",
        designer: "Peter and Philip Bergner",
        category: "business game",
      });

      expect(response.status).toBe(400);
    });

    test("Status:400 when any key is missing from request body", async () => {
      const response = await request(app).post("/api/reviews").send({
        owner: "mallionaire",
        title: "Mine a Million",
        review_body: "A management sim ahead of its time",
        category: "business game",
      });

      expect(response.status).toBe(400);

      const response2 = await request(app).post("/api/reviews").send({
        owner: "mallionaire",
        title: "Mine a Million",
        review_body: "A management sim ahead of its time",
        designer: "Peter and Philip Bergner",
      });

      expect(response2.status).toBe(400);

      const response3 = await request(app).post("/api/reviews").send({
        owner: "mallionaire",
        title: "Mine a Million",
        designer: "Peter and Philip Bergner",
        category: "business game",
      });

      expect(response3.status).toBe(400);
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
        expect(isNaN(Date.parse(comment.created_at))).toBe(false);
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
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

    test("Limits list of comments to number passed as limit query", async () => {
      const response = await request(app).get(
        "/api/reviews/2/comments?limit=2"
      );
      expect(response.body.comments).toHaveLength(2);

      const response2 = await request(app).get("/api/reviews/2/comments");
      expect(response2.body.comments.length > 2).toBe(true);
    });

    test("Status:400 when limit is not a number", async () => {
      const response = await request(app).get(
        "/api/reviews/2/comments?limit=hello"
      );
      expect(response.status).toBe(400);

      const response2 = await request(app).get(
        "/api/reviews/2/comments?limit=    "
      );
      expect(response2.status).toBe(400);
    });

    test("Responds with another list of (limit) comments when page number is provided", async () => {
      const page1 = await request(app).get("/api/reviews/2/comments?limit=2");
      const page2 = await request(app).get(
        "/api/reviews/2/comments?limit=2&&p=2"
      );

      for (page2Comment of page2.body.comments) {
        for (page1Comment of page1.body.comments) {
          expect(page2Comment).not.toEqual(page1Comment);
        }
      }
    });

    test("Status:400 when p is not a number", async () => {
      const response = await request(app).get(
        "/api/reviews/2/comments?p=hello"
      );
      expect(response.status).toBe(400);

      const response2 = await request(app).get(
        "/api/reviews/2/comments?p=    "
      );
      expect(response2.status).toBe(400);
    });

    test("Response body includes total_count key with total number of reviews returned", async () => {
      const response = await request(app).get("/api/reviews/2/comments");
      const totalComments = response.body.comments.length;

      const response2 = await request(app).get(
        "/api/reviews/2/comments?limit=1"
      );
      expect(parseInt(response2.body.total_count)).toBe(totalComments);
      expect(response2.body.comments).toHaveLength(1);
    });
  });
});
