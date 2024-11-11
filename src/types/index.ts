export type RegistrationPlate = string;

export type ChecksumLetter = string;
export type ChecksumLetters = readonly ChecksumLetter[];
export type Multiplier = number;
export type Multipliers = readonly Multiplier[];

export interface ChecksumResponse {
  plate: string;
  checksum: string;
}

export interface BatchChecksumResponse {
  results: Array<
    { plate: string; checksum: string } | { plate: string; error: string }
  >;
}
