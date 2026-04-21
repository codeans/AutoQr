export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "AutoQr API",
    version: "1.0.0",
    description: "API for AutoQr private incident communication platform."
  },
  paths: {
    "/api/auth/register": { post: { summary: "Register owner account" } },
    "/api/auth/login": { post: { summary: "Login owner/admin" } },
    "/api/payments/checkout": { post: { summary: "Create Stripe checkout session" } },
    "/api/public/incident/{token}": {
      get: { summary: "Get QR incident landing context" },
      post: { summary: "Create incident report from public scanner" }
    },
    "/api/owner/dashboard": { get: { summary: "Owner dashboard summary" } },
    "/api/admin/dashboard": { get: { summary: "Admin dashboard summary" } }
  }
};
