import { Hono } from "hono";
import { ApplicationService } from "./applicationService";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export function Controller(app: Hono, applicationService: ApplicationService) {
  app.post(
    "/student-fees/:studentId/fees",
    zValidator(
      "json",
      z.object({
        amount: z.number(),
        expiration: z.string().date(),
      }),
    ),
    async (c) => {
      const body = await c.req.json();

      const feeId = await applicationService.addFee(
        c.req.param("studentId"),
        body.amount,
        new Date(body.expiration),
      );

      return c.json({ feeId });
    },
  );

  app.post("/student-fees/:studentId/fees/:feeId/pay", async (c) => {
    await applicationService.payFee(
      c.req.param("studentId"),
      c.req.param("feeId"),
    );

    return c.body(null, 200);
  });

  app.get("/student-fees/:studentId/credit-amount", async (c) => {
    const creditAmount = await applicationService.getTotalCreditAmount(
      c.req.param("studentId"),
    );

    return c.json(creditAmount);
  });

  app.get(
    "/student-fees/:studentId/fees",
    zValidator(
      "query",
      z.object({
        expired: z.coerce.boolean().refine((v) => v === true, {
          message: "value must be true",
        }),
      }),
    ),
    async (c) => {
      const expiredFees = await applicationService.getExpiredFees(
        c.req.param("studentId"),
      );

      return c.json(expiredFees);
    },
  );
}
