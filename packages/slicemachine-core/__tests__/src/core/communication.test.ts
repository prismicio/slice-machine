import { describe, expect, test, afterAll } from "@jest/globals";
import * as communication from "../../../src/core/communication";
import nock from "nock";

describe("communication", () => {
  afterAll(() => {
    jest.clearAllMocks();
    return nock.restore();
  });

  const fakeCookie = "prismic-auth=biscuits;";

  test("validateSession, default base", async () => {
    const responseData = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: communication.Roles.OWNER },
        qwerty: { dbid: "efgh", role: communication.Roles.WRITER },
      },
    };
    nock("https://auth.prismic.io")
      .get("/validate?token=biscuits")
      .reply(200, responseData);

    return communication.validateSession(fakeCookie).then((data) => {
      expect(data).toEqual(responseData);
    });
  });

  test("validateSession, custom base", async () => {
    const responseData = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: "OWNER" },
        qwerty: { dbid: "efgh", role: "WRITER" },
      },
    };
    nock("https://auth.wroom.io")
      .get("/validate?token=biscuits")
      .reply(200, responseData);

    return communication
      .validateSession(fakeCookie, "https://wroom.io")
      .then((data) => {
        expect(data).toEqual(responseData);
      });
  });
});
