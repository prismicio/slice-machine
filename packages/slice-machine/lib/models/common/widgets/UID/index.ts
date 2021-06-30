import * as yup from 'yup'
import { MdVpnKey } from 'react-icons/md'
// import { MockConfigForm } from './Mock/Form'
// import { handleMockConfig, handleMockContent } from './Mock'

/**
* {
      "type": "UID",
      "config": {
        "label": "UID",
        "placeholder": "unique-identifier-eg-homepage"
      }
    }
 */


import { removeProp } from '../../../../utils'
import { DefaultFields } from "../../../../forms/defaults"
import { createInitialValues, createValidationSchema } from "../../../../forms"

const TYPE_NAME = 'UID'

const FormFields = DefaultFields

const create = () => createInitialValues(FormFields)

const schema = yup.object().shape({
  type: yup.string().matches(/^UID$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
});

const Meta = {
  icon: MdVpnKey,
  title: 'UID',
  description: 'Unique Identifier'
}

export const UID = {
  create,
  // MockConfigForm,
  // handleMockConfig,
  // handleMockContent,
  Meta,
  schema,
  TYPE_NAME,
  FormFields
}

export interface UID extends yup.TypeOf<typeof schema> {}