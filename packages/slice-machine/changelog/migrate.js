const v041 = require('./versions/0.0.41')

// temporary
module.exports = async function migrate(ignorePrompt, params) {
  if (v041.test(params)) {
    await v041.main(ignorePrompt, params)
    console.info('Migration 0.0.41 done. Read the full changelog for more info!')
  }
}