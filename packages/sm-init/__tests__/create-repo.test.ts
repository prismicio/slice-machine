import { describe, expect, test } from "@jest/globals";

import nock from "nock";
import { createRepository } from "../src/steps/create-repo";
import { stderr, stdout } from "stdout-stderr";

describe("createRepository", () => {
  test("success", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = "foo.js";
    const cookie = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(200, { domain });

    stderr.start();
    await createRepository(domain, cookie, framework, base);
    stderr.stop();
    expect(stderr.output).toContain(domain);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("success without domain in the response", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = "foo.js";
    const cookie = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(200, {});

    stderr.start();
    await createRepository(domain, cookie, framework, base);
    stderr.stop();
    expect(stderr.output).toContain(domain);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("failure", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = "foo.js";
    const cookie = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(500, {});

    stderr.start();
    stdout.start();
    await createRepository(domain, cookie, framework, base);
    stderr.stop();
    stdout.stop();
    console.log(stderr.output);
    expect(stderr.output).toContain("Error creating repository");
    expect(stdout.output).toContain("Error: [500]");
  });
});
