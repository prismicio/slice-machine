const fs = require('fs')
const path = require('path')
const { SMConfig, Pkg } = require('./build/lib/models/paths')
const { default: Files } = require('./build/lib/utils/files')

function retrieveConfigFiles() {
  const cwd = require.main.paths[0].split('node_modules')[0]

  const smPath = SMConfig(cwd)
  const smValue = Files.exists(smPath) && Files.readJson(smPath)
  
  const pkgPath = Pkg(cwd)
  const pkgValue = Files.exists(pkgPath) && Files.readJson(pkgPath)
  return {
    pkg: { path: pkgPath, value: pkgValue },
    smConfig: { path: smPath, value: smValue }
  }
}

function smVersion() {
  const { version } = Files.readJson(path.join(__dirname, 'package.json'))
  return version.split('-')[0]
}

function writeSMVersion(smConfig) {
  if(smConfig.value._latest) return // if _latest already exists, we should not update this version otherwise we'd break the migration system

  try {
    Files.write(smConfig.path, { ...smConfig.value, _latest: smVersion() })
  } catch(e) {
    console.log('[postinstall] Could not write sm.json file. Exiting...')
  }
}

function installSMScript(pkg) {
  if (!pkg.value.scripts) {
    pkg.value.scripts = {};
  }
  if (!pkg.value.scripts.slicemachine) {
    pkg.value.scripts.slicemachine = "start-slicemachine --port 9999"
    Files.write(pkg.path, pkg.value)
    console.log('Added script "slicemachine" to package.json')
  }
}

(function main() {
  const { pkg, smConfig } = retrieveConfigFiles()
  if (pkg && smConfig) {
    installSMScript(pkg)
    writeSMVersion(smConfig)
    return
  }
  if(!pkg) console.error('Missing file package.json')
  if(!smConfig) console.error('Missing file sm.json')
})()
