
export type EventCategory =
  | "Music"
  | "Tech"
  | "Art"
  | "Food"
  | "Wellness"
  | "Entertainment";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  price: number;
  date: string;
  location: string;
  imageUrl: string;
}


export const CATEGORIES: (EventCategory | "All")[] = [
  "All",
  "Music",
  "Tech",
  "Art",
  "Food",
  "Wellness",
  "Entertainment",
];


export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Music: "bg-pink-500/90",
  Tech: "bg-blue-500/90",
  Art: "bg-amber-500/90",
  Food: "bg-orange-500/90",
  Wellness: "bg-emerald-500/90",
  Entertainment: "bg-red-500/90",
};