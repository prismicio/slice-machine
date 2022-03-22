import { describe, expect, test, jest, afterEach } from "@jest/globals";
import inquirer from "inquirer";
import {
  chooseOrCreateARepository,
  promptForRepoDomain,
  prettyRepoName,
  CREATE_REPO,
  makeReposPretty,
  orderPrompts,
  RepoPrompts,
  RepoPrompt,
  maybeStickTheRepoToTheTopOfTheList,
  sortReposForPrompt,
} from "../src/steps/choose-or-create-a-repository";

import { createRepository } from "../src/utils/create-repo";

import nock from "nock";
import { Models } from "@slicemachine/core";

import * as fs from "fs";

jest.mock("fs");
jest.mock("../src/utils/create-repo");

const createRepositoryMock = createRepository as jest.Mock;

describe("choose-or-create-repo", () => {
  void afterEach(() => {
    jest.restoreAllMocks();
  });

  const fakeCwd = "./";
  const framework = Models.Frameworks.svelte;

  test("prompts user to select a repo", async () => {
    const repoDomain = "test";
    const base = "https://prismic.io";

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValue(
        Promise.resolve({ repoDomain }) as ReturnType<typeof inquirer.prompt>
      );
    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);
    const result = await promptForRepoDomain(base);

    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(createRepositoryMock).toHaveBeenCalledTimes(0);
    expect(result).toBe(repoDomain);
  });

  test("if user has no repos it asks them to create a repo", async () => {
    const repoDomain = "repoDomain";
    const base = "https://prismic.io";
    const cookies = "prismic-auth=biscuits;";
    const userServiceURL = "https://user.internal-prismic.io";

    nock(userServiceURL).get("/repositories").reply(200, []);

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValue(
        Promise.resolve({ repoDomain }) as ReturnType<typeof inquirer.prompt>
      );
    createRepositoryMock.mockImplementation(() => repoDomain);
    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

    const result = await chooseOrCreateARepository(
      fakeCwd,
      framework,
      cookies,
      base
    );

    expect(createRepositoryMock).toHaveBeenCalledWith(
      repoDomain,
      framework,
      cookies,
      base
    );
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(result).toEqual(repoDomain);
  });

  test("it allows a user to create a new repo", async () => {
    const repoDomain = "test";
    const base = "https://prismic.io";
    const userServiceURL = "https://user.internal-prismic.io";
    const cookies = "prismic-auth=biscuits;";

    nock(userServiceURL)
      .get("/repositories")
      .reply(200, [{ domain: "foo", name: "foo", role: Models.Roles.OWNER }]);

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValueOnce(
        Promise.resolve({ chosenRepo: CREATE_REPO }) as ReturnType<
          typeof inquirer.prompt
        >
      )
      .mockReturnValueOnce(
        Promise.resolve({ repoDomain }) as ReturnType<typeof inquirer.prompt>
      );

    createRepositoryMock.mockImplementation(() => Promise.resolve(repoDomain));
    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

    const result = await chooseOrCreateARepository(
      fakeCwd,
      framework,
      cookies,
      base
    );

    expect(createRepositoryMock).toHaveBeenCalledWith(
      repoDomain,
      framework,
      cookies,
      base
    );
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(result).toEqual(repoDomain);
  });

  test("when given project and project exists, the project is pre-selected and the user is not asked to select a project", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const userServiceURL = "https://user.internal-prismic.io";
    const cookies = "prismic-auth=biscuits;";

    nock(userServiceURL)
      .get("/repositories")
      .reply(200, [
        { domain: domain, name: "Foo Bar", role: Models.Roles.OWNER },
      ]);

    const promptSpy = jest.spyOn(inquirer, "prompt");

    const result = await chooseOrCreateARepository(
      fakeCwd,
      framework,
      cookies,
      base,
      domain
    );

    expect(promptSpy).not.toHaveBeenCalled();
    expect(result).toEqual(domain);
  });

  test("when the given a project and the project does not exist in the users repo's it should prompt them for a repo", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const userServiceURL = "https://user.internal-prismic.io";
    const cookies = "prismic-auth=biscuits;";

    nock(userServiceURL).get("/repositories").reply(200, []);

    createRepositoryMock.mockImplementation(() => Promise.resolve(domain));

    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

    const promptSpy = jest
      .spyOn(inquirer, "prompt")
      .mockReturnValue(
        Promise.resolve({ repoDomain: domain }) as ReturnType<
          typeof inquirer.prompt
        >
      );

    const result = await chooseOrCreateARepository(
      fakeCwd,
      framework,
      cookies,
      base,
      domain
    );

    expect(promptSpy).toHaveBeenCalledTimes(1);
    expect(promptSpy).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ default: domain })])
    );
    expect(result).toEqual(domain);
  });
});

describe("prettyRepoName", () => {
  test("should contain the base url, and a placeholder", () => {
    const address = new URL("https://prismic.io");
    const result = prettyRepoName(address);
    expect(result).toContain("repo-name");
    expect(result).toContain(".prismic.io");
  });

  test("shohuld contain the value from user input", () => {
    const address = new URL("https://prismic.io");
    const result = prettyRepoName(address, "foo-bar");
    expect(result).toContain("foo-bar");
    expect(result).toContain(".prismic.io");
  });
});

describe("makeReposPretty", () => {
  test("unauthorized role", () => {
    const base = "https://prismic.io";
    const result = makeReposPretty(base)({
      name: "foo-bar",
      domain: "domain",
      role: Models.Roles.WRITER,
    });

    expect(result.name).toContain("domain.prismic.io");
    expect(result.name).toContain("foo-bar");
    expect(result.value).toBe("domain");
    expect(result.disabled).toContain("Unauthorized");
  });

  test("authorized role", () => {
    const base = "https://prismic.io";
    const result = makeReposPretty(base)({
      name: "foo-bar",
      domain: "domain",
      role: Models.Roles.OWNER,
    });

    expect(result.name).toContain("domain.prismic.io");
    expect(result.name).toContain("foo-bar");
    expect(result.value).toBe("domain");
    expect(result.disabled).toBeUndefined();
  });
});

describe("orderPrompts", () => {
  test("sends disabled repos to end of array", () => {
    const prompts: RepoPrompt[] = [
      { name: "a", value: "a", disabled: "a" },
      { name: "b", value: "b" },
      { name: "c", value: "c", disabled: "c" },
    ];

    const result = prompts.sort(orderPrompts());

    expect(result[0].name).toBe("b");
    expect(result[1].disabled).toBe("a");
    expect(result[2].disabled).toBe("c");
  });

  test("will not more $_CREATE_REPO", () => {
    const prompts: RepoPrompt[] = [
      { name: "a", value: "a" },
      { name: "b", value: CREATE_REPO },
      { name: "c", value: "c" },
    ];

    const result = prompts.sort(orderPrompts());
    expect(result[1].value).toBe(CREATE_REPO);
  });

  test("will not move separator if present", () => {
    const prompts: RepoPrompts = [
      { name: "a", value: "a" },
      new inquirer.Separator(),
      { name: "c", value: "c", disabled: "c" },
    ];

    const result = prompts.sort(orderPrompts());
    expect(result[1]).toBeInstanceOf(inquirer.Separator);
  });

  test("will not move repo name if given", () => {
    const prompts: RepoPrompts = [
      { name: "a", value: "a", disabled: "a" },
      new inquirer.Separator(),
      { name: "c", value: "c", disabled: "c" },
    ];

    const result = prompts.sort(orderPrompts("a"));
    expect(result[0]).toEqual(prompts[0]);
  });
});

describe("maybeStickTheRepoToTheTopOfTheList", () => {
  test("when repo name is not given it should return the prompts in order", () => {
    const prompts: RepoPrompt[] = [
      { name: "a", value: "a" },
      { name: "b", value: "b" },
      { name: "c", value: "c", disabled: "c" },
    ];

    const start = { name: CREATE_REPO, value: CREATE_REPO };

    const result = prompts.reduce(maybeStickTheRepoToTheTopOfTheList(), [
      start,
    ]);

    const [top, a, b, c] = result;
    expect(top).toBe(start);

    expect([a, b, c]).toEqual(prompts);
  });

  test("when no repo name is given and it apears in the prompts it should be first", () => {
    const prompts: RepoPrompt[] = [
      { name: "a", value: "a" },
      { name: "b", value: "b" },
      { name: "c", value: "c", disabled: "c" },
    ];

    const start = { name: CREATE_REPO, value: CREATE_REPO };

    const result = prompts.reduce(maybeStickTheRepoToTheTopOfTheList("b"), [
      start,
    ]);

    const [first, second] = result;
    expect(first).toBe(prompts[1]);
    expect(second).toBe(start);
  });
});

describe("sortReposForPrompt", () => {
  test("sort without pre-configured repo-name", () => {
    const repos: Models.Repositories = [
      { name: "foo-bar", domain: "foo-bar", role: Models.Roles.WRITER },
      { name: "qwerty", domain: "qwerty", role: Models.Roles.ADMIN },
    ];

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => undefined);

    const [first, second, third] = sortReposForPrompt(
      repos,
      "https://prismic.io",
      __dirname
    ) as RepoPrompt[];

    expect(first.value).toBe(CREATE_REPO);
    expect(second.value).toBe("qwerty");
    expect(third.value).toBe("foo-bar");
  });

  test("sort with pre-configure repo-name", () => {
    const repos: Models.Repositories = [
      { name: "foo-bar", domain: "foo-bar", role: Models.Roles.WRITER },
      { name: "qwerty", domain: "qwerty", role: Models.Roles.ADMIN },
    ];

    jest.spyOn(fs, "lstatSync").mockImplementationOnce(() => ({} as fs.Stats));

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() =>
        JSON.stringify({ apiEndpoint: "https://foo-bar.prismic.io/api.v2" })
      );

    const [first, second, third] = sortReposForPrompt(
      repos,
      "https://prismic.io",
      __dirname
    ) as RepoPrompt[];

    expect(first.value).toBe("foo-bar");
    expect(second.value).toBe(CREATE_REPO);
    expect(third.value).toBe("qwerty");
  });
});
