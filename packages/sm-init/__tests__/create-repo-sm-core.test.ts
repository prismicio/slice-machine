import {test, expect, jest} from '@jest/globals'
import {mocked} from 'ts-jest/utils'

import * as core from 'slicemachine-core'
import {createRepository} from '../src/steps/create-repo'
import {stderr} from 'stdout-stderr'

jest.mock('slicemachine-core', () => ({
  Communication: {
    createRepository: jest.fn().mockImplementation(() => Promise.reject({})),
  },
  Utils: {
    spinner: jest.fn().mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn()
    }),
    CONSTS: {
      DEFAULT_BASE: 'https://prismic.io'
    }
  },
}))

test('mock core create repo', async () => {

  const mockCore = mocked(core, true)
  stderr.start()
  await createRepository('foo-bar', 'prismic-auth=abcd', 'foo.js', 'https://prismic.io')
  stderr.stop()
  expect(mockCore.Communication.createRepository).toHaveBeenCalled()
})
