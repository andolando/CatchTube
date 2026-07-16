import { useSession } from "@/lib/auth-client"
import type { User } from "@/types"

export const useAuth = () => {
  const { data, isPending, error } = useSession()
  const user = (data?.user ?? null) as User | null

  return {
    user,
    isLoading: isPending,
    isAuthenticated: Boolean(user),
    error,
  }
}
