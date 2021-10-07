import Files from '../../utils/files'
import { JsonPackagePath, FileContent } from './paths'
import { SCRIPT_NAME, SCRIPT_VALUE } from '../../utils/const'
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

  Files.write(JsonPackagePath(cwd), updatedPkg)
  return true
}

export function addJsonPackageSmScript(
  cwd: string,
  scriptName = SCRIPT_NAME,
  scriptValue = SCRIPT_VALUE
): boolean {
  const pkg = retrieveJsonPackage(cwd)
  if (!pkg.exists || !pkg.content) return false

  const { scripts = {} } = pkg.content
  
  if (scripts[scriptName]) return false

  return patchJsonPackage(cwd, { scripts: { ...scripts, [scriptName]: scriptValue } })
}