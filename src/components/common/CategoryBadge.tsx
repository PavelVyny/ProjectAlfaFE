import type { EventCategory } from "@/types/event";
import { CATEGORY_COLORS } from "@/types/event";

interface CategoryBadgeProps {
  category: EventCategory;
}


export function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-white text-sm font-medium ${color}`}
    >
      {category}
    </span>
  );
}