import { describe, expect, test, jest, afterEach } from "@jest/globals";
import inquirer from "inquirer";
import {
  maybeExistingRepo,
  promptForRepoName,
  prettyRepoName,
  CREATE_REPO,
  makeReposPretty,
  orderPrompts,
  RepoPrompts,
  RepoPrompt,
  maybeStickTheRepoToTheTopOfTheList,
  sortReposForPrompt,
} from "../src/steps/maybe-existing-repo";

import nock from "nock";

import { Roles } from "@slicemachine/core/build/src/prismic";

import * as fs from "fs";
import { Repositories } from "@slicemachine/core/build/src/models/Repositories";

jest.mock("fs");

describe("maybe-existing-repo", () => {
  void afterEach(() => {
    jest.restoreAllMocks();
  });

  test("prompts user to select a repo", async () => {
    const repoName = "test";
    const base = "https://prismic.io";

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValue(
        Promise.resolve({ repoName }) as ReturnType<typeof inquirer.prompt>
      );
    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);
    const result = await promptForRepoName(base);

    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(result).toBe(repoName);
  });

  test("if user has no repos it asks them to create a repo", async () => {
    const repoName = "test";
    const base = "https://prismic.io";
    const cookies = "prismic-auth=biscuits;";
    const userServiceURL = "https://user.internal-prismic.io";

    nock(userServiceURL).get("/repositories").reply(200, []);

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValue(
        Promise.resolve({ repoName }) as ReturnType<typeof inquirer.prompt>
      );
    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

    const result = await maybeExistingRepo(cookies, base);

    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    expect(result.name).toEqual(repoName);
    return expect(result.existing).toBeFalsy();
  });

  test("it allows a user to create a new repo", async () => {
    const repoName = "test";
    const base = "https://prismic.io";
    const userServiceURL = "https://user.internal-prismic.io";
    const cookies = "prismic-auth=biscuits;";

    nock(userServiceURL)
      .get("/repositories")
      .reply(200, [{ domain: "foo", name: "foo", role: Roles.OWNER }]);

    jest
      .spyOn(inquirer, "prompt")
      .mockReturnValueOnce(
        Promise.resolve({ repoName: CREATE_REPO }) as ReturnType<
          typeof inquirer.prompt
        >
      )
      .mockReturnValueOnce(
        Promise.resolve({ repoName }) as ReturnType<typeof inquirer.prompt>
      );

    jest.spyOn(console, "log").mockImplementationOnce(() => undefined);

    const result = await maybeExistingRepo(cookies, base);
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
    expect(result.name).toEqual(repoName);
    expect(result.existing).toBeFalsy();
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
      domain: "foo-bar",
      role: Roles.WRITER,
    });

    expect(result.name).toContain("foo-bar.prismic.io");
    expect(result.value).toBe("foo-bar");
    expect(result.disabled).toContain("Unauthorized");
  });

  test("authorized role", () => {
    const base = "https://prismic.io";
    const result = makeReposPretty(base)({
      name: "foo-bar",
      domain: "foo-bar",
      role: Roles.OWNER,
    });

    expect(result.name).toContain("foo-bar.prismic.io");
    expect(result.value).toBe("foo-bar");
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
    const repos: Repositories = [
      { name: "foo-bar", domain: "foo-bar", role: Roles.WRITER },
      { name: "qwerty", domain: "qwerty", role: Roles.ADMIN },
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
    const repos: Repositories = [
      { name: "foo-bar", domain: "foo-bar", role: Roles.WRITER },
      { name: "qwerty", domain: "qwerty", role: Roles.ADMIN },
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
