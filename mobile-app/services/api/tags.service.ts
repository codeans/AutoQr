import { apiClient } from "./client";
import type { Tag } from "@/types/domain";

export type ActivationPayload = {
  activationCode: string;
  carId?: string;
  carPayload?: {
    registrationNumber: string;
    make?: string;
    model?: string;
    color?: string;
    year?: number;
    nickname?: string;
  };
};

export async function activateTag(payload: ActivationPayload): Promise<Tag> {
  const res = await apiClient.post<{ tag: Tag }>("/owner/tags/activate", payload);
  return res.tag;
}

export async function listTags(): Promise<Tag[]> {
  const res = await apiClient.get<{ tags: Tag[] }>("/owner/tags");
  return res.tags ?? [];
}

export async function listActivations(): Promise<unknown[]> {
  const res = await apiClient.get<{ activationHistory: unknown[] }>("/owner/tags/activations");
  return res.activationHistory ?? [];
}
