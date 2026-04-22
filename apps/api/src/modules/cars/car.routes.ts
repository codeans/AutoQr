import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  deleteCarHandler,
  getCars,
  makePrimary,
  postCar,
  putCar
} from "./car.controller.js";

export const carRouter = Router();
carRouter.use(requireAuth);
carRouter.get("/", getCars);
carRouter.post("/", postCar);
carRouter.put("/:id", putCar);
carRouter.delete("/:id", deleteCarHandler);
carRouter.post("/:id/primary", makePrimary);
