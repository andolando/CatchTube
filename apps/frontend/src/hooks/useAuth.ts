import { getUser } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getUser,
    retry: false,
    staleTime: Infinity,
  });
   return { user: user ?? null, isLoading, error };
};

