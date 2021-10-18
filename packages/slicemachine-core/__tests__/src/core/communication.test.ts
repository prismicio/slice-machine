import { describe, expect, test, afterAll, jest } from "@jest/globals";
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
        "foo-repo": { dbid: "abcd", role: communication.Roles.OWNER },
        qwerty: { dbid: "efgh", role: communication.Roles.WRITER },
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

  test("refreshSession", async () => {
    const token = "biscuits";
    const base = "https://prismic.io";
    const wanted = "some-new-token";
    nock("https://auth.prismic.io")
      .get(`/refreshtoken?token=${token}`)
      .reply(200, wanted);
    const result = await communication.refreshSession(
      `prismic-auth=${token}`,
      base
    );
    expect(result).toEqual(wanted);
  });

  test("listRepositories", async () => {
    const base = "https://prismic.io";
    const responseData = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: "OWNER" },
        qwerty: { dbid: "efgh", role: "WRITER" },
      },
    };
    nock("https://auth.prismic.io")
      .get("/validate?token=biscuits")
      .reply(200, responseData);

    const result = await communication.listRepositories(fakeCookie, base);
    expect(result).toEqual(responseData.repositories);
  });

  describe("validateRepositoryName", () => {
    const fakeBase = "https://prismic.io";

    test("should fail if subdomain is not defined", async () => {
      const fn = () => communication.validateRepositoryName();
      expect(fn).rejects.toThrow("repository name is required");
    });

    test("should fail if name length is less than 4", async () => {
      const fn = () => communication.validateRepositoryName("abc");
      expect(fn).rejects.toThrow(
        "Must have four or more alphanumeric characters and/or hyphens."
      );
    });

    test("should fail if the name contains non alphanumeric characters", async () => {
      const fn = () => communication.validateRepositoryName("a.bc");
      expect(fn).rejects.toThrow(
        "Must contain only lowercase letters, numbers and hyphens"
      );
    });

    test("should fail if the name starts with a hyphen", async () => {
      const fn = () => communication.validateRepositoryName("-abc");
      expect(fn).rejects.toThrow("start with a letter");
    });

    test("should fail if the name ends with a hyphen", async () => {
      const fn = () => communication.validateRepositoryName("abc-");
      expect(fn).rejects.toThrow("Must end in a letter or a number");
    });

    test("Max length 30 characters", async () => {
      const repoName = Array.from({ length: 31 }, () => "a").join("");
      const fn = () => communication.validateRepositoryName(repoName);
      expect(fn).rejects.toThrow("30 characters or less");
    });

    test("multiple errors", () => {
      const repoName = "-abc.d";
      const fn = () => communication.validateRepositoryName(repoName);
      expect(fn).rejects.toThrow(
        "(1: Must start with a letter. (2: Must contain only lowercase letters, numbers and hyphens."
      );
    });

    test("should fail if repo name is not available", async () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => false);

      const fn = () => communication.validateRepositoryName(repoName);

      expect(fn).rejects.toThrow("already in use");
    });

    test("existing repo", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => false);
      expect(
        communication.validateRepositoryName(repoName, fakeBase, true)
      ).resolves.toEqual(repoName);
    });

    test("existing repo, does not exist", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);
      expect(
        communication.validateRepositoryName(repoName, fakeBase, true)
      ).rejects.toThrow("does not exist");
    });

    test("should pass if repo name is valid and available", async () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);

      expect(communication.validateRepositoryName(repoName)).resolves.toEqual(
        repoName
      );
    });

    test("different base", () => {
      const repoName = "test";
      nock("https://example.com")
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);

      expect(
        communication.validateRepositoryName(repoName, "https://example.com")
      ).resolves.toEqual(repoName);
    });
  });
});
