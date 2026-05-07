import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./i18n";
import { AppRouter } from "./router";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

const queryClient = new QueryClient();
const OwnerCallLayer = lazy(() =>
  Promise.all([import("./features/calls/OwnerCallProvider"), import("./features/calls/OwnerCallExperience")]).then(
    ([providerModule, experienceModule]) => ({
      default: ({ children }: { children: React.ReactNode }) => (
        <providerModule.OwnerCallProvider>
          {children}
          <experienceModule.OwnerCallExperience />
        </providerModule.OwnerCallProvider>
      )
    })
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={null}>
              <OwnerCallLayer>
                <AppRouter />
              </OwnerCallLayer>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
