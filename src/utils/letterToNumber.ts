/**
 * Converts a single letter to its corresponding number (A=1, Z=26)
 *
 * @param letter - A single letter from A-Z (case insensitive)
 *
 * @returns A number from 1-26
 * @throws {Error} If input is not a single letter
 */
export const letterToNumber = (letter: string): number => {
  if (letter.length !== 1 || !/^[A-Za-z]$/.test(letter)) {
    throw new Error("Input must be a single letter");
  }

  return letter.toUpperCase().charCodeAt(0) - 64;
};
