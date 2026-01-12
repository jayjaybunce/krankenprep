/**
 * Validates if a string is a valid share ID
 * Share IDs are base64url encoded strings of exactly 16 characters (12 bytes)
 * Valid characters: A-Z, a-z, 0-9, -, _
 */
export const isShareId = (str: string | undefined | null): boolean => {
  if (typeof str !== "string") return false;
  if (str.length !== 16) return false;

  // Base64url character set: A-Z, a-z, 0-9, -, _
  return /^[A-Za-z0-9_-]{16}$/.test(str);
};

/**
 * Validates if a string is a valid edit ID
 * Edit IDs follow the format: {shareId}{editToken}
 * - shareId: 16 characters (base64url)
 * - editToken: 32 characters (base64url)
 * - Total length: 48 chars
 */
export const isEditId = (str: string | undefined | null): boolean => {
  if (typeof str !== "string") return false;
  if (str.length !== 48) return false;

  // Entire editID is base64url chars; first 16 is shareId, last 32 is editToken
  if (!/^[A-Za-z0-9_-]{48}$/.test(str)) return false;

  const shareId = str.slice(0, 16);
  const editToken = str.slice(16);

  if (!isShareId(shareId)) return false;
  if (!/^[A-Za-z0-9_-]{32}$/.test(editToken)) return false;

  return true;
};

export const getIdFromPathname: (
  pathname: string,
) => { status: "share" | "edit" | null; id: string } = (pathname: string) => {
  const detectables = [
    "plan",
    "midnight",
    "manaforge",
    "undermine",
    "nerubarpalace",
  ];

  const parts = pathname.split("/").filter((s) => s !== "");
  const remaining: string[] = [];

  parts.forEach((part) => {
    if (!detectables.includes(part)) {
      remaining.push(part);
    }
  });

  // With the new scheme, the ID should just be a single path segment,
  // but joining is harmless if your router ever nests.
  const id = remaining.join("");

  return {
    status: isEditId(id) ? "edit" : isShareId(id) ? "share" : null,
    id,
  };
};