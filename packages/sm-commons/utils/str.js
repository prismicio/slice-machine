const camelizeRE = /-(\w)/g;
function pascalize(str) {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
}

const hyphenateRE = /\B([A-Z])/g;
function hyphenate(str) {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

function snakelize(str) {
  return hyphenate(str).replace(/-/g, '_');
}

module.exports = {
  pascalize,
  hyphenate,
  snakelize
};
