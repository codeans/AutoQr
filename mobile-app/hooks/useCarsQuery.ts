import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CarsApi } from "@/services/api";
import { QueryKeys } from "@/constants/queryKeys";
import type { CarInput } from "@/services/api/cars.service";

export function useCarsQuery() {
  return useQuery({
    queryKey: QueryKeys.cars,
    queryFn: CarsApi.listCars
  });
}

export function useCarQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? QueryKeys.car(id) : ["car", "none"],
    queryFn: () => CarsApi.getCar(id as string),
    enabled: Boolean(id)
  });
}

export function useCreateCarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CarInput) => CarsApi.createCar(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.cars });
    }
  });
}

export function useUpdateCarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CarInput> }) =>
      CarsApi.updateCar(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QueryKeys.cars });
      qc.invalidateQueries({ queryKey: QueryKeys.car(vars.id) });
    }
  });
}

export function useDeleteCarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CarsApi.deleteCar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.cars });
    }
  });
}

export function useSetPrimaryCarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CarsApi.setPrimaryCar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.cars });
    }
  });
}
