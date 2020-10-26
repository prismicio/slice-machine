import * as yup from 'yup'
import Form, { FormFields } from './Form'
import { BsImage } from 'react-icons/bs'

import {
  createInitialValues,
  createValidationSchema
} from 'lib/forms'

import { removeProp } from '../../utils'

import { createMock, fromUser } from './mock'

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


  /**
   * https://source.unsplash.com/random/800x600
   */

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  constraint: {},
  thumbnails: [],
  id: apiId
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

export default {
  Meta,
  Form,
  schema,
  create,
  createMock,
  FormFields,
  fromUser
}
