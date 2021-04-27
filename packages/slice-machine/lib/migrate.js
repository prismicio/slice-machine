import fs from 'fs'
import path from 'path'
import { snakelize } from 'sm-commons/utils/str'
import uniqid from 'uniqid'

const migrate = (model, info, env) => {
  const { type, fieldset, 'non-repeat': nonRepeat = {}, repeat = {} } = model
  if (type !== 'Slice') {
    return { model, migrated: false }
  }
  const newModel = {
    id: snakelize(info.sliceName),
    type: 'SharedSlice',
    name: info.sliceName,
    description: fieldset,
    variations: [{
      id: 'default-slice',
      name: 'Default slice',
      docURL: '...',
      version: uniqid(),
      description: fieldset,
      primary: nonRepeat,
      items: repeat
    }]
  }

  const rootPath = path.join(env.cwd, info.from, info.sliceName)
  const modelPath = path.join(rootPath, 'model.json')

  fs.writeFileSync(modelPath, JSON.stringify(newModel, null, 2), 'utf-8')

  return { model: newModel, migrated: true }
}

export default migrate
