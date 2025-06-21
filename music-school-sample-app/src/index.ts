import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { StudentFeesModule } from "./studentFees";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

StudentFeesModule(app);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
