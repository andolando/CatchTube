import { createFileRoute, redirect } from "@tanstack/react-router"
import DashboardLayout from "../components/layouts/DashboardLayout"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {

    if (!context.auth.isLoading && !context.auth.user) {
      throw redirect({ to: "/auth" })
    }
  },
  component: DashboardLayout,
})
