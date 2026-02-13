export interface ChecksumResult {
  valid: boolean;
  error?: string;
  actualChecksum?: string;
}

export async function verifyChecksum(
  dataUrl: string,
  expectedChecksum: string
): Promise<ChecksumResult> {
  try {
    const response = await fetch(dataUrl);

    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const valid = hashHex === expectedChecksum;
    return {
      valid,
      actualChecksum: hashHex,
      error: valid
        ? undefined
        : `Checksum mismatch: expected ${expectedChecksum.slice(0, 12)}..., got ${hashHex.slice(0, 12)}...`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Checksum verification failed:", err);
    return { valid: false, error: errorMsg };
  }
}
