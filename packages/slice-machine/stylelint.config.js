// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cssTheme } = require("@prismicio/editor-ui");

module.exports = {
  defaultSeverity: "warning",
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  reportDescriptionlessDisables: true,
  rules: {
    "declaration-property-value-allowed-list": cssTheme,
  },
  extends: ["stylelint-config-recommended", "stylelint-config-css-modules"],
};
