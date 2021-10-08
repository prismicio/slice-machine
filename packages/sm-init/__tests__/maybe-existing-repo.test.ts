import {describe, expect, test, afterAll, afterEach, jest} from '@jest/globals'
import nock from 'nock'
// import * as MockStdin from 'mock-stdin'
import {maybeExistingRepo} from '../src/steps'
// import {stdout} from 'stdout-stderr'

const UP = '\x1B\x5B\x41';
const DOWN = '\x1B\x5B\x42';
const ENTER = '\x0D';

describe('mayeb-existing-repo', () => {

  afterAll(() => nock.restore())
  // afterEach(() => stdin.restore())

  test.skip('prompts user to select a repo', () => {
    maybeExistingRepo('foo')

  })

  test.skip('if user has no repos it asks them to create a repo', () => {
    expect(false)
  })

  test.skip('should resolve with a repo name', () => {

  })
})