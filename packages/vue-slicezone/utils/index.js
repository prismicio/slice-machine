const camelizeRE = /-(\w)/g;
export const pascalize = (str) => {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
};
