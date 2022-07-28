import { Acl } from "./Acl";

export type UploadParameters = {
  acl: Acl;
  sliceId: string;
  variationId: string;
  filePath: string;
};
