// eslint-disable-next-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

function readJsonFile(path) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!fs.existsSync(path)) return null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
  return JSON.parse(fs.readFileSync(path));
}

function retrieveConfigFiles(cwd) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const smPath = path.join(cwd, "sm.json");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const smValue = readJsonFile(smPath);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    smConfig: { path: smPath, value: smValue },
  };
}

function smVersion(smModuleCWD) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
  const pkg = readJsonFileFiles(path.join(smModuleCWD, "package.json"));
  if (!pkg) throw new Error("Unable to find package.json file.");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return pkg.version.split("-")[0];
}

function writeSMVersion(smModuleCWD, smConfig) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  if (smConfig && smConfig.value && smConfig.value._latest) return; // if _latest already exists, we should not update this version otherwise we'd break the migration system

  try {
    fs.writeFileSync(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      smConfig.path,
      JSON.stringify(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        { ...smConfig.value, _latest: smVersion(smModuleCWD) },
        null,
        2
      )
    );
  } catch (e) {
    console.log("[postinstall] Could not write sm.json file. Exiting...");
  }
}

(function main() {
  const projectCWD = process.cwd();
  const smModuleCWD = require.main.paths[0].split("node_modules")[0];
  const { smConfig } = retrieveConfigFiles(projectCWD);

  if (smConfig.value) writeSMVersion(smModuleCWD, smConfig);
  else console.error("[postinstall] Missing file sm.json");

  return;
})();
