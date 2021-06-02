const { getStoriesPaths } = require('../../../helpers/storybook')

module.exports = {
  "stories": [
    ...getStoriesPaths()
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    '@storybook/preset-scss'
  ]
}