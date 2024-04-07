import { SecretStore } from "fastly:secret-store";

export async function getDOH_ENDPOINT(): Promise<
  string | null | undefined
> {
  try {
    const secrets = new SecretStore("Fastly-Compute-javascript-doh-cache");

    const catApiKey = await secrets.get("DOH_ENDPOINT");
    return catApiKey?.plaintext();
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function getDOH_PATHNAME(): Promise<
  string | null | undefined
> {
  try {
    const secrets = new SecretStore("Fastly-Compute-javascript-doh-cache");

    const catApiKey = await secrets.get("DOH_PATHNAME");
    return catApiKey?.plaintext();
  } catch (error) {
    console.error(error);
    return null;
  }
}
