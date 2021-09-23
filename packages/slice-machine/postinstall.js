const fs = require("fs");
const path = require("path");

function readJsonFile(path) {
  if (!fs.existsSync(path)) return null;
  return JSON.parse(fs.readFileSync(path));
}

function retrieveConfigFiles(cwd) {
  const smPath = path.join(cwd, "sm.json");
  const smValue = readJsonFile(smPath);

  const pkgPath = path.join(cwd, "package.json");
  const pkgValue = readJsonFile(pkgPath);
  return {
    pkg: { path: pkgPath, value: pkgValue },
    smConfig: { path: smPath, value: smValue },
  };
}

function smVersion(smModuleCWD) {
  const pkg = readJsonFileFiles(path.join(smModuleCWD, "package.json"));
  if (!pkg) throw new Error("Unable to find package.json file.");
  return pkg.version.split("-")[0];
}

function writeSMVersion(smModuleCWD, smConfig) {
  if (smConfig && smConfig.value && smConfig.value._latest) return; // if _latest already exists, we should not update this version otherwise we'd break the migration system

  try {
    fs.writeFileSync(
      smConfig.path,
      JSON.stringify(
        { ...smConfig.value, _latest: smVersion(smModuleCWD) },
        null,
        2
      )
    );
  } catch (e) {
    console.log("[postinstall] Could not write sm.json file. Exiting...");
  }
}

function installSMScript(pkg) {
  if (!pkg.value.scripts) {
    pkg.value.scripts = {};
  }
  if (!pkg.value.scripts.slicemachine) {
    pkg.value.scripts.slicemachine = "start-slicemachine --port 9999";
    fs.writeFileSync(pkg.path, JSON.stringify(pkg.value, null, 2));
    console.log('Added script "slicemachine" to package.json');
  }
}

(function main() {
  const projectCWD = process.cwd();
  const smModuleCWD = require.main.paths[0].split("node_modules")[0];
  const { pkg, smConfig } = retrieveConfigFiles(projectCWD);

  if (pkg.value) installSMScript(pkg);
  else return console.error("[postinstall] Missing file package.json");

  if (smConfig.value) writeSMVersion(smModuleCWD, smConfig);
  else console.error("[postinstall] Missing file sm.json");

  return;
})();
