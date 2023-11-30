const supertest = require("supertest");

const app = require("./app");

const mongoose = require("mongoose");
require("dotenv").config();

describe("login", () => {
  beforeAll(async () => {
    const DB_URI = process.env["DB_URI"];
    await mongoose.connect(DB_URI);
  });

  test("Status should be 200", async () => {
    const response = await supertest(app)
      .post("/users/login")
      .send({
        Status: (200)["OK"],
        "Content-Type": "application/json",
        ResponseBody: {
          token: "exampletoken",
          user: {
            email: "example@example.com",
            subscription: "starter",
          },
        },
      });
    expect(response.Status).toBe(200);
  });
  test("Token should be 'exampletoken'", async () => {
    const response = await supertest(app)
      .post("/users/login")
      .send({
        Status: (200)["OK"],
        "Content-Type": "application/json",
        ResponseBody: {
          token: "exampletoken",
          user: {
            email: "example@example.com",
            subscription: "starter",
          },
        },
      });

    expect(response.ResponseBody.token).toBe("exampletoken");
  });

  test("User should have email 'example@example.com' and subscription 'starter'", async () => {
    const response = await supertest(app)
      .post("/users/login")
      .send({
        Status: (200)["OK"],
        "Content-Type": "application/json",
        ResponseBody: {
          token: "exampletoken",
          user: {
            email: "example@example.com",
            subscription: "starter",
          },
        },
      });

    expect(response.ResponseBody.user).toBe({
      email: "example@example.com",
      subscription: "starter",
    });
  });
});
