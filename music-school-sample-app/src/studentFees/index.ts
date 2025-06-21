import { Hono } from "hono";
import { Controller } from "./controller";
import { ApplicationService } from "./applicationService";
import { Repo } from "./repo";

export function StudentFeesModule(app: Hono) {
  const repo = Repo();
  const applicationService = ApplicationService(repo);
  Controller(app, applicationService);
}
