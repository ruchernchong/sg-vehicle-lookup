import { letterToNumber } from "../utils/letterToNumber";
import { CHECKSUM_LETTERS, MULTIPLIERS } from "./constants";
import { RegistrationPlate } from "../types";

/**
 * Validates if a registration plate string matches the expected format
 *
 * @param plate - The registration plate to validate
 *
 * @returns boolean indicating if the plate is valid
 */
const isValidRegistrationPlate = (plate: string): boolean => {
  const pattern = /^[A-Z]{1,3}\s\d{1,4}$/;
  return pattern.test(plate.trim().toUpperCase());
};

/**
 * Calculates the checksum letter for a vehicle registration plate
 *
 * @param registrationPlate - The registration plate in format "ABC 1234", "AB 1234", or "A 1234"
 *
 * @returns The checksum letter based on the calculation algorithm
 * @throws {Error} If the registration plate format is invalid
 */
export const calculateChecksum = (
  registrationPlate: RegistrationPlate,
): string => {
  // Validate input format
  if (!isValidRegistrationPlate(registrationPlate)) {
    throw new Error(`Invalid registration plate format: ${registrationPlate}`);
  }

  // Split the registration plate into prefix and numbers
  const parts = registrationPlate.trim().toUpperCase().split(" ");
  const prefix = parts[0];
  const numbers = parts[1].padStart(4, "0");

  // Get the relevant prefix numbers based on prefix length
  const prefixNumbers: [number, number] = (() => {
    switch (prefix.length) {
      case 3:
        // Use last two letters
        return [letterToNumber(prefix[1]), letterToNumber(prefix[2])];
      case 2:
        // Use both letters
        return [letterToNumber(prefix[0]), letterToNumber(prefix[1])];
      case 1:
        // Single letter corresponds to second position, first position is 0
        return [0, letterToNumber(prefix[0])];
      default:
        throw new Error(`Invalid prefix length: ${prefix.length}`);
    }
  })();

  // Convert numbers to array of digits
  const numberArray: number[] = numbers.split("").map((n) => parseInt(n, 10));

  // Combine prefix numbers and digits
  const fullArray: number[] = [...prefixNumbers, ...numberArray];

  // Calculate sum of products
  const sum = fullArray.reduce((acc, curr, idx) => {
    if (idx >= MULTIPLIERS.length) return acc;
    return acc + curr * MULTIPLIERS[idx];
  }, 0);

  // Calculate remainder
  const remainder = sum % 19;

  // Get corresponding checksum letter
  return CHECKSUM_LETTERS[remainder];
};
