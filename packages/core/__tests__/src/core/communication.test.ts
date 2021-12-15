import {
  describe,
  expect,
  test,
  afterAll,
  afterEach,
  jest,
} from "@jest/globals";
import * as communication from "../../../src/core/communication";
import { roles } from "../../../src/utils";
import nock from "nock";
import { Frameworks } from "../../../src/models/Framework";

describe("communication", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    return nock.restore();
  });

  const fakeCookie = "prismic-auth=biscuits;";
  test("validateSession, default base", async () => {
    const responseData = {
      email: "fake@prismic.io",
      type: "USER",
      repositories: {
        "foo-repo": { dbid: "abcd", role: roles.Roles.OWNER },
        qwerty: { dbid: "efgh", role: roles.Roles.WRITER },
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
        "foo-repo": { dbid: "abcd", role: roles.Roles.OWNER },
        qwerty: { dbid: "efgh", role: roles.Roles.WRITER },
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
    const responseData = [
      { domain: "foo-repo", name: "foo-repo" },
      { domain: "qwerty", name: "qwerty" },
    ];
    nock("https://auth.prismic.io")
      .get("/validate?token=biscuits")
      .reply(200, responseData);

    const result = await communication.listRepositories(fakeCookie);
    expect(result).toEqual(responseData);
  });

  describe("validateRepositoryName", () => {
    const fakeBase = "https://prismic.io";

    test("should fail if subdomain is not defined", () => {
      const fn = () => communication.validateRepositoryName();
      return expect(fn).rejects.toThrow("repository name is required");
    });

    test("no upper case letters", () => {
      const fn = () => communication.validateRepositoryName("Abcd");
      return expect(fn).rejects.toThrow(
        "Must contain only lowercase letters, numbers and hyphens"
      );
    });

    test("should fail if name length is less than 4", () => {
      const fn = () => communication.validateRepositoryName("abc");
      return expect(fn).rejects.toThrow(
        "Must have four or more alphanumeric characters and/or hyphens."
      );
    });

    test("should fail if the name contains non alphanumeric characters", () => {
      const fn = () => communication.validateRepositoryName("a.bc");
      return expect(fn).rejects.toThrow(
        "Must contain only lowercase letters, numbers and hyphens"
      );
    });

    test("should fail if the name starts with a hyphen", () => {
      const fn = () => communication.validateRepositoryName("-abc");
      return expect(fn).rejects.toThrow("start with a letter");
    });

    test("should fail if the name ends with a hyphen", () => {
      const fn = () => communication.validateRepositoryName("abc-");
      return expect(fn).rejects.toThrow("Must end in a letter or a number");
    });

    test("Max length 30 characters", () => {
      const repoName = Array.from({ length: 31 }, () => "a").join("");
      const fn = () => communication.validateRepositoryName(repoName);
      return expect(fn).rejects.toThrow("30 characters or less");
    });

    test("multiple errors", () => {
      const repoName = "-abc.d";
      const fn = () => communication.validateRepositoryName(repoName);
      return expect(fn).rejects.toThrow(
        "(1: Must start with a letter. (2: Must contain only lowercase letters, numbers and hyphens."
      );
    });

    test("should fail if repo name is not available", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => false);

      const fn = () => communication.validateRepositoryName(repoName);

      return expect(fn).rejects.toThrow("already in use");
    });

    test("existing repo", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => false);
      return expect(
        communication.validateRepositoryName(repoName, fakeBase, true)
      ).resolves.toEqual(repoName);
    });

    test("existing repo, does not exist", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);
      return expect(
        communication.validateRepositoryName(repoName, fakeBase, true)
      ).rejects.toThrow("does not exist");
    });

    test("should pass if repo name is valid and available", () => {
      const repoName = "test";
      nock(fakeBase)
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);

      return expect(
        communication.validateRepositoryName(repoName)
      ).resolves.toEqual(repoName);
    });

    test("different base", () => {
      const repoName = "test";
      nock("https://example.com")
        .get(`/app/dashboard/repositories/${repoName}/exists`)
        .reply(200, () => true);

      return expect(
        communication.validateRepositoryName(repoName, "https://example.com")
      ).resolves.toEqual(repoName);
    });
  });

  describe("createRepository", () => {
    const cookies = "prismic-auth=biscuit;";
    const repoName = "test";

    test("with default arguments it should call the prismic.io endpoint to create a new repo", async () => {
      const formData = {
        domain: repoName,
        framework: Frameworks.vanillajs,
        plan: "personal",
        isAnnual: "false",
        role: "developer",
      };

      nock("https://prismic.io")
        .post("/authentication/newrepository?app=slicemachine", formData)
        .reply(200, { domain: repoName });

      const result = await communication.createRepository(repoName, cookies);
      expect(result.data.domain).toEqual(repoName);
    });

    test("with framework and different base", async () => {
      const fakeBase = "https://example.com";
      const framework = Frameworks.next;

      const formData = {
        domain: repoName,
        framework,
        plan: "personal",
        isAnnual: "false",
        role: "developer",
      };

      nock(fakeBase)
        .post("/authentication/newrepository?app=slicemachine", formData)
        .reply(200, { domain: repoName });

      const result = await communication.createRepository(
        repoName,
        cookies,
        framework,
        fakeBase
      );
      expect(result.data.domain).toEqual(repoName);
    });
  });
});

describe("maybeParseRepoData", () => {
  test("with repos as a string", () => {
    const repos = JSON.stringify({
      foo: { role: roles.Roles.ADMIN, dbid: "foo" },
    });
    const result = communication.maybeParseRepoData(repos);
    expect(result.foo).toBeDefined();
    expect(result.foo.role).toEqual(roles.Roles.ADMIN);
  });
});
