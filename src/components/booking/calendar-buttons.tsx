"use client"

import { Button } from "@/components/ui/button"
import { CalendarPlus, Download } from "lucide-react"
import { googleCalendarUrl } from "@/lib/calendar"

interface Props {
  bookingId: string
  title: string
  description?: string
  location?: string
  scheduledAt: string
  durationMinutes: number
}

export function CalendarButtons(props: Props) {
  const start = new Date(props.scheduledAt)
  const end = new Date(start.getTime() + props.durationMinutes * 60_000)
  const gcalHref = googleCalendarUrl({
    uid: props.bookingId,
    title: props.title,
    description: props.description,
    location: props.location,
    startUtc: start,
    endUtc: end,
  })
  const icsHref = `/api/bookings/${props.bookingId}/ics`

  return (
    <div className="inline-flex items-center gap-2">
      <a href={gcalHref} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline">
          <CalendarPlus className="h-4 w-4 mr-1" />
          Googleカレンダー
        </Button>
      </a>
      <a href={icsHref} download>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          .ics
        </Button>
      </a>
    </div>
  )
}
