import * as yup from 'yup'
import { DefaultFields } from '../forms/defaults'
import {
  createInitialValues,
  createValidationSchema,
} from '../forms'

import Files from './files'
import { createStorybookId, camelCaseToDash } from './str'

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
  create: () => createInitialValues(removeProp(DefaultFields, 'id'))
})

export const createDefaultHandleMockContentFunction = (widget, TYPE_NAME, checkFn) => {
  return function handleMockContent(mockContent, config) {
    if (!checkFn(mockContent, config)) {
      console.error(`Type check for type "${TYPE_NAME}" failed. Using default mock configuration`)
      return widget.handleMockConfig(null, config)
    }
    return mockContent
  }
}

export const sanitizeSbId = (string) => {
  return (
    string
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  );
}

const createStorybookPath = ({ libraryName, sliceName, variationId }) =>
  `${sanitizeSbId(libraryName)}-${sliceName.toLowerCase()}--${camelCaseToDash(createStorybookId(variationId).slice(1))}`

export const createScreenshotUrl = ({ storybook, libraryName, sliceName, variationId }) => {
  return `${storybook}/iframe.html?id=${createStorybookPath({ libraryName, sliceName, variationId })}&viewMode=story`
}

export const createStorybookUrl = ({ storybook, libraryName, sliceName, variationId }) => {
  return `${storybook}/?path=/story/${createStorybookPath({ libraryName, sliceName, variationId })}`
}

export const maybeJsonFile = (pathToFile) => {
  try {
    return Files.readJson(pathToFile)
  } catch(e) {
    return {}
  }
}
