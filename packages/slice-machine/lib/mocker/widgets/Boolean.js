/** {
    "type" : "Boolean",
    "config" : {
      "placeholder_false" : "false placeholder",
      "placeholder_true" : "true placeholder",
      "default_value" : true,
      "label" : "bool"
    }
  } */

const create = (maybeMock) => maybeMock || Math.random() < 0.50 ? true : false

export default {
  create
}