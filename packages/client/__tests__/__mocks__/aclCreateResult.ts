import type { AclCreateResult } from "../../src/models/Acl";

export const aclCreateResultMock: AclCreateResult = {
  values: {
    url: "fakeUrl",
    fields: {},
  },
  imgixEndpoint: "fakeImgixendpoint",
  message: "no error, it's ok",
};
