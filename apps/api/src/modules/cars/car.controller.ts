import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCar,
  deleteCar,
  listCars,
  setPrimaryCar,
  updateCar
} from "./car.service.js";

const carSchema = z.object({
  registrationNumber: z.string().min(1).max(40),
  make: z.string().optional().default(""),
  model: z.string().optional().default(""),
  color: z.string().optional().default(""),
  year: z.number().optional(),
  nickname: z.string().optional().default(""),
  displayMessage: z.string().optional().default(""),
  plateImage: z.string().optional().default("")
});

export const getCars = asyncHandler(async (req: Request, res: Response) => {
  const cars = await listCars(req.auth!.userId);
  res.json({ cars });
});

export const postCar = asyncHandler(async (req: Request, res: Response) => {
  const body = carSchema.parse(req.body);
  const car = await createCar(req.auth!.userId, body);
  res.status(201).json({ car });
});

export const putCar = asyncHandler(async (req: Request, res: Response) => {
  const body = carSchema.partial().parse(req.body);
  const car = await updateCar(req.auth!.userId, String(req.params.id), body);
  res.json({ car });
});

export const deleteCarHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteCar(req.auth!.userId, String(req.params.id));
  res.json(result);
});

export const makePrimary = asyncHandler(async (req: Request, res: Response) => {
  const car = await setPrimaryCar(req.auth!.userId, String(req.params.id));
  res.json({ car });
});
