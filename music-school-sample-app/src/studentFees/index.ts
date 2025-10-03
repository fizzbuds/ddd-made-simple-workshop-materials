import { Hono } from "hono";
import { MongoClient } from "mongodb";
import { Controller } from "./controller";
import { ApplicationService } from "./applicationService";
import { StudentFeesRepository } from "./repo";

export function StudentFeesModule(app: Hono) {
  const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
  const repo = new StudentFeesRepository(mongoClient);
  const applicationService = ApplicationService(repo);
  Controller(app, applicationService);
}
