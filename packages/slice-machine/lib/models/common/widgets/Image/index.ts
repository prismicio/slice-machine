import * as yup from 'yup'
import Form, { FormFields } from './Form'
import { BsImage } from 'react-icons/bs'

import {
  createInitialValues,
  createValidationSchema
} from '../../../../forms'

import { removeProp } from '../../../../utils'

import { handleMockConfig, handleMockContent } from './Mock'
import { MockConfigForm } from './Mock/Form'

/** 
 * {
    "type": "Image",
    "config": {
      "constraint": {
        "width": 100,
        "height": 100
      },
      "thumbnails": [
        {
          "name": "square",
          "width": 500,
          "height": 500
        }
      ],
      "label": "Icon Image"
    }
  } */

const create = () => ({
  ...createInitialValues(FormFields),
  constraint: {},
  thumbnails: [],
})

const schema = yup.object().shape({
  type: yup.string().matches(/^Image$/, {
    excludeEmptyString: true
  }).required(),
  config: createValidationSchema(removeProp(FormFields, 'id')),
})

const Meta = {
  icon: BsImage,
  title: 'Image',
  description: 'A responsive image field with constraints'
}

export const Image = {
  Meta,
  Form,
  schema,
  create,
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields,
  TYPE_NAME: 'Image'
}

export interface Image extends yup.TypeOf<typeof schema> {}