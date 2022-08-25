import { describe, it, expect, jest } from "@jest/globals";
import crypto from "crypto";
import nock from "nock";
import fs from "fs";
import { Readable } from "stream";

import { Client, ApplicationMode, ClientError } from "../src";
import {
  ProductionApisEndpoints,
  StageApisEndpoints,
} from "../src/models/ApisEndpoints";

import { userProfileMock } from "./__stubs__/userProfile";
import { sharedSliceMock } from "./__stubs__/sharedSlice";
import { customTypeMock } from "./__stubs__/customType";
import { aclCreateResultMock } from "./__stubs__/aclCreateResult";

const repository = "dragonborn";
const authenticationToken = "biscuit";

describe("Client - Internal properties", () => {
  it("should set the authentication token and repository on the constructor", () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    expect(client.repository).toBe(repository);
    expect(client.authenticationToken).toBe(authenticationToken);
  });

  it("should use production endpoints", () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    expect(client.apisEndpoints).toEqual(ProductionApisEndpoints);
  });

  it("should use staging endpoints", () => {
    const client = new Client(
      ApplicationMode.STAGE,
      repository,
      authenticationToken
    );

    expect(client.apisEndpoints).toEqual(StageApisEndpoints);
  });

  it("should update the internal repository", () => {
    const client = new Client(
      ApplicationMode.STAGE,
      repository,
      authenticationToken
    );
    expect(client.repository).toBe(repository);
    client.updateRepository("damn");
    expect(client.repository).toBe("damn");
  });

  it("should update the internal authentication token", () => {
    const client = new Client(
      ApplicationMode.STAGE,
      repository,
      authenticationToken
    );
    expect(client.authenticationToken).toBe(authenticationToken);
    client.updateAuthenticationToken("damn");
    expect(client.authenticationToken).toBe("damn");
  });
});

describe("Client - Calls", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  // -- VALIDATE AUTHENTICATION TOKEN -- //
  it("validateAuthenticationToken - should validate that the token is ok", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/validate")
      .query({ token: client.authenticationToken })
      .reply(200);

    await expect(client.validateAuthenticationToken()).resolves.toBe(true);
  });

  it("validateAuthenticationToken - should reply that the token is invalid", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/validate")
      .query({ token: client.authenticationToken })
      .reply(401);

    await expect(client.validateAuthenticationToken()).resolves.toBe(false);
  });

  it("validateAuthenticationToken - should throw for any other errors", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/validate")
      .query({ token: client.authenticationToken })
      .reply(500);

    expect.assertions(1);
    return client.validateAuthenticationToken().catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // -- REFRESH AUTHENTICATION TOKEN -- //
  it("refreshAuthenticationToken - should refresh the token and return the new one", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/refreshtoken")
      .query({ token: client.authenticationToken })
      .reply(200, "newToken");

    await expect(client.refreshAuthenticationToken()).resolves.toBe("newToken");
  });

  it("refreshAuthenticationToken - should set the new token internally on refresh", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/refreshtoken")
      .query({ token: client.authenticationToken })
      .reply(200, "newToken");

    expect(client.authenticationToken).toBe(authenticationToken);
    await expect(client.refreshAuthenticationToken()).resolves.toBe("newToken");
    expect(client.authenticationToken).toBe("newToken");
  });

  it("refreshAuthenticationToken - should throw if no token is returned by the authentication api", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Authentication)
      .get("/refreshtoken")
      .query({ token: client.authenticationToken })
      .reply(200, { newToken: "newToken" });

    expect.assertions(1);
    return client.refreshAuthenticationToken().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to parse");
    });
  });

  // -- PROFILE -- //
  it("profile - should succeed returning a user profile", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Users)
      .get("/profile")
      .reply(200, userProfileMock);

    await expect(client.profile()).resolves.toEqual(userProfileMock);
  });

  it("profile - should throw if the user profile format is not right", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Users)
      .get("/profile")
      .reply(200, { name: "blabla" });

    expect.assertions(1);
    return client.profile().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to parse");
    });
  });

  it("profile - should throw if it gets a bad response", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Users).get("/profile").reply(404);

    expect.assertions(1);
    return client.profile().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to retrieve");
    });
  });

  // -- GET SLICES -- //
  it("getSlices - should succeed returning a shared slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models)
      .get("/slices")
      .reply(200, [sharedSliceMock]);

    const result = await client.getSlices();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(sharedSliceMock);
  });

  it("getSlices - should throw if the user profile format is not right", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models)
      .get("/slices")
      .reply(200, [{ name: "blabla" }]);

    expect.assertions(1);
    return client.getSlices().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to parse");
    });
  });

  it("getSlices - should throw if it gets a bad response", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).get("/slices").reply(404);

    expect.assertions(1);
    return client.getSlices().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to retrieve");
    });
  });

  // -- GET CUSTOM TYPES -- //
  it("getCustomTypes - should succeed returning a custom type", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models)
      .get("/customtypes")
      .reply(200, [customTypeMock]);

    const result = await client.getCustomTypes();
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(customTypeMock);
  });

  it("getCustomTypes - should throw if the user profile format is not right", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models)
      .get("/customtypes")
      .reply(200, [{ name: "blabla" }]);

    expect.assertions(1);
    return client.getCustomTypes().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to parse");
    });
  });

  it("getCustomTypes - should throw if it gets a bad response", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).get("/customtypes").reply(404);

    expect.assertions(1);
    return client.getCustomTypes().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to retrieve");
    });
  });

  // -- INSERT CUSTOM TYPE -- //
  it("insertCustomType - should succeed inserting a custom type", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/customtypes/insert").reply(200);

    await expect(
      client.insertCustomType(customTypeMock)
    ).resolves.not.toThrow();
  });

  it("insertCustomType - should fail inserting a custom type", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/customtypes/insert").reply(500);

    expect.assertions(1);
    return client.insertCustomType(customTypeMock).catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // -- UPDATE CUSTOM TYPE -- //
  it("updateCustomType - should succeed updating a custom type", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/customtypes/update").reply(200);

    await expect(
      client.updateCustomType(customTypeMock)
    ).resolves.not.toThrow();
  });

  it("updateCustomType - should fail updating a custom type", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/customtypes/update").reply(500);

    expect.assertions(1);
    return client.updateCustomType(customTypeMock).catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // -- INSERT SLICE -- //
  it("insertSlice - should succeed inserting a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/slices/insert").reply(200);

    await expect(client.insertSlice(sharedSliceMock)).resolves.not.toThrow();
  });

  it("insertSlice - should fail inserting a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/slices/insert").reply(500);

    expect.assertions(1);
    return client.insertSlice(sharedSliceMock).catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // -- UPDATE SLICE -- //
  it("updateSlice - should succeed updating a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/slices/update").reply(200);

    await expect(client.updateSlice(sharedSliceMock)).resolves.not.toThrow();
  });

  it("updateSlice - should fail updating a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.Models).post("/slices/update").reply(500);

    expect.assertions(1);
    return client.updateSlice(sharedSliceMock).catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // -- CREATE ACL -- //
  it("createAcl - should succeed creating an ACL", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.AclProvider)
      .get("/create")
      .reply(200, aclCreateResultMock);

    await expect(client.createAcl()).resolves.toEqual({
      url: aclCreateResultMock.values.url,
      fields: aclCreateResultMock.values.fields,
      imgixEndpoint: aclCreateResultMock.imgixEndpoint,
    });
  });

  it("createAcl - should throw if the ACL return is not the right format", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.AclProvider)
      .get("/create")
      .reply(200, [{ name: "blabla" }]);

    expect.assertions(1);
    return client.createAcl().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to parse");
    });
  });

  it("createImagesAcl - should throw if it gets a bad response", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.AclProvider).get("/create").reply(404);

    expect.assertions(1);
    return client.createAcl().catch((e: ClientError) => {
      expect(e.message).toContain("Unable to retrieve");
    });
  });

  // -- DELETE SCREENSHOT FOLDER -- //
  it("deleteScreenshotFolder - should succeed updating a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.AclProvider).post("/delete-folder").reply(200);

    await expect(client.deleteScreenshotFolder("slice")).resolves.not.toThrow();
  });

  it("deleteScreenshotFolder - should fail updating a slice", async () => {
    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    nock(client.apisEndpoints.AclProvider).post("/delete-folder").reply(500);

    expect.assertions(1);
    return client.deleteScreenshotFolder("slice").catch((e: ClientError) => {
      expect(e.status).toBe(500);
    });
  });

  // Upload Screen Short
  it("uploadScreenShot", async () => {
    const str = "foo-bar-fake-image-data";
    const sliceId = "my_slice";
    const variationId = "default";

    const client = new Client(
      ApplicationMode.PROD,
      repository,
      authenticationToken
    );

    const readFileSpy = jest
      .spyOn(fs.promises, "readFile")
      .mockResolvedValue(str);
    jest
      .spyOn(fs, "statSync")
      .mockReturnValue({ length: str.length } as unknown as fs.Stats);
    jest.spyOn(fs, "createReadStream").mockImplementation(() => {
      const stream = new Readable();
      stream.push(str, "utf-8");
      stream.push(null);
      return stream as fs.ReadStream;
    });

    const hash = crypto.createHash("md5").update(str).digest("hex");
    const fakeS3Url = "https://s3.amazonaws.com/prismic-io/";

    const acl = {
      ...aclCreateResultMock.values,
      url: fakeS3Url,
      imgixEndpoint: aclCreateResultMock.imgixEndpoint,
    };

    nock(fakeS3Url)
      .post("/", (body) => {
        if (!body) return false;
        if (typeof body !== "string") return false;

        const keyInForm = `form-data; name="key"[^]*${repository}/shared-slices/${sliceId}/${variationId}-${hash}/preview.png`;

        const regexp = new RegExp(keyInForm, "gm");

        expect(body).toEqual(expect.stringMatching(regexp));

        const fileInfo = 'form-data; name="file"; filename="preview.png"';

        expect(body).toContain(fileInfo);

        return true;
      })
      .reply(204);

    const result = await client.uploadScreenshot({
      acl,
      sliceId: sliceId,
      variationId: variationId,
      filePath: "/tmp/preview.png",
    });
    expect(result).toEqual(
      `${aclCreateResultMock.imgixEndpoint}/${repository}/shared-slices/${sliceId}/${variationId}-${hash}/preview.png`
    );
    expect(readFileSpy).toHaveBeenCalled();
    expect.assertions(4);
  });
});
