const createModel = (initialJSONValues) => {
  let model = initialJSONValues

  const set = {
    primary(key, value) {
      model['non-repeat'][key] = value
    },
    items(key, value) {
      model['repeat'][key] = value
    },
  }
  return {
    getOrCreate(field) {
      if (!model[field]) {
        model[field] = {}
      }
      return model[field]
    },

    delete: {
      at: {
        primary(key) {
          delete model['non-repeat'][key]
        },
        items(key) {
          delete model['repeat'][key]
        }
      }
    },
    append: {
      to: {
        primary(type, key, config, log = true) {
          if (log) {
            console.log('append to primary: ', { newValue: config, key })
          }
          set.primary(key, { type, config })
        },
        items(type, key, config, log = false) {
          if (log) {
            console.log('append to items: ', { newValue: config, key })
          }
          set.items(key, { type, config })
        }
      }
    },
    primary() {
      return this.getOrCreate('non-repeat')
    },
    items() {
      return this.getOrCreate('repeat')
    },
    toJson: () => JSON.stringify(model),
    get: () => model,
    value: model
  }
}

export default createModel