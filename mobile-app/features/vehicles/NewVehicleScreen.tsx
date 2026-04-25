import React, { useState } from "react";
import { router } from "expo-router";
import { Header, Screen } from "@/components/ui";
import { VehicleForm } from "./VehicleForm";
import { useCreateCarMutation } from "@/hooks/useCarsQuery";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import type { VehicleValues } from "@/schemas/vehicle.schema";

export function NewVehicleScreen() {
  const [submitting, setSubmitting] = useState(false);
  const mutation = useCreateCarMutation();
  const pushToast = useAppStore((s) => s.pushToast);

  const onSubmit = async (values: VehicleValues) => {
    setSubmitting(true);
    try {
      const car = await mutation.mutateAsync({
        registrationNumber: values.registrationNumber,
        make: values.make || undefined,
        model: values.model || undefined,
        color: values.color || undefined,
        year: values.year ?? undefined,
        nickname: values.nickname || undefined,
        displayMessage: values.displayMessage || undefined
      });
      pushToast({ title: "Vehicle saved", tone: "success" });
      router.replace({ pathname: "/vehicles/[id]", params: { id: car.id } });
    } catch (err) {
      pushToast({ title: "Couldn't save", message: extractErrorMessage(err), tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Add vehicle" />
      <VehicleForm submitting={submitting} onSubmit={onSubmit} submitLabel="Add vehicle" />
    </Screen>
  );
}
