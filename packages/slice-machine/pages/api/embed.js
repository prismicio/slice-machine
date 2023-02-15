import { extract } from "@extractus/oembed-extractor";

export default async function handler(req, res) {
  const oembed = await extract(
    "https://twitter.com/rachelnabors/status/1354790533646979073?s=20"
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.status(200).json(oembed);
}
