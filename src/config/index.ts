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
