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
function mergeWithSlices(ct, slices, customTypesToMerge) {
  return ct.map(elem => {
    if (customTypesToMerge.indexOf(elem.id) === 0) {  
      const sliceZoneEntry = Object.entries(elem.value[elem.name] || {})
        .find(([_, value]) => value.type && value.type === 'Slices')

      if (!sliceZoneEntry) {
        console.error(`Custom type file ${elem.name} mal-formatted: could not find SliceZone`)
        return
      }

      const [key, body] = sliceZoneEntry
      const currSlices = get(body, `config.choices`, {})

      const merged = merge(currSlices, slices);
      return set(elem, `value.${elem.name}.${key}.config.choices`, merged);
    }
    return elem;
  });
}

module.exports = {
  mergeWithSlices
}