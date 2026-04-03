import { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  createRootRouteWithContext,
  Outlet,
  Link,
} from "@tanstack/react-router"
// import {TanStackRouterDevtools} from "@tanstack/react-query-devtools"

type RouterContext = {
  queryClient: QueryClient
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
        title: "CatchTube- Your Idea Hub ",
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

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
      <p className="mb-6 text-lg text-gray-600">
        Ooops! The page you are looking for does not exist
      </p>
      <Link
        to="/"
        className="rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
      >
        Go back
      </Link>
    </div>
  )
}
