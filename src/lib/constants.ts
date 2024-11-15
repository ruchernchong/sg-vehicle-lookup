import { ChecksumLetters, Multipliers } from "@/types";

// Valid checksum letters in order (remainder 0-18)
export const CHECKSUM_LETTERS: ChecksumLetters = [
  "A",
  "Z",
  "Y",
  "X",
  "U",
  "T",
  "S",
  "R",
  "P",
  "M",
  "L",
  "K",
  "J",
  "H",
  "G",
  "E",
  "D",
  "C",
  "B",
] as const;

export const MULTIPLIERS: Multipliers = [9, 4, 5, 4, 3, 2] as const;
