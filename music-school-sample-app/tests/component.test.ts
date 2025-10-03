import {beforeAll, describe, expect, it} from "vitest";
import app from "../src/index";
import {MongoClient} from "mongodb";
import {randomUUID} from "crypto";

describe("Music School api", () => {
  const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");

  beforeAll(async () => {
    await mongoClient.db().collection("students_fees").deleteMany();
  });

  describe("studentFees", () => {
    const studentId = randomUUID();
    let expiredFeeId: string;

    it("POST /student-fees/:studentId/fees", async () => {
      const response = await postRequest(`/student-fees/${studentId}/fees`, {
        amount: 100,
        expiration: "2025-01-01",
      });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toMatchObject({
        feeId: expect.any(String),
      });
      expiredFeeId = responseBody.feeId;
    });

    it("GET /student-fees/:studentId/credit-amount", async () => {
      const response = await app.request(
        `/student-fees/${studentId}/credit-amount`,
      );

      expect(await response.json()).toBe(100);
    });

    it("GET /student-fees/:studentId/fees", async () => {
      const response = await app.request(
        `/student-fees/${studentId}/fees?expired=true`,
      );

      expect(await response.json()).toEqual([
        { amount: 100, expiration: "2025-01-01T00:00:00.000Z" },
      ]);
    });

    it("POST /student-fees/:studentId/fees/:feeId/pay", async () => {
      const response = await postRequest(
        `/student-fees/${studentId}/fees/${expiredFeeId}/pay`,
      );

      expect(response.status).toBe(200);
    });
  });
});

function postRequest(url: string, body?: unknown) {
  return app.request(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}
