import { createHash } from "crypto";

const camelizeRE = /-(\w)/g;

export function pascalize(str: string): string {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
}

export function hash(str: string): string {
  return createHash("md5").update(str).digest("hex");
}
