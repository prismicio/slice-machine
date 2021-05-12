import path from 'path'

import { Framework } from './models/common/Framework'
import { SupportedFrameworks } from './consts'

export function detectFramework(cwd: string): Framework {
  const pkgFilePath = path.resolve(cwd, 'package.json')
  const { dependencies, devDependencies, peerDependencies } = require(pkgFilePath)

  const deps = { ...peerDependencies, ...devDependencies, ...dependencies }

  const frameworkEntry = Object.entries(SupportedFrameworks).find(([, value]) => deps[value])

  return (frameworkEntry && frameworkEntry.length ? frameworkEntry[0] : Framework.vanillajs) as Framework
}