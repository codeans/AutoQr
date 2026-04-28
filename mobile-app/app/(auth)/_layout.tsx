import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    // Route through the root gate so permission onboarding can decide the next screen.
    if (status === "authenticated") router.replace("/");
  }, [status]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" }
      }}
    />
  );
}
