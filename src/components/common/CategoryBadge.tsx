import type { EventCategory } from "@/types/event";
import { CATEGORY_COLORS } from "@/types/event";

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-md text-white text-sm font-medium ${color} ${className}`}
    >
      {category}
    </span>
  );
}