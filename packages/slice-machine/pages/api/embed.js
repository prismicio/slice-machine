import { extract } from "oembed-parser";

export default async function handler(req, res) {
  const oembed = await extract(
    "https://twitter.com/rachelnabors/status/1354790533646979073?s=20"
  );
  res.status(200).json(oembed);
}
