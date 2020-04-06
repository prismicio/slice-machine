const set = require("lodash.set");
const get = require("lodash.get");
const merge = require("lodash.merge");
/**
 * Merges slices models with custom types
 * @param  {Array} ct                 Array of custom_types [{ id: 'page', name: 'Page' }]
 * @param  {Object} slices            Slices definitions { main_header: {}, other_slice: {}}
 * @param  {Array[String]} customTypesToMerge list of custom types ids to merge (eg. ['page', 'homepage'])
 * @return {Array}                    Merged custom types
 */
function mergeCustomTypesWithSlices(ct, slices, customTypesToMerge) {
  return ct.map(elem => {
    if (customTypesToMerge.indexOf(elem.id) === 0) {
      // get existing slices
      const currSlices = get(
        elem,
        `value.${elem.name}.body.config.choices`,
        {}
      );
      // merge them with new slices (removes duplicates)
      const merged = merge(currSlices, slices);
      // return updated custom type
      return set(elem, `value.${elem.name}.body.config.choices`, merged);
    }
    return elem;
  });
}

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
  handleStripKeys,
  mergeCustomTypesWithSlices
};
