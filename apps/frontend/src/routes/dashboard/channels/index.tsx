import { createFileRoute } from "@tanstack/react-router"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"
import { SearchChannels } from "@/api/channel"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChannelCard } from "@/components/ChannelCard"
import type { Channel } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/dashboard/channels/")({
  component: Channels,
})

function Channels() {
  const [theme, setTheme] = useState("")

  const { data, mutate, isPending } = useMutation({
    mutationFn: () => SearchChannels(theme),
  })

  const submitTheme = async () => {
    mutate()
    setTheme("")
  }

  return (
    <>
      <div className="mx-4 my-2">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Discover</span> channels
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <InputGroup className="max-w-sm">
            <InputGroupInput
              placeholder="Enter a theme..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={submitTheme}>Submit</Button>
        </div>

        {/* Section de themes proposes */}

        {isPending && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-4">
                <Skeleton className="aspect-video w-full rounded-2xl border border-border/50 bg-secondary shadow-none" />
                <div className="flex gap-4">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl bg-secondary" />
                  <div className="flex-1">
                    <Skeleton className="mb-3 h-4 w-3/4 bg-secondary" />
                    <Skeleton className="mb-4 h-3 w-1/2 bg-secondary" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16 rounded-lg bg-secondary" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards for channels found */}
        {data ? (
          data.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from(
                new Map(
                  data.map((channel: Channel) => [channel.channelId, channel])
                ).values()
              ).map((channel: Channel) => (
                <ChannelCard key={channel.channelId} channel={channel} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-muted-foreground">
              No channels found. Try a different theme?
            </p>
          )
        ) : null}
      </div>
    </>
  )
}
