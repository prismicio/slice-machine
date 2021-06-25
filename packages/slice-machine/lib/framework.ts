import path from 'path'

import Files from './utils/files'
import { Framework } from './models/common/Framework'
import { SupportedFrameworks } from './consts'

export function detectFramework(cwd: string): Framework {
  const pkgFilePath = path.resolve(cwd, 'package.json')
  if (!Files.exists(pkgFilePath)) {
    const message = '[api/env]: Unrecoverable error. Could not find package.json. Exiting..'
    console.error(message)
    throw new Error(message)
  }

  try {
    const pkg = JSON.parse(Files.readString(pkgFilePath))
    const { dependencies, devDependencies, peerDependencies } = pkg

    const deps = { ...peerDependencies, ...devDependencies, ...dependencies }

    const frameworkEntry = Object.entries(SupportedFrameworks).find(([, value]) => deps[value])

    return (frameworkEntry && frameworkEntry.length ? frameworkEntry[0] : Framework.vanillajs) as Framework
  } catch(e) {
    const message = '[api/env]: Unrecoverable error. Could not parse package.json. Exiting..'
    console.error(message)
    throw new Error(message)
  }
}