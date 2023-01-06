import parseMultipartFormData from "parse-multipart-data";
import { RestRequest } from "msw";

type FormDataField =
  | { data: Buffer; type: string; filename?: string }
  | { data: string };

export const readMSWFormData = async (
  req: RestRequest
): Promise<Record<string, FormDataField>> => {
  const boundary = parseMultipartFormData.getBoundary(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    req.headers.get("Content-Type")!
  );
  const parsedData = parseMultipartFormData.parse(
    Buffer.from(await req.text()),
    boundary
  );

  const res: Record<string, FormDataField> = {};

  for (const input of parsedData) {
    if (input.name) {
      if ("filename" in input) {
        res[input.name] = {
          data: input.data,
          filename: input.filename,
          type: input.type,
        };
      } else {
        res[input.name] = {
          data: input.data.toString(),
        };
      }
    }
  }

  return res;
};
