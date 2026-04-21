import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Input } from "../../../components/ui";
import { DataTable } from "../components/DataTable";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { adminService } from "../services/admin.service";
import { AdminContentItem } from "../types/admin.types";

export const ContentPage = () => {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: adminService.getContent
  });
  const [form, setForm] = useState({
    slug: "home",
    title: "Homepage",
    heroHeading: "Protect what matters",
    heroSubheading: "Premium QR identity for vehicles and valuables.",
    faqTitle: "Frequently asked questions",
    pricingTitle: "Simple one-time price"
  });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await adminService.saveContent({
      slug: form.slug,
      title: form.title,
      sections: [
        { type: "hero", heading: form.heroHeading, subheading: form.heroSubheading },
        { type: "faq", heading: form.faqTitle },
        { type: "pricing", heading: form.pricingTitle }
      ]
    });
    await refetch();
  };

  if (isLoading) return <LoadingState rows={8} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Content" subtitle="CMS-style editing panels for homepage blocks, FAQ, and pricing sections." />
      <SectionCard title="Structured content editor">
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="Page slug" />
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Page title" />
            <Input value={form.heroHeading} onChange={(e) => setForm((prev) => ({ ...prev, heroHeading: e.target.value }))} placeholder="Hero heading" />
            <Input value={form.heroSubheading} onChange={(e) => setForm((prev) => ({ ...prev, heroSubheading: e.target.value }))} placeholder="Hero subheading" />
            <Input value={form.faqTitle} onChange={(e) => setForm((prev) => ({ ...prev, faqTitle: e.target.value }))} placeholder="FAQ title" />
            <Input value={form.pricingTitle} onChange={(e) => setForm((prev) => ({ ...prev, pricingTitle: e.target.value }))} placeholder="Pricing title" />
          </div>
          <Button type="submit">Save Content</Button>
        </form>
      </SectionCard>

      <SectionCard title="Content records">
        <DataTable
          columns={["Slug", "Title", "Published", "Updated"]}
          rows={(data?.content ?? []).map((item: AdminContentItem) => [
            item.slug,
            item.title,
            <StatusBadge label={item.published ? "published" : "draft"} tone={item.published ? "success" : "warning"} />,
            new Date(item.updatedAt).toLocaleString()
          ])}
        />
      </SectionCard>
    </div>
  );
};
