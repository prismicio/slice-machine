import { boolean } from "fp-ts";

const DEFAULT_BASE = "https://prismic.io";
const bases = [
  DEFAULT_BASE,
  "https://wroom.io",
  "https://wroom.test",
  "http://wroom.test",
];
export type Base = typeof bases[number] | string;

export function isFLQ(str: string): boolean {
  try {
    const url = new URL(str);
    const parts = url.hostname.split(".");
    if (parts.length !== 3) return false;
    const [, domain, tld] = parts;
    const correctDomain = domain === "prismic" || domain === "wroom";
    const correctTld = tld === "io" || tld === "test";
    const validDomain = `${domain}.${tld}` !== "prismic.test";
    return correctDomain && correctTld && validDomain;
  } catch {
    return false;
  }
}

export function defaultUrl(repo: string, base: Base = DEFAULT_BASE): Base {
  if (isFLQ(repo)) return repo;
  if (bases.includes(base)) return base;
  return DEFAULT_BASE;
}

export class ApiEndpoint extends URL {
  repo: string;
  pathname = "/api/v2";

  constructor(repo: string, base: Base = DEFAULT_BASE) {
    super(defaultUrl(repo, base));

    const wasFLQ = isFLQ(repo);

    if (wasFLQ) {
      this.repo = this.hostname.split(".")[0];
      this.pathname = "/api/v2";
    } else {
      this.repo = repo;
      this.hostname = `${this.repo}.${this.hostname}`;
    }
  }
}
