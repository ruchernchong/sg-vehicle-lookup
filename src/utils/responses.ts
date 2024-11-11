import { ChecksumResponse, BatchChecksumResponse } from "../types";

export const formatChecksumResponse = (
  plate: string,
  checksum: string,
): ChecksumResponse => ({
  plate,
  checksum,
});

export const formatBatchResponse = (
  results: Array<{ plate: string; checksum?: string; error?: string }>,
): BatchChecksumResponse => ({
  results: results.map((result) => {
    if ("error" in result) {
      return {
        plate: result.plate,
        error: result.error,
      };
    }
    return {
      plate: result.plate,
      checksum: result.checksum!,
    };
  }),
});
