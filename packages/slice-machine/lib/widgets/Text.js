import { MdTitle } from 'react-icons/md'
import * as yup from 'yup'

/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */


import { removeProp, createDefaultHandleMockContentFunction } from '../utils'
import { DefaultFields } from "../forms/defaults"
import { createInitialValues, createValidationSchema } from "../forms"

const TYPE_NAME = 'Text'

const FormFields = DefaultFields

const createMock = ({ label, placeholder }) => `A text of type "${label}" that conveys ${placeholder}`

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

const create = (apiId) => ({
  ...createInitialValues(DefaultFields),
  id: apiId
})

const schema = yup.object().shape({
  type: yup.string().matches(/^Text$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
});

const Meta = {
  icon: MdTitle,
  title: 'Key Text',
  description: 'Text content'
}

export default {
  create,
  createMock,
  handleMockContent,
  Meta,
  schema,
  TYPE_NAME,
  FormFields
}
