export const warningStates = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  STORYBOOK_NOT_IN_MANIFEST: 'STORYBOOK_NOT_IN_MANIFEST',
  STORYBOOK_NOT_INSTALLED: 'STORYBOOK_NOT_INSTALLED',
  STORYBOOK_NOT_RUNNING: 'STORYBOOK_NOT_RUNNING',
  NEW_VERSION_AVAILABLE: 'NEW_VERSION_AVAILABLE',
  CLIENT_ERROR: 'CLIENT_ERROR'
}
export const storybookWarningStates = [
  warningStates.STORYBOOK_NOT_IN_MANIFEST,
  warningStates.STORYBOOK_NOT_INSTALLED,
  warningStates.STORYBOOK_NOT_RUNNING
]

export const warningTwoLiners = {
  NOT_CONNECTED: ['You\'re not connected', 'Run `prismic login` to connect'],
  STORYBOOK_NOT_IN_MANIFEST: ['Storybook not found in manifest', 'Run `yarn run storybook` from your terminal'],
  STORYBOOK_NOT_INSTALLED: ['Storybook is not installed', 'Run `yarn run storybook`'],
  STORYBOOK_NOT_RUNNING: ['Storybook is not running', 'Run `yarn run storybook` from your terminal'],
}

export const defaultSliceId = 'default-slice'
export const changelogPath = 'changelog/versions'
export const s3DefaultPrefix = 'shared-slices'

export const acceptedImagesTypes = ['png', 'jpg', 'jpeg']

export const SupportedFrameworks = {
  nuxt: 'nuxt',
  next: 'next',
  vue: 'vue',
  react: 'react'
}

export const MockConfigKey = 'mockConfig'