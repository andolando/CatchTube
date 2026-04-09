import { StrictMode, useMemo } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
// import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { useAuth } from "@/hooks/useAuth.ts"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function App() {
  const auth = useAuth()

  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        context: { queryClient, auth },
      }),
    [auth]
  )

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
