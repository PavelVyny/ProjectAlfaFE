import type { Event } from "../types/event";
import eventsJson from "./events.json";

export const events: Event[] = eventsJson as Event[];
