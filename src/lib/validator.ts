export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates a Singapore license plate number
 * @param plate - The license plate number to validate (e.g. SBA1234G)
 * @returns ValidationResult containing validity status and message
 */
export const validateLicensePlate = (plate: string): ValidationResult => {
  plate = plate.replace(/\s/g, "").toUpperCase();

  // Basic validation
  if (!plate) {
    return {
      isValid: false,
      message: "License plate cannot be empty",
    };
  }

  if (plate.length < 5 || plate.length > 8) {
    return {
      isValid: false,
      message: "License plate must be 5-8 characters",
    };
  }

  // Check for valid characters
  if (!/^[A-Z0-9]+$/.test(plate)) {
    return {
      isValid: false,
      message: "Invalid characters. Use only letters and numbers",
    };
  }

  // Singapore format: 2-3 letters + 1-4 numbers + 1 check letter
  const sgPattern = /^[A-Z]{2,3}[0-9]{1,4}[A-Z]$/;

  if (!sgPattern.test(plate)) {
    return {
      isValid: false,
      message:
        "Invalid format. Expected: 2-3 letters + 1-4 numbers + 1 check letter (e.g. SBA1234G)",
    };
  }

  return {
    isValid: true,
    message: "Valid license plate format",
  };
};
