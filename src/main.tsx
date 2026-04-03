import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
// import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const router = createRouter({ routeTree, context: { queryClient } })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* <App /> */}
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
