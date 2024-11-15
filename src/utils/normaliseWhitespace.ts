/**
 * Standardises whitespace in text by:
 * - Converting all tabs and newlines to single spaces
 * - Collapsing multiple spaces to single spaces
 * - Trimming leading/trailing whitespace
 *
 * @param text - The text to normalise
 * @returns The text with standardised whitespace
 */
export const normaliseWhitespace = (text: string): string =>
  text
    .replace(/[\t\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
