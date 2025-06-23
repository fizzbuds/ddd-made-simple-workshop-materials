import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { StudentFeesModule } from "./studentFees";
import { showRoutes } from "hono/dev";

const app = new Hono();

app.get("/", (c) => {
  return c.text(
    "Music school sample app is alive, open Bruno api collection to get started",
  );
});

StudentFeesModule(app);

function start() {
  if (process.env.TEST) return;
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(
        `Music school api is running on http://localhost:${info.port}`,
      );

      showRoutes(app);
    },
  );
}

start();

export default app;
