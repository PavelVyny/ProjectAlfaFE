
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
