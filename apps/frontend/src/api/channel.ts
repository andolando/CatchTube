import api from "@/lib/axios"
import type { Channel } from "@/types"

export const SearchChannels = async (theme: string): Promise<Channel[]> => {
  const response = await api.post("/search/channels", { theme })
  return response.data
}
