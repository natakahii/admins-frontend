import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.jsx";
import { AuthProvider } from "./app/providers/AuthProvider.jsx";
import QueryProvider from "./app/providers/QueryProvider.jsx";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}
