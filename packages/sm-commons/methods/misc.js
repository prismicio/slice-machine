const fs = require('fs');
const path = require('path');

function getDirectories(p) {
  return fs.readdirSync(p)
    .map(name => path.join(p, name))
    .filter(e => fs.lstatSync(e).isDirectory())
}

function readFile(p) {
  try {
    const f = fs.readFileSync(p, 'utf8')
    return f
  } catch(e) {
    throw new Error(`[reason] Unable to read file at path "${p}"`)
  }
}

const camelizeRE = /-(\w)/g;
function pascalize(str) {
  if (!str) {
    return "";
  }
  str = str.replace(/_/g, "-").replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
  return str[0].toUpperCase() + str.slice(1);
};

const hyphenateRE = /\B([A-Z])/g;
function hyphenate(str, kebab) {
  const s =  str.replace(hyphenateRE, "-$1").toLowerCase();
  return kebab ? s.replace(/-/g, "_") : s
}

module.exports = {
  readFile,
  pascalize,
  hyphenate,
  getDirectories
}