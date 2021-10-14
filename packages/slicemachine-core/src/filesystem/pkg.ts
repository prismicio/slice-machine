import { JsonPackagePath, FileContent } from './paths'
import { CONSTS, Files } from '../utils'
import { PackageJson } from 'types-package-json';

export type JsonPackage = PackageJson

export function retrieveJsonPackage(cwd: string): FileContent<PackageJson> {
  const pkgPath = JsonPackagePath(cwd)

  if (!Files.exists(pkgPath)) {
    return {
      exists: false,
      content: null
    }
  }

  const content: PackageJson | null = Files.safeReadJson(pkgPath) as PackageJson | null
  return {
    exists: true,
    content
  }
}

export function patchJsonPackage(cwd: string, data: Partial<PackageJson>): boolean {
  const pkg: FileContent<PackageJson> = retrieveJsonPackage(cwd)
  if (!pkg.exists || !pkg.content) return false

  const updatedPkg = {
    ...pkg.content,
    ...data
  }

  Files.write(JsonPackagePath(cwd), updatedPkg, { recursive: false })
  return true
}

export function addJsonPackageSmScript(
  cwd: string,
  scriptName = CONSTS.SCRIPT_NAME,
  scriptValue = CONSTS.SCRIPT_VALUE
): boolean {
  const pkg = retrieveJsonPackage(cwd)
  if (!pkg.exists || !pkg.content) return false

  const { scripts = {} } = pkg.content
  
  if (scripts[scriptName]) return false

  return patchJsonPackage(cwd, { scripts: { ...scripts, [scriptName]: scriptValue } })
}