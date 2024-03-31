export function base64Encode(byteArray: ArrayBuffer): string {
  const buffer = new Uint8Array(byteArray);
  const binaryString = buffer.reduce(
    (str, byte) => str + String.fromCharCode(byte),
    "",
  );
  const encoded = btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return encoded;
}
