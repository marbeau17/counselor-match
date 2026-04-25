import {
  Heart, Compass, Sparkles, BookHeart, Shield, ArrowRight,
  Search, UserCheck, CalendarCheck, NotebookPen, Star, MessageCircle,
  CheckCircle2, Zap, Award, TrendingUp, Users, Activity,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  Heart, Compass, Sparkles, BookHeart, Shield, ArrowRight,
  Search, UserCheck, CalendarCheck, NotebookPen, Star, MessageCircle,
  CheckCircle2, Zap, Award, TrendingUp, Users, Activity,
}

export function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon className={className} />
}

export const ICON_NAMES = Object.keys(ICONS)
