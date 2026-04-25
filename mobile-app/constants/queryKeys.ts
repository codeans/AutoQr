export const QueryKeys = {
  me: ["me"] as const,
  cars: ["cars"] as const,
  car: (id: string) => ["cars", id] as const,
  tags: ["tags"] as const,
  activations: ["activations"] as const,
  incidents: ["incidents"] as const,
  incident: (id: string) => ["incidents", id] as const,
  dashboard: ["dashboard"] as const,
  calls: ["calls"] as const,
  callbacks: ["callbacks"] as const,
  notifications: ["notifications"] as const,
  scanAlerts: ["scan-alerts"] as const,
  emergencyContacts: ["emergency-contacts"] as const,
  content: (slug: string) => ["content", slug] as const,
  plans: ["plans"] as const
};
