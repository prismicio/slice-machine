import fs from 'fs'
import * as yup from 'yup'
import { DefaultFields } from './forms/defaults'
import {
  createInitialValues,
  createValidationSchema,
} from './forms'

export const removeProp = (obj, prop) => {
  const { [prop]: __removed, ...rest  } = obj
  return rest
}

export const createDefaultWidgetValues = (TYPE_NAME) => ({
  TYPE_NAME,
  FormFields: DefaultFields,
  schema: yup.object().shape({
    type: yup.string().test({
      name: 'type',
      test: function (value) {
        return value === TYPE_NAME
      }
    }),
    config: createValidationSchema(removeProp(DefaultFields, 'id'))
  }),
  create: (apiId) => ({
    ...createInitialValues(DefaultFields),
    id: apiId
  })
})

export const createDefaultHandleMockContentFunction = (widget, TYPE_NAME, expectedType = 'string') => {
  return function handleMockContent(mockContent, config) {
    if (typeof mockContent !== expectedType) {
      console.error(`Mocks for type "${TYPE_NAME}" expect their "content" property to be of type "${expectedType}". Received: ${typeof mockContent}.`)
      return widget.createMock(config)
    }
    return mockContent
  }
}

export const createScreenshotUrl = ({ storybook, sliceName, variation }) => {
  return `${storybook}/iframe.html?id=${sliceName.toLowerCase()}--${variation}&viewMode=story`
}

export const maybeJsonFile = (pathToFile) => {
  try {
    return JSON.parse(fs.readFileSync(pathToFile, 'utf-8'))
  } catch(e) {
    return {}
  }
}
