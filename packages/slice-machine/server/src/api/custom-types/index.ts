import path from 'path'
import glob from 'glob'
import Environment from '../../../../lib/models/common/Environment'
import { CustomType } from '../../../../lib/models/common/CustomType'
import { TabsAsObject } from '../../../../lib/models/common/CustomType/tab'
import Files from '../../../../lib/utils/files'
// import { acceptedImagesTypes } from '../../../../lib/consts'
import { CustomTypesPaths } from '../../../../lib/models/paths'

const handleMatch = (matches: string[], env: Environment) => {
  return matches.reduce((acc: Array<CustomType<TabsAsObject>>, p: string) => {
    const key = path.basename(path.dirname(p))
    const pathTopreview = path.join(path.dirname(p), 'index.png')
    try {
      const { json, ...rest } = Files.readJson(p)
      return [
        ...acc,
        {
          ...rest,
          id: key,
          tabs: json,
          previewUrl: Files.exists(pathTopreview)
            ? `${env.baseUrl}/api/__preview?q=${encodeURIComponent(path.join(path.dirname(p), 'index.png'))}&uniq=${Math.random()}`
            : null
        } as CustomType<TabsAsObject>
      ]
    } catch (e) {
      return acc
    }
  }, [])
}

// `${baseUrl}/api/__preview?q=${encodeURIComponent(activeScreenshot.path)}&uniq=${Math.random()}`

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
  const { cwd } = env
  const pathToCustomTypes = CustomTypesPaths(cwd).value()
  const folderExists = Files.exists(pathToCustomTypes)

  const { remoteCustomTypes } = await fetchRemoteCustomTypes(env)
  if (!folderExists) {
    saveCustomTypes(remoteCustomTypes, cwd)
  }
  const matches = glob.sync(`${pathToCustomTypes}/**/index.json`)
  return {
    customTypes: handleMatch(matches, env),
    remoteCustomTypes: remoteCustomTypes.map((ct: any) => {
      const { json, ...rest } = ct
      return {
        ...rest,
        tabs: json
      } 
    })
  }
}