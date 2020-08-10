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

const createModel = (initialJSONValues) => {
  let model = initialJSONValues

  const zones = {
    items: model.repeat ? fieldsToArray(model.repeat) : [],
    primary: model['non-repeat'] ? fieldsToArray(model['non-repeat']) : []
  }

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
    primary() {
      return zones.primary
    },
    items() {
      return zones.items
    },
    get: () => ({
      value: formatModel(model, zones.primary, zones.items),
      touched: false
    }),
  }
}

export default createModel