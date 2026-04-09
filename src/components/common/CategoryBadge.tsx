import type { EventCategory } from "@/types/event";
import { CATEGORY_COLORS } from "@/types/event";

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

function normalizeCategory(raw: string): EventCategory {
  const titleCase = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return titleCase as EventCategory;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const normalized = normalizeCategory(category);
  const color = CATEGORY_COLORS[normalized] ?? "bg-zinc-500/90";

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-md text-white text-sm font-medium ${color} ${className}`}
    >
      {normalized}
    </span>
  );
}