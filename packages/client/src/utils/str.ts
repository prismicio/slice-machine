const hyphenateRE = /\B([A-Z])/g;
export function hyphenate(str: string): string {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

export function snakelize(str: string): string {
  return hyphenate(str).replace(/-/g, "_");
}

export function addTrailingSlash(endpoint: string): string {
  return endpoint.replace(/\/?$/, "/");
}
