import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthVerifyForm } from "@/components/auth-verify-form"

export const Route = createFileRoute("/auth/verify")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoading && context.auth.isAuthenticated) {
      throw redirect({ to: "/dashboard" })
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: AuthVerifyPage,
})

function AuthVerifyPage() {
  const { email } = Route.useSearch()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthVerifyForm email={email} />
      </div>
    </div>
  )
}
