export enum ENV {
  DEV = "dev",
  STAGING = "staging",
  PROD = "prod",
}

export const config = {
  api: {
    maxBatchSize: 100,
    version: "1.0.0",
  },
  checksum: {
    maxPrefixLength: 3,
    maxNumberLength: 4,
  },
} as const;
