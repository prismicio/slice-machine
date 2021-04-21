const compareVersions = require('compare-versions');
const { SMConfig, Pkg } = require('../build/lib/models/paths');
const { default: Files } = require('../build/lib/utils/files');
const MIGRATIONS = require('./versions');

// on postinstall of slicemachine UI, set the _latest the the current version if doesn't exist yet.

(function validateMigrations() {
  MIGRATIONS.forEach(m => {
    if(!m.version) throw new Error(`Each migration should contain a field "version" corresponding to the SM UI package version at the time of the migration.`)
    if(!m.main) throw new Error(`The migration ${m.version} doesn't have a main function, we cannot run this migration properly.`)
  })
})()

function retrieveConfigFiles() {
  const cwd = require.main.paths[0].split('node_modules')[0]

  const smPath = SMConfig(cwd)
  const smValue = Files.exists(smPath) && Files.readJson(smPath)
  
  const pkgPath = Pkg(__dirname)
  const pkgValue = Files.exists(pkgPath) && Files.readJson(pkgPath)
  return {
    pkgSlicemachineUI: { path: pkgPath, value: pkgValue },
    smConfig: { path: smPath, value: smValue }
  }
}

function run(migrations, smConfig, ignorePrompt, params) {
  if(!migrations || !migrations.length) {
    console.info(`All migrations were executed. You're ready to start working!`)
    return
  }

  const [head, tail] = [migrations[0], migrations.splice(1)]

  // run migration
  return head.main(ignorePrompt, params)
    .then(() => {
      console.info(`Migration ${head.version} done. Read the full changelog for more info!`)
      // update last migration version
      Files.write(smConfig.path, { ...smConfig.value, _latest: head.version })
    
      // call next migrations
      return run(tail, smConfig, ignorePrompt, params)
    })

} 

module.exports = async function migrate(ignorePrompt, params) {
  const { pkgSlicemachineUI, smConfig } = retrieveConfigFiles()
  const currentVersion = pkgSlicemachineUI.value.version.split('-')[0]
  const latestMigrationVersion = smConfig.value._latest

  const migrationsToRun = MIGRATIONS.filter(m => {
    return compareVersions.compare(m.version, latestMigrationVersion, '>')
  })

  if(!migrationsToRun.length) return;

  return run(migrationsToRun, smConfig, ignorePrompt, params)
}
