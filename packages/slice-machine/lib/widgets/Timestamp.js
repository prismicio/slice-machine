import * as yup from 'yup'
import { MdDateRange } from 'react-icons/md'

/** {
    "type" : "Timestamp",
    "config" : {
      "label" : "timestamp",
      "placeholder" : "timestamp"
    }
  } */


import { removeProp, createDefaultHandleMockContentFunction } from '../utils'
import { DefaultFields } from "../forms/defaults"
import { createInitialValues, createValidationSchema } from '../forms'

const TYPE_NAME = 'Timestamp'

const FormFields = DefaultFields

const randomDate = (start = new Date(2012, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const createMock = () => randomDate()

const handleMockContent = createDefaultHandleMockContentFunction({ createMock }, TYPE_NAME)

const create = (apiId) => ({
  ...createInitialValues(DefaultFields),
  id: apiId
})

const schema = yup.object().shape({
  type: yup.string().matches(/^Timestamp$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
});

const Meta = {
  icon: MdDateRange,
  title: 'Timestamp',
  description: 'A calendar date picker with time'
}

export default {
  createMock,
  handleMockContent,
  create,
  schema,
  FormFields,
  TYPE_NAME,
  Meta
}