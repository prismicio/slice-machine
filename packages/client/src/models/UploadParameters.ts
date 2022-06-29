import { Acl } from "./Acl";

export type UploadParameters = {
  acl: Acl;
  sliceName: string;
  variationId: string;
  filePath: string;
};
