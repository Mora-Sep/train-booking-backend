// Import the app and supertest
const request = require("supertest");
const app = require("../app"); // Adjust the path to where your Express app is exported

describe("Nested routes under /api/get", () => {
  test("GET /trains responds with expected data", async () => {
    const response = await request(app).get("/api/get/trains");
    expect(response.statusCode).toBe(200);

    // Adjusting expectation to match the received array directly
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Number: expect.any(Number),
          Model: expect.any(Number),
          Name: expect.any(String),
        }),
      ])
    );
  });
});
