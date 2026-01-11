import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RoadmapItem } from "@/data/mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if all roadmap items are completed
 * @param roadmapItems - Array of roadmap items to check
 * @returns true if all items are completed, false otherwise
 */
export function isRoadmapCompleted(roadmapItems: RoadmapItem[]): boolean {
  // Handle edge cases: empty arrays and undefined data
  if (!roadmapItems || roadmapItems.length === 0) {
    return false;
  }
  
  // Check if all items have completed property set to true
  return roadmapItems.every(item => item && item.completed === true);
}
