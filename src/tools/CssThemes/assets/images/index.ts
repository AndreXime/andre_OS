import placeholder1 from "./placeholder-1.jpg";
import placeholder2 from "./placeholder-2.jpg";
import placeholder3 from "./placeholder-3.jpg";

export const placeholderImages = [placeholder1, placeholder2, placeholder3] as const;

export type PlaceholderId = 1 | 2 | 3;

export function getPlaceholderImage(id: PlaceholderId = 1) {
  const image = placeholderImages[id - 1];
  if (!image) {
    throw new Error(`Placeholder image ${id} is missing`);
  }
  return image;
}

export function placeholderForIndex(index: number): PlaceholderId {
  return ((index % placeholderImages.length) + 1) as PlaceholderId;
}

export { placeholder1, placeholder2, placeholder3 };
