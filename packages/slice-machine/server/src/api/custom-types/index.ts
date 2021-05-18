import path from 'path'
import glob from 'glob'
import Environment from '../../../../lib/models/common/Environment'
import { CustomType } from '../../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../../lib/models/common/CustomType/tab'
import Files from '../../../../lib/utils/files'
import { CustomTypesPaths } from '../../../../lib/models/paths'

const handlePath = (acc: Array<CustomType<TabsAsObject>>, p: string) => {
  const key = path.basename(path.dirname(p))
  try {
    const { json, ...rest } = Files.readJson(p)
    return [
      ...acc,
      {
        ...rest,
        id: key,
        tabs: json
      } as CustomType<TabsAsObject>
    ]
  } catch (e) {
    return acc
  }
}

const fetchRemoteCustomTypes = async (env: Environment) => {
  if (env.client.isFake()) {
    return { remoteCustomTypes: [] }
  }
  const res = await env.client.getCustomTypes()
  const { remoteCustomTypes } = await (async () => {
    if (res.status > 209) {
      return { remoteCustomTypes: [] }
    }
    const r = await (res.json ? res.json() : Promise.resolve([]))
    return { remoteCustomTypes: r }
  })()
  return { remoteCustomTypes }
}

const saveCustomTypes = (cts: ReadonlyArray<any>, cwd: string) => {
  for (const ct of cts) {
    Files.write(
      CustomTypesPaths(cwd).customType(ct.id).model(),
      ct
    )
  }
}

export default async function handler(env: Environment): Promise<{ customTypes: ReadonlyArray<CustomType<TabsAsObject>>, remoteCustomTypes: ReadonlyArray<CustomType<TabsAsObject>> }> {
  const { cwd, mockConfig } = env
  const pathToCustomTypes = CustomTypesPaths(cwd).value()
  const folderExists = Files.exists(pathToCustomTypes)

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env)
  if (!folderExists) {
    saveCustomTypes(remoteCustomTypes, cwd)
  }
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`)
  return {
    customTypes: matches.reduce(handlePath, []),
    remoteCustomTypes: remoteCustomTypes.map((ct: any) => {
      const { json, ...rest } = ct
      return {
        ...rest,
        tabs: json
      } 
    })
  }
}