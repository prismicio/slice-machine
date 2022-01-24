// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const extract = require("oembed-parser").extract;

export default async function handler(url: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const oembed = await extract(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { oembed, err: null };
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`[parse-oembed] Error: ${e}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return { oembed: null, err: e.toString() };
  }
}
