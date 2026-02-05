import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import store from "./store/store.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext.jsx";

/* ================= QUERY CLIENT ================= */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    
      cacheTime: 10 * 60 * 1000,   
      refetchOnWindowFocus: false,  
      refetchOnReconnect: false,
      retry: false,                
    },
    mutations: {
      retry: false,
    },
  },
});

/* ================= RENDER ================= */
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);
