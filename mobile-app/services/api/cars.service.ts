import { apiClient } from "./client";
import type { Car } from "@/types/domain";

export async function listCars(): Promise<Car[]> {
  const res = await apiClient.get<{ cars: Car[] }>("/owner/cars");
  return res.cars ?? [];
}

export async function getCar(id: string): Promise<Car> {
  const res = await apiClient.get<{ car: Car }>(`/owner/cars/${id}`);
  return res.car;
}

export type CarInput = {
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  nickname?: string;
  displayMessage?: string;
};

export async function createCar(input: CarInput): Promise<Car> {
  const res = await apiClient.post<{ car: Car }>("/owner/cars", input);
  return res.car;
}

export async function updateCar(id: string, input: Partial<CarInput>): Promise<Car> {
  const res = await apiClient.put<{ car: Car }>(`/owner/cars/${id}`, input);
  return res.car;
}

export async function deleteCar(id: string): Promise<void> {
  await apiClient.delete<{ message: string }>(`/owner/cars/${id}`);
}

export async function setPrimaryCar(id: string): Promise<Car> {
  const res = await apiClient.post<{ car: Car }>(`/owner/cars/${id}/primary`, {});
  return res.car;
}

export async function uploadPlateImage(
  carId: string,
  file: { uri: string; name: string; type: string }
): Promise<Car> {
  const form = new FormData();
  // React Native FormData accepts { uri, name, type }
  form.append("plateImage", file as unknown as Blob);
  const res = await apiClient.put<{ car: Car }>(`/owner/cars/${carId}`, form);
  return res.car;
}
