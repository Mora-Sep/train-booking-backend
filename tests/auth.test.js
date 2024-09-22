// auth.test.js
const request = require("supertest");
const express = require("express");
const userAuthRouter = require("../routes/userRoutes"); // import your auth route
const adminRouter = require("../routes/adminRoutes");
const deoRouter = require("../routes/deoRoutes");

const app = express();
app.use(express.json());
app.use("/api/users", userAuthRouter); // use the auth router
app.use("/api/admin", adminRouter);
app.use("/api/deo", deoRouter);

describe("User Authentication Routes", () => {
  it("should authenticate a user with valid credentials", async () => {
    const res = await request(app).post("/api/users/login").send({
      username: process.env.TEST_USER_UN,
      password: process.env.TEST_USER_PW,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("should fail to authenticate a user with invalid credentials", async () => {
    const res = await request(app).post("/api/users/login").send({
      username: "user",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Incorrect Username or Password");
  });
});

describe("Admin Authentication Routes", () => {
  it("should authenticate an admin with valid credentials", async () => {
    const res = await request(app).post("/api/admin/auth").send({
      username: process.env.TEST_ADMIN_UN,
      password: process.env.TEST_ADMIN_PW,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("should fail to authenticate an admin with invalid credentials", async () => {
    const res = await request(app).post("/api/admin/auth").send({
      username: "admin",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });
});

describe("DEO Authentication Routes", () => {
  it("should authenticate a DEO with valid credentials", async () => {
    const res = await request(app).post("/api/deo/auth").send({
      username: process.env.TEST_STAFF_UN,
      password: process.env.TEST_STAFF_PW,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("should fail to authenticate a DEO with invalid credentials", async () => {
    const res = await request(app).post("/api/deo/auth").send({
      username: "deo",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });
});
