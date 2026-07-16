import type { User } from "@/types"
import { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router"
// import {TanStackRouterDevtools} from "@tanstack/react-query-devtools"

import NotFound from "@/pages/NotFound"

type RouterContext = {
  queryClient: QueryClient
  auth: {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Share,explore and build on the best startup ideas and side hustles",
      },
      {
        title: "CatchTube - Share and Explore Startup Ideas",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="">
      <HeadContent />
      <main>
        <Outlet />
      </main>
      {/* <TanStackRouterDevtools /> */}
    </div>
  )
}
