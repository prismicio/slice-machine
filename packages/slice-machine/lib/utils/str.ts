const camelizeRE = /-(\w)/g;

export function transformKeyAccessor(str: string): string {
  if (str.includes("-")) {
    return `['${str}']`;
  }
  return `.${str}`;
}

export function pascalize(str: string): string {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c: string) => {
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

export const slugify = (input: string) => {
  const nowhitespace = input.trim().replace(/ /g, "_");
  const normalised = nowhitespace
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalised.toLowerCase();
};
