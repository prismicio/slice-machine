/* eslint-disable */
const extract = require("oembed-parser").extract;

export default async function handler(url: string) {
  try {
    const oembed = await extract(url);
    return { oembed, err: null };
  } catch (e) {
    console.error(`[parse-oembed] Error: ${e}`);
    return { oembed: null, err: e.toString() };
  }
}
