/**
 *
 * @param {String} strip comma-separated string, eg. package,framework,gitUrl
 * @param {Boolean|String} preserveDefaults does not add default strip keys to returned array
 * @return {Array} Array of keys to delete
 */

function handleStripKeys(strip, trimKeys, preserveDefaults) {
  const defaultTrimKeys = preserveDefaults ? [] : trimKeys
  return strip
    ? strip
        .trim()
        .split(",")
        .concat(defaultTrimKeys)
    : defaultTrimKeys;
}

module.exports = {
  handleStripKeys
};
