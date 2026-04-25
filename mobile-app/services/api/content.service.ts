import { apiClient } from "./client";
import type { CMSContent } from "@/types/domain";

export async function getContent(slug: string): Promise<CMSContent | null> {
  const res = await apiClient.get<{ content: CMSContent | null }>(`/public/content/${slug}`, {
    skipAuth: true
  });
  return res.content;
}
