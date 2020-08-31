import equal from 'fast-deep-equal'

const fieldsToArray = (fields) =>
  Object.entries(fields)
  .reduce((acc, [key, value]) => ([
    ...acc,
    {
      key,
      value
    }
  ]), [])

const arrayToFields = (arr) => arr.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

const formatModel = (model, primary, items) => ({
  ...model,
  'non-repeat': arrayToFields(primary),
  repeat: arrayToFields(items),
})

const createZones = (model) => ({
  items: model.repeat ? fieldsToArray(model.repeat) : [],
  primary: model['non-repeat'] ? fieldsToArray(model['non-repeat']) : []
})

const deepEqual = (model, primary, items) => {
  const modelZones = createZones(model)
  if (primary.find((e, i) => !equal(modelZones.primary[i], e))
    || items.find((e, i) => !equal(modelZones.items[i], e))) {
    return false
  }
  return true
}

const getMetadata = (model) =>
  Object.entries(model).reduce((acc, [key, value]) => ({
    ...acc,
    ...(['fieldset', 'description'].includes(key) ? ({ [key]: value }) : {})
  }), {})

const createModel = (intialValues, info) => {
  let model = intialValues
  let zones = createZones(model)

  const _reorder = (zone) => (start, end) => {
    const result = Array.from(zones[zone])
    const [removed] = result.splice(start, 1);
    result.splice(end, 0, removed);
    zones[zone] = result
    return zones[zone]
  }

  const _replace = (zone) => (key, newKey, value) => {
    const i = zones[zone].findIndex(e => e.key === key)
    if (i !== -1) {
      zones[zone][i] = {
        key: newKey,
        value
      }
      return zones[zone][i]
    }
    return null
  }

  const _delete = (zone) => (key) => {
    const i = zones[zone].findIndex(e => e.key === key)
    if (i !== -1) {
      zones[zone].splice(i, 1)
    }
    return zones[zone]
  }

  const _add = (zone) => (key, value) => {
    const newItem = { key, value }
    zones[zone].push(newItem)
    return newItem
  }

  return {
    resetInitialModel: (newInitialValues) => {
      model = newInitialValues
      zones = createZones(newInitialValues)
    },
    replace: {
      primary: _replace('primary'),
      items: _replace('items'),
    },
    delete: {
      primary: _delete('primary'),
      items: _delete('items'),
    },
    add: {
      primary: _add('primary'),
      items: _add('items'),
    },
    reorder: {
      primary: _reorder('primary'),
      items: _reorder('items'),
    },
    get: () => {
      return {
        ...zones,
        info,
        meta: getMetadata(model),
        value: formatModel(model, zones.primary, zones.items),
        isTouched: !deepEqual(model, zones.primary, zones.items),
      }
    },
  }
}

export default createModel