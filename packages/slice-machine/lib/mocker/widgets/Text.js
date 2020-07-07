/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */

const create = (maybeMock, { label, placeholder }) =>
  maybeMock || `A text of type "${label}" that conveys ${placeholder}`

export default {
  create
}
