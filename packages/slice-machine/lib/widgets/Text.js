/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */

import { DefaultFields } from "../forms/defaults"
import { createInitialValues } from "../forms"

const createMock = (maybeMock, { label, placeholder }) =>
  maybeMock || `A text of type "${label}" that conveys ${placeholder}`

const create = (apiId) => ({
  ...createInitialValues(DefaultFields),
  id: apiId
})

const Meta = {
  title: 'Key Text',
  description: 'Text content'
}

export default {
  create,
  createMock,
  Meta
}
