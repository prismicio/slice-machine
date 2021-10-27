import { describe, expect, test, jest } from "@jest/globals";

import nock from "nock";
import { createRepository } from "../src/steps/create-repo";
import { stderr, stdout } from "stdout-stderr";
import { Utils } from "slicemachine-core";
import { Framework } from "slicemachine-core/src/utils";

describe("createRepository", () => {
  test("when successful it will have called the endpoint and displayed a success message", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = Framework.FrameworkEnum.svelte;
    const cookies = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(200, { domain });

    stderr.start();
    await createRepository(domain, framework, { cookies, base });
    stderr.stop();
    expect(stderr.output).toContain(domain);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("success without domain in the response", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = Framework.FrameworkEnum.next;
    const cookies = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(200, {});

    stderr.start();
    await createRepository(domain, framework, { cookies, base });
    stderr.stop();
    expect(stderr.output).toContain(domain);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("when a error code is returned it will inform the user that their was an error", async () => {
    const domain = "foo-bar";
    const base = "https://prismic.io";
    const framework = Utils.Framework.FrameworkEnum.vanillajs;
    const cookies = "prismic-auth=biscuits;";

    nock(base)
      .post("/authentication/newrepository?app=slicemachine")
      .reply(500, {});

    const fakeExit = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    stderr.start();
    stdout.start();
    await createRepository(domain, framework, { cookies, base });
    stderr.stop();
    stdout.stop();
    expect(stderr.output).toContain("Error creating repository");
    expect(stdout.output).toContain("Run npx slicemachine init again!");
    expect(fakeExit).toHaveBeenCalled();
  });
});
