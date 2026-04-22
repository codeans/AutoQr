import { CarModel } from "../../models/Car.js";
import { TagModel } from "../../models/Tag.js";
import { ApiError } from "../../utils/apiError.js";

export const listCars = async (userId: string) => {
  const cars = await CarModel.find({ userId }).sort({ isPrimary: -1, createdAt: -1 }).lean();
  const ids = cars.map((c: any) => c._id);
  const tags = await TagModel.find({ carId: { $in: ids } }).lean();
  const byCar = new Map<string, any[]>();
  for (const t of tags) {
    const key = String((t as any).carId);
    if (!byCar.has(key)) byCar.set(key, []);
    byCar.get(key)!.push(t);
  }
  return cars.map((c: any) => ({
    ...c,
    tags: byCar.get(String(c._id)) ?? []
  }));
};

export const createCar = async (userId: string, payload: any) => {
  const existing = await CarModel.findOne({ userId, registrationNumber: payload.registrationNumber });
  if (existing) throw new ApiError(409, "A car with this registration is already on your account");
  const count = await CarModel.countDocuments({ userId });
  return CarModel.create({ ...payload, userId, isPrimary: count === 0 });
};

export const updateCar = async (userId: string, id: string, payload: any) => {
  const car = await CarModel.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
  if (!car) throw new ApiError(404, "Car not found");
  return car;
};

export const deleteCar = async (userId: string, id: string) => {
  const car = await CarModel.findOne({ _id: id, userId });
  if (!car) throw new ApiError(404, "Car not found");
  const activeTag = await TagModel.findOne({ carId: id, status: "activated" });
  if (activeTag) throw new ApiError(400, "Deactivate the linked tag before removing this car");
  await car.deleteOne();
  return { ok: true };
};

export const setPrimaryCar = async (userId: string, id: string) => {
  await CarModel.updateMany({ userId }, { $set: { isPrimary: false } });
  const car = await CarModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isPrimary: true } },
    { new: true }
  );
  if (!car) throw new ApiError(404, "Car not found");
  return car;
};
