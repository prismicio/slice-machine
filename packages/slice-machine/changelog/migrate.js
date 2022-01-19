// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compareVersions = require("compare-versions");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { SMConfig, Pkg } = require("../build/lib/models/paths");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { default: Files } = require("../build/lib/utils/files");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MIGRATIONS = require("./versions");

// on postinstall of slicemachine UI, set the _latest the the current version if doesn't exist yet.

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const smPath = SMConfig(projectCWD);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const smValue = Files.exists(smPath) && Files.readJson(smPath);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const pkgPath = Pkg(smModuleCWD);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const pkgValue = Files.exists(pkgPath) && Files.readJson(pkgPath);
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    pkgSlicemachineUI: { path: pkgPath, value: pkgValue },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    smConfig: { path: smPath, value: smValue },
  };
}

function run(migrations, smConfig, ignorePrompt, params) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  if (!migrations || !migrations.length) {
    console.info(
      `All migrations were executed. You're ready to start working!`
    );
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const [head, tail] = [migrations[0], migrations.splice(1)];

  // run migration
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return head
    .main(ignorePrompt, params)
    .then(() => {
      console.info(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
        `Migration ${head.version} done. Read the full changelog for more info!`
      );
      // update last migration version
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      Files.write(smConfig.path, { ...smConfig.value, _latest: head.version });

      // call next migrations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return run(tail, smConfig, ignorePrompt, params);
    })
    .catch((e) => {
      console.error(e);
    });
}

// eslint-disable-next-line @typescript-eslint/require-await
module.exports = async function migrate(ignorePrompt, params) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const projectCWD = params.cwd;

  const { pkgSlicemachineUI, smConfig } = retrieveConfigFiles(
    projectCWD,
    path.join(__dirname, "..")
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const currentVersion = pkgSlicemachineUI.value.version.split("-")[0];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const latestMigrationVersion = smConfig.value._latest;

  const migrationsToRun = MIGRATIONS.filter((m) => {
    return compareVersions.compare(
      m.version,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      latestMigrationVersion || "0.0.41",
      ">"
    );
  });

  if (!migrationsToRun.length) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return run(migrationsToRun, smConfig, ignorePrompt, params);
};
