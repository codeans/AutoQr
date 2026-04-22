import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { OwnerCallExperience } from "./features/calls/OwnerCallExperience";
import { OwnerCallProvider } from "./features/calls/OwnerCallProvider";
import "./styles.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OwnerCallProvider>
            <AppRouter />
            <OwnerCallExperience />
          </OwnerCallProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
