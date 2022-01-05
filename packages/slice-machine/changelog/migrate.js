const path = require("path");
const compareVersions = require("compare-versions");
const { Pkg } = require("../build/lib/models/paths");
const { default: Files } = require("../build/lib/utils/files");
const MIGRATIONS = require("./versions");

const { SMConfigPath } = require("@slicemachine/core/build/src/fs-utils/paths");

(function validateMigrations() {
  MIGRATIONS.forEach((m) => {
    if (!m.version)
      throw new Error(
        `Each migration should contain a field "version" corresponding to the SM UI package version at the time of the migration.`
      );
    if (!m.main)
      throw new Error(
        `The migration ${m.version} doesn't have a main function, we cannot run this migration properly.`
      );
  });
})();

function retrieveConfigFiles(projectCWD, smModuleCWD) {
  const smPath = SMConfigPath(projectCWD);
  const smValue = Files.exists(smPath) && Files.readJson(smPath);

  const pkgPath = Pkg(smModuleCWD);
  const pkgValue = Files.exists(pkgPath) && Files.readJson(pkgPath);
  return {
    pkgSlicemachineUI: { path: pkgPath, value: pkgValue },
    smConfig: { path: smPath, value: smValue },
  };
}

function run(migrations, smConfig, ignorePrompt, params) {
  if (!migrations || !migrations.length) {
    console.info(
      `All migrations were executed. You're ready to start working!`
    );
    return;
  }

  const [head, tail] = [migrations[0], migrations.splice(1)];

  // run migration
  return head
    .main(ignorePrompt, params)
    .then(() => {
      console.info(
        `Migration ${head.version} done. Read the full changelog for more info!`
      );
      // update last migration version
      Files.write(smConfig.path, { ...smConfig.value, _latest: head.version });

      // call next migrations
      return run(tail, smConfig, ignorePrompt, params);
    })
    .catch((e) => {
      console.error(e);
    });
}

module.exports = async function migrate(ignorePrompt, params) {
  const projectCWD = params.cwd;

  const { pkgSlicemachineUI, smConfig } = retrieveConfigFiles(
    projectCWD,
    path.join(__dirname, "..")
  );

  const currentVersion = pkgSlicemachineUI.value.version.split("-")[0];
  const latestMigrationVersion = smConfig.value._latest;

  const migrationsToRun = MIGRATIONS.filter((m) => {
    return compareVersions.compare(
      m.version,
      latestMigrationVersion || "0.0.41",
      ">"
    );
  });

  if (!migrationsToRun.length) return;

  return run(migrationsToRun, smConfig, ignorePrompt, params);
};
