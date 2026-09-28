const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  const credentials = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "SuperSecret1",
  };

  it("signs up a new user and returns a JWT + demo wallet", async () => {
    const res = await request(app).post("/api/auth/signup").send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects a duplicate signup with the same email", async () => {
    await request(app).post("/api/auth/signup").send(credentials);
    const res = await request(app).post("/api/auth/signup").send(credentials);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects signup with a weak password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...credentials, password: "short" });

    expect(res.status).toBe(422);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/signup").send(credentials);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it("rejects login with the wrong password", async () => {
    await request(app).post("/api/auth/signup").send(credentials);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "WrongPassword1" });

    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated access to /auth/me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const signupRes = await request(app).post("/api/auth/signup").send(credentials);
    const { token } = signupRes.body.data;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
  });
});
