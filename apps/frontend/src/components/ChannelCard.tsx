import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Channel } from "@/types"

export const ChannelCard = ({ channel }: { channel: Channel }) => {
  return (
    <>
      <div>
        <div className="relative mb-1 aspect-video w-full overflow-hidden rounded-2xl border border-border/50 bg-secondary">
          <img
            src={channel?.thumbnailUrl}
            alt={channel?.nameChannel}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-1 text-[10px] font-black tracking-tighter text-white italic opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
            TOP CHOICE
          </div>
        </div>

        <div className="flex gap-4">
          <Avatar className="h-11 w-11 shrink-0 rounded-xl border border-border shadow-lg">
            <AvatarImage src={channel?.thumbnailUrl} />
            <AvatarFallback className="bg-secondary text-foreground">
              {channel?.nameChannel?.[0] || "C"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="group-hover:text-brand-red mb-1 line-clamp-1 text-sm leading-tight font-bold text-foreground transition-colors">
              {channel?.nameChannel}
            </h3>
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {channel?.subscriberCount.toString()}
            </p>
            <div className="mt-3 flex items-center justify-between">
              {/* <Badge variant="secondary" className="px-2.5 py-0.5 bg-secondary text-[10px] uppercase font-black rounded-lg border-none hover:bg-accent transition-colors">
              {channel.category}
            </Badge> */}
              <span className="text-[10px] font-black text-muted-foreground transition-colors group-hover:text-foreground">
                PREVIEW →
              </span>
            </div>
            {/* <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {channel.description}
          </p> */}
          </div>
        </div>
      </div>
    </>
  )
}
