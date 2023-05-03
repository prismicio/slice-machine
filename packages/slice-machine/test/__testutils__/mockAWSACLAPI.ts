import { TestContext } from "vitest";
import { rest } from "msw";

import { readMSWFormData } from "./readMSWFormData";

type MockAWSACLAPIConfig = {
  endpoint?: string;
  createEndpoint?: {
    expectedAuthenticationToken: string;
    expectedPrismicRepository: string;
    imgixEndpoint?: string;
  };
  uploadEndpoint?:
    | {
        isSuccessful: false;
        endpoint?: never;
        requiredFormDataFields?: never;
        expectedUploads?: never;
      }
    | {
        isSuccessful?: true;
        endpoint?: string;
        requiredFormDataFields?: Record<string, string>;
        expectedUploads: {
          file: Buffer;
          key?: string;
          contentType?: string;
        }[];
      };
  deleteFolderEndpoint?: { expectedSliceIDs: string[] };
};

type MockAWSACLAPIReturnType = {
  s3ACL: {
    uploadEndpoint: string;
    requiredFormDataFields: Record<string, string>;
    imgixEndpoint: string;
  };
};

export const mockAWSACLAPI = (
  ctx: TestContext,
  config?: MockAWSACLAPIConfig
): MockAWSACLAPIReturnType => {
  const endpoint =
    config?.endpoint ??
    "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/";

  const s3ACL = {
    uploadEndpoint:
      config?.uploadEndpoint?.endpoint || "https://s3.example.com/foo/",
    requiredFormDataFields: config?.uploadEndpoint?.requiredFormDataFields || {
      foo: "bar",
      baz: "qux",
    },
    imgixEndpoint:
      config?.createEndpoint?.imgixEndpoint || "https://imgix.example.com/foo/",
  };

  if (config?.createEndpoint) {
    ctx.msw.use(
      rest.get(new URL("./create", endpoint).toString(), (req, res, ctx) => {
        if (
          req.headers.get("Authorization") ===
            `Bearer ${config.createEndpoint?.expectedAuthenticationToken}` &&
          req.headers.get("User-Agent") === "slice-machine" &&
          req.headers.get("Repository") ===
            config.createEndpoint?.expectedPrismicRepository
        ) {
          return res(
            ctx.json({
              values: {
                url: s3ACL.uploadEndpoint,
                fields: s3ACL.requiredFormDataFields,
              },
              imgixEndpoint: s3ACL.imgixEndpoint,
            })
          );
        } else {
          return res(
            ctx.json({
              message: "[MOCK ERROR MESSAGE]: Failed to generate ACL",
            })
          );
        }
      })
    );
  }

  if (config?.uploadEndpoint) {
    const uploadEndpointConfig = {
      isSuccessful: true,
      endpoint: s3ACL.uploadEndpoint,
      requiredFormDataFields: s3ACL.requiredFormDataFields,
      expectedUploads: [],
      ...config?.uploadEndpoint,
    };

    ctx.msw.use(
      rest.post(uploadEndpointConfig.endpoint, async (req, res, ctx) => {
        const formData = await readMSWFormData(req);

        if (!uploadEndpointConfig.isSuccessful) {
          return res(ctx.status(401));
        }

        const expectedFileMetadata = uploadEndpointConfig.expectedUploads.find(
          (expectedUpload) => {
            return (
              Buffer.isBuffer(formData.file.data) &&
              formData.file.data.equals(expectedUpload.file)
            );
          }
        );

        if (!expectedFileMetadata) {
          return res(ctx.status(401));
        }

        if (
          (expectedFileMetadata.key
            ? formData.key.data === expectedFileMetadata.key
            : true) &&
          (expectedFileMetadata.contentType
            ? formData["Content-Type"].data === expectedFileMetadata.contentType
            : true) &&
          Object.keys(uploadEndpointConfig.requiredFormDataFields).every(
            (key) => {
              return (
                formData[key].data ===
                uploadEndpointConfig.requiredFormDataFields[key]
              );
            }
          ) &&
          Buffer.isBuffer(formData.file.data) &&
          formData.file.data.equals(expectedFileMetadata.file)
        ) {
          return res(ctx.status(200));
        } else {
          return res(ctx.status(401));
        }
      })
    );
  }

  if (config?.deleteFolderEndpoint) {
    ctx.msw.use(
      rest.post(
        new URL("delete-folder", endpoint).toString(),
        async (req, res, ctx) => {
          const { sliceName: sliceID } = await req.json<{
            sliceName: string;
          }>();
          if (config.deleteFolderEndpoint?.expectedSliceIDs.includes(sliceID)) {
            return res(ctx.status(200));
          } else {
            return res(ctx.status(401));
          }
        }
      )
    );
  }

  return {
    s3ACL,
  };
};
