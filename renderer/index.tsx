/// <reference types="./global" />
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.css";
import IndexPage from "./pages/index";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000,
      retry: 1,
    },
  },
});

function sendToMain(errorObj: { message: string; stack: string }) {
  try {
    window.electron.logRendererError(errorObj);
  } catch {}
}

// Global error handler — shows error in DOM and streams to terminal
window.addEventListener('error', (e) => {
  const err = e.error instanceof Error ? e.error : new Error(String(e.error));
  sendToMain({ message: err.message, stack: err.stack || '' });
  console.error('Global error:', e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  sendToMain({ message: String(e.reason), stack: '' });
  console.error('Unhandled rejection:', e.reason);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:20px;color:red;font-family:monospace">Root element not found</div>';
} else {
  createRoot(rootEl).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <ErrorBoundary>
        <div className="min-h-screen">
          <main className="py-4 space-y-6 w-full px-6">
            <IndexPage />
          </main>
        </div>
        <Toaster position="bottom-left" richColors duration={1500} />
      </ErrorBoundary>
    </StrictMode>
  </QueryClientProvider>,
  );
}
