const fs = require("fs");
const path = require("path");

function getDirectories(p) {
  return fs
    .readdirSync(p)
    .map(name => path.join(p, name))
    .filter(e => fs.lstatSync(e).isDirectory());
}

function readFile(p) {
  try {
    const f = fs.readFileSync(p, "utf8");
    return f;
  } catch (e) {
    throw new Error(`[reason] Unable to read file at path "${p}"`);
  }
}

module.exports = {
    getDirectories,
    readFile
}