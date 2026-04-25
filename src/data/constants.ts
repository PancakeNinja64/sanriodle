// Centralized enum-like values for comparable fields.
// Keep these lowercase to match game comparison logic.

export const GENDER_VALUES = ["female", "male", "unknown", "mixed"] as const;
export type CharacterGender = (typeof GENDER_VALUES)[number];

export const SPECIES_VALUES = [
  "cat",
  "rabbit",
  "puppy",
  "dog",
  "frog",
  "penguin",
  "egg",
  "star-child",
  "fish",
  "seal",
  "hamster",
  "human",
  "red-panda",
  "bear",
  "sheep",
  "blob",
  "dinosaur",
  "tapir",
  "bee",
  "fox",
] as const;
export type CharacterSpecies = (typeof SPECIES_VALUES)[number];

export const COLOR_VALUES = [
  "pink",
  "blue",
  "yellow",
  "green",
  "black",
  "white",
  "lavender",
  "peach",
  "orange",
  "red",
  "brown",
  "mint",
  "purple",
] as const;
export type CharacterColor = (typeof COLOR_VALUES)[number];

export const FRANCHISE_GROUP_VALUES = [
  "sanrio",
  "little-forest-fellow",
  "onegai-my-melody",
  "cafe-cinnamon",
  "donut-pond",
  "hapidanbui",
  "little-twin-stars",
  "jewelpet",
  "sugarbunnies",
  "wish-me-mell",
  "marumofubiyori",
  "aggretsuko",
  "usahana",
] as const;
export type CharacterFranchiseGroup = (typeof FRANCHISE_GROUP_VALUES)[number];
