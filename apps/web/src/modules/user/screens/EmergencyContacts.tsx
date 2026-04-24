import { FormEvent, useEffect, useState } from "react";
import { Button, Card, EmptyState, Input, LoadingState, SecondaryButton, SectionTitle, StatusBadge } from "../../../components/ui";
import { ownerService } from "../services/owner.service";
import type { OwnerEmergencyContact } from "../services/owner.service";

const EMPTY = {
  name: "",
  relationship: "",
  phone: "",
  email: "",
  notifyOnEmergencyOnly: true
};

export const EmergencyContactsScreen = () => {
  const [contacts, setContacts] = useState<OwnerEmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    ownerService.listEmergencyContacts().then(setContacts);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await ownerService.updateEmergencyContact(editingId, form);
      } else {
        await ownerService.createEmergencyContact(form);
      }
      setForm(EMPTY);
      setEditingId(null);
      await refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save contact.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this emergency contact?")) return;
    await ownerService.deleteEmergencyContact(id);
    await refresh();
  };

  const edit = (c: OwnerEmergencyContact) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email ?? "",
      notifyOnEmergencyOnly: c.notifyOnEmergencyOnly
    });
  };

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Emergency contacts"
        subtitle="In an accident or emergency scan, we'll alert these contacts by SMS, WhatsApp, and email. Add family or trusted backups."
      />

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-sm font-medium text-slate-700">
            Name
            <Input required className="mt-1" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Relationship
            <Input
              className="mt-1"
              placeholder="Spouse, parent, friend…"
              value={form.relationship}
              onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone
            <Input required className="mt-1" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email (optional)
            <Input type="email" className="mt-1" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label className="md:col-span-2 flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.notifyOnEmergencyOnly}
              onChange={(e) => setForm((p) => ({ ...p, notifyOnEmergencyOnly: e.target.checked }))}
              className="mt-1"
            />
            <span>
              Only notify this contact on emergencies (accidents). Unchecked = notify on any urgent scan alert.
            </span>
          </label>
          {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update contact" : "Add contact"}
            </Button>
            {editingId && (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
              >
                Cancel
              </SecondaryButton>
            )}
          </div>
        </form>
      </Card>

      {contacts.length === 0 ? (
        <EmptyState title="No emergency contacts" message="Add up to 10 people who should be alerted in emergencies." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {contacts.map((c) => (
            <Card key={c._id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-600">
                    {c.relationship || "Contact"} · priority {c.priority}
                  </p>
                </div>
                <StatusBadge
                  label={c.notifyOnEmergencyOnly ? "emergency only" : "all urgent"}
                  tone={c.notifyOnEmergencyOnly ? "warning" : "info"}
                />
              </div>
              <p className="font-mono text-sm text-slate-700">{c.phone}</p>
              {c.email && <p className="text-sm text-slate-500">{c.email}</p>}
              <div className="flex gap-2 pt-2">
                <SecondaryButton type="button" onClick={() => edit(c)}>
                  Edit
                </SecondaryButton>
                <SecondaryButton type="button" onClick={() => remove(c._id)} className="text-red-600">
                  Remove
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
