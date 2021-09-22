import camelCase from "lodash/camelCase";

const camelizeRE = /-(\w)/g;
export function pascalize(str: string): string {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
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

export function createStorybookId(str: string): string {
  const camel = camelCase(str);
  return `_${camel[0].toUpperCase()}${camel.slice(1)}`;
}

export function camelCaseToDash(v: any): string {
  let ret = "",
    prevLowercase = false,
    prevIsNumber = false,
    isFirstChar = true;

  for (const s of v) {
    const isUppercase = s.toUpperCase() === s;
    const isNumber = !isNaN(s);

    if (isNumber && !prevIsNumber && !isFirstChar) {
      ret += "-";
    } else {
      if (isUppercase && !isNumber && (prevLowercase || prevIsNumber)) {
        ret += "-";
      }
    }
    ret += s;
    prevLowercase = !isUppercase;
    prevIsNumber = isNumber;
    isFirstChar = false;
  }
  return ret.replace(/-+/g, "-").toLowerCase();
}
