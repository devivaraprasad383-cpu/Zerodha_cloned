const request = require("supertest");
const app = require("../src/app");

async function signupAndGetToken(email = "trader@example.com") {
  const res = await request(app).post("/api/auth/signup").send({
    name: "Test Trader",
    email,
    password: "SuperSecret1",
  });
  return res.body.data.token;
}

describe("Orders API", () => {
  it("executes a BUY order, debits the wallet and creates a holding", async () => {
    const token = await signupAndGetToken();

    const buyRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "infy", qty: 2, price: 1500, mode: "BUY" });

    expect(buyRes.status).toBe(201);
    expect(buyRes.body.data.holding.qty).toBe(2);
    expect(buyRes.body.data.holding.avg).toBe(1500);

    const walletRes = await request(app)
      .get("/api/funds")
      .set("Authorization", `Bearer ${token}`);
    expect(walletRes.body.data.availableCash).toBe(100000 - 2 * 1500);

    const holdingsRes = await request(app)
      .get("/api/holdings")
      .set("Authorization", `Bearer ${token}`);
    expect(holdingsRes.body.data).toHaveLength(1);
    expect(holdingsRes.body.data[0].name).toBe("INFY");
  });

  it("rejects a BUY order that exceeds available funds", async () => {
    const token = await signupAndGetToken();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "RELIANCE", qty: 1000, price: 2500, mode: "BUY" });

    expect(res.status).toBe(422);

    const ordersRes = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(ordersRes.body.data[0].status).toBe("REJECTED");
  });

  it("rejects a SELL order when the user doesn't hold the instrument", async () => {
    const token = await signupAndGetToken();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "TCS", qty: 1, price: 3000, mode: "SELL" });

    expect(res.status).toBe(422);
  });

  it("executes a SELL order, credits the wallet and reduces the holding", async () => {
    const token = await signupAndGetToken();

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "WIPRO", qty: 4, price: 500, mode: "BUY" });

    const sellRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "WIPRO", qty: 4, price: 520, mode: "SELL" });

    expect(sellRes.status).toBe(201);
    expect(sellRes.body.data.holding).toBeNull();

    const walletRes = await request(app)
      .get("/api/funds")
      .set("Authorization", `Bearer ${token}`);
    expect(walletRes.body.data.availableCash).toBe(100000 - 4 * 500 + 4 * 520);
  });

  it("keeps one user's orders isolated from another's", async () => {
    const tokenA = await signupAndGetToken("a@example.com");
    const tokenB = await signupAndGetToken("b@example.com");

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "TCS", qty: 1, price: 3000, mode: "BUY" });

    const holdingsB = await request(app)
      .get("/api/holdings")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(holdingsB.body.data).toHaveLength(0);
  });
});
