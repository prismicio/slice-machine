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

const hyphenateRE = /\B([A-Z])/g;
export function hyphenate(str: string): string {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

export function snakelize(str: string): string {
  return hyphenate(str).replace(/-/g, "_");
}
