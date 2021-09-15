import * as yup from 'yup'
import { MdTitle } from 'react-icons/md'
import { MockConfigForm } from './Mock/Form'
import { handleMockConfig, handleMockContent } from './Mock'

import { TextField } from './type'

/**
* {
     "type": "Text",
    "config": {
      "label": "person",
      "placeholder": "Their full name"
    }
  }
 */


import { removeProp } from '../../../../utils'
import { DefaultFields } from "../../../../forms/defaults"
import { createValidationSchema } from "../../../../forms"
import { Widget } from '../Widget'
import { FieldType } from '../../CustomType/fields'

const FormFields = DefaultFields

const schema = yup.object().shape({
  type: yup.string().matches(/^Text$/, { excludeEmptyString: true }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id'))
});

const Meta = {
  icon: MdTitle,
  title: 'Key Text',
  description: 'Text content'
}

export const Text: Widget<TextField, typeof schema> = {
  create: (label: string) => new TextField({ label }),
  MockConfigForm,
  handleMockConfig,
  handleMockContent,
  Meta,
  schema,
  TYPE_NAME: FieldType.Text,
  FormFields
}
