import { parse } from "../auth/cookie";
import { AUTH_KEY } from "../defaults";

export function parsePrismicAuthToken(cookieString: string): string {
  const parsed = parse(cookieString);
  return parsed[AUTH_KEY] ? parsed[AUTH_KEY] : "";
}
