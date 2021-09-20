const fetch = require("node-fetch");
const semver = require("semver");

async function fetchJsonPackage(packageName) {
  const response = await fetch(`https://unpkg.com/${packageName}/package.json`);
  if (response.status !== 200) {
    throw new Error(
      `[scripts/bundle] Unable to fetch JSON package for packahe "${packageName}"`
    );
  }
  return await response.json();
}

async function versionIsValid() {
  const package = require("../package.json");
  const onlinePackage = await fetchJsonPackage(package.name);

  if (!package || !package.version) {
    consola.error(`Could not find version property in "package.json"`);
    throw new Error();
  }

  const lt = semver.lt(package.version, onlinePackage.version);
  if (lt) {
    console.log("----------------");
    consola.info(
      `[SliceMachine] Important! Your version of "${package.name}" is deprecated.`
    );
    consola.info(`Please update it using "npm i --save-dev ${package.name}"`);
    console.log("----------------");
    throw new Error();
  }
}

module.exports = {
  versionIsValid,
};
