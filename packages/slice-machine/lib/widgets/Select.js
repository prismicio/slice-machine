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

const _createMock = (config) => config.options[Math.floor(Math.random() * config.options.length)]

const createMock = (maybeMock, config) => maybeMock || _createMock(config)

export default {
  createMock
}
