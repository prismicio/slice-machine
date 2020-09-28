import { snakelize } from 'sm-commons/utils/str'
import uniqid from 'uniqid'

const migrate = (model, info) => {
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
  return { model: newModel, migrated: true }
}

export default migrate
