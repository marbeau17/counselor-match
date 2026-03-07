"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

function Avatar({ className, src, alt, fallback, size = "md", ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  const initials = fallback || alt?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className={cn("relative inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-medium overflow-hidden", sizeClasses[size], className)} {...props}>
      {src && !imgError ? (
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export { Avatar }
export type { AvatarProps }
