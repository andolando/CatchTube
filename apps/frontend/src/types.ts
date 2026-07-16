type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

type Channel = {
  nameChannel: string
  channelId: string
  subscriberCount: number
  description: string
  thumbnailUrl: string
  bannerUrl: string | null
}

export type { User, Channel }