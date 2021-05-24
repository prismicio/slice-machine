import * as yup from 'yup'
import { DefaultFields } from '../forms/defaults'
import {
  createInitialValues,
  createValidationSchema,
} from '../forms'

import Files from './files'
import { hyphenate } from './str'

import camelCase from 'lodash/camelCase'

export const removeProp = (obj, prop) => {
  const { [prop]: __removed, ...rest  } = obj
  return rest
}

export const removeKeys = (obj, keys) => {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }
  return Object.entries(obj)
    .filter(([key]) => keys.indexOf(key) === -1)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
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

export const createDefaultHandleMockContentFunction = (widget, TYPE_NAME, checkFn) => {
  return function handleMockContent(mockContent, config) {
    if (!checkFn(mockContent, config)) {
      console.error(`Type check for type "${TYPE_NAME}" failed. Using default mock configuration`)
      return widget.handleMockConfig(null, config)
    }
    return mockContent
  }
}

/**
 * Remove punctuation and illegal characters from a story ID.
 *
 * See https://gist.github.com/davidjrice/9d2af51100e41c6c4b4a
 */
const sanitizeSbId = (string) => {
  return (
    string
    .toLowerCase()
    // eslint-disable-next-line no-useless-escape
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  );
};

export const createScreenshotUrl = ({ storybook, libraryName, sliceName, variationId }) => {
  return `${storybook}/iframe.html?id=${sanitizeSbId(libraryName)}-${sliceName.toLowerCase()}--${camelCase(variationId).replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase()}&viewMode=story`
}

export const maybeJsonFile = (pathToFile) => {
  try {
    return Files.readJson(pathToFile)
  } catch(e) {
    return {}
  }
}
