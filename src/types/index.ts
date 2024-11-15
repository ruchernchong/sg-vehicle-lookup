export type RegistrationPlate = string;

export type ChecksumLetter = string;
export type ChecksumLetters = readonly ChecksumLetter[];
export type Multiplier = number;
export type Multipliers = readonly Multiplier[];

export interface PlateDetail {
  [key: string]: string;
}

export interface PlateCategory {
  prefixes: string[];
  description: string;
  details?: PlateDetail;
}

export interface PlatesConfig {
  specialPlates: {
    [key: string]: PlateCategory;
  };
}

export interface SpecialPlate {
  plate: string;
  description: string;
  category: string;
  categoryDescription: string;
}

export type SpecialPlatesMap = {
  [key: string]: SpecialPlate;
};
