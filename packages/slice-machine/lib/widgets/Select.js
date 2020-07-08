/**
 * {
      "type" : "Select",
      "config" : {
        "label" : "Image side",
        "default_value" : "left",
        "options" : [ "left", "right" ]
      }
    }
*/

const _create = (config) => config.options[Math.floor(Math.random() * config.options.length)]

const create = (maybeMock, config) => maybeMock || _create(config)

export default {
  create
}
