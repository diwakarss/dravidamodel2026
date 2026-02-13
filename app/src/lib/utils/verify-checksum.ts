export async function verifyChecksum(
  dataUrl: string,
  expectedChecksum: string
): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const data = await response.arrayBuffer();

    // Use Web Crypto API
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex === expectedChecksum;
  } catch (err) {
    console.error("Checksum verification failed:", err);
    return false;
  }
}
