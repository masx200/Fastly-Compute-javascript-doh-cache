import { SecretStore } from "fastly:secret-store";

export async function getDOH_ENDPOINT(): Promise<
  string | null | undefined
> {
  const secrets = new SecretStore("Fastly-Compute-javascript-doh-cache");

  const catApiKey = await secrets.get("DOH_ENDPOINT");
  return catApiKey?.plaintext();
}
