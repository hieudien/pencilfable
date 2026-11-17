import {
  Apple, Backpack, Bath, BookOpen, Bike, Bus, Calculator, FlaskConical, Gamepad2, Globe, Library, Moon,
  Music, Palette, PencilLine, Sun, Users, Utensils, type LucideIcon,
} from 'lucide-react'

export interface Activity {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

/** Pictures kids recognise at a glance. Colors are explicit so printouts and PDFs keep them. */
export const ACTIVITIES: Activity[] = [
  { id: 'arrive', label: 'Good Morning', icon: Sun, color: '#f59e0b' },
  { id: 'circle', label: 'Circle Time', icon: Users, color: '#8b5cf6' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: '#2563eb' },
  { id: 'writing', label: 'Writing', icon: PencilLine, color: '#0891b2' },
  { id: 'math', label: 'Math', icon: Calculator, color: '#dc2626' },
  { id: 'science', label: 'Science', icon: FlaskConical, color: '#16a34a' },
  { id: 'social', label: 'Social Studies', icon: Globe, color: '#0d9488' },
  { id: 'art', label: 'Art', icon: Palette, color: '#db2777' },
  { id: 'music', label: 'Music', icon: Music, color: '#7c3aed' },
  { id: 'snack', label: 'Snack Time', icon: Apple, color: '#ea580c' },
  { id: 'lunch', label: 'Lunch', icon: Utensils, color: '#ca8a04' },
  { id: 'recess', label: 'Recess', icon: Bike, color: '#059669' },
  { id: 'play', label: 'Free Play', icon: Gamepad2, color: '#e11d48' },
  { id: 'library', label: 'Library', icon: Library, color: '#4f46e5' },
  { id: 'packup', label: 'Pack Up', icon: Backpack, color: '#b45309' },
  { id: 'home', label: 'Go Home', icon: Bus, color: '#ca8a04' },
  { id: 'bath', label: 'Bath Time', icon: Bath, color: '#0284c7' },
  { id: 'bed', label: 'Bedtime', icon: Moon, color: '#4338ca' },
]

export const byId = (id: string): Activity => ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0]

export interface Entry {
  id: string
  label: string
  time: string
}

export function moveEntry<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list.slice()
  const copy = list.slice()
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
