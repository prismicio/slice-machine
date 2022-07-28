import { describe, expect, test, jest } from "@jest/globals";

import nock from "nock";
import { createRepository } from "../../src/utils/create-repo";
import { stderr, stdout } from "stdout-stderr";
import { Models } from "@slicemachine/core";
import { InitClient } from "../../src/utils";
import { ApplicationMode } from "@slicemachine/client";

const fakeRepository = "dragonborn";
const fakeToken = "biscuit";
const client = new InitClient(ApplicationMode.PROD, fakeRepository, fakeToken);

describe("createRepository", () => {
  test("when successful it will have called the endpoint and displayed a success message", async () => {
    const framework = Models.Frameworks.svelte;

    nock(client.apisEndpoints.Wroom)
      .post("/authentication/newrepository")
      .query({
        app: "slicemachine",
      })
      .reply(200, { domain: fakeRepository });

    stderr.start();
    const createdRepoDomain = await createRepository(
      client,
      fakeRepository,
      framework
    );
    stderr.stop();
    expect(createdRepoDomain).toBe(fakeRepository);
    expect(stderr.output).toContain(fakeRepository);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("success without domain in the response", async () => {
    const framework = Models.Frameworks.next;

    nock(client.apisEndpoints.Wroom)
      .post("/authentication/newrepository")
      .query({
        app: "slicemachine",
      })
      .reply(200, {});

    stderr.start();
    const createdRepoDomain = await createRepository(
      client,
      fakeRepository,
      framework
    );
    stderr.stop();
    expect(createdRepoDomain).toBe(fakeRepository);
    expect(stderr.output).toContain(fakeRepository);
    expect(stderr.output).toContain("Creating Prismic Repository");
    expect(stderr.output).toContain("We created your new repository");
  });

  test("when a error code is returned it will inform the user that their was an error", async () => {
    const framework = Models.Frameworks.vanillajs;

    nock(client.apisEndpoints.Wroom)
      .post("/authentication/newrepository")
      .query({
        app: "slicemachine",
      })
      .reply(500, {});

    const fakeExit = jest
      .spyOn(process, "exit")
      .mockImplementationOnce(() => undefined as never);
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    stderr.start();
    stdout.start();
    await createRepository(client, fakeRepository, framework);
    stderr.stop();
    stdout.stop();
    expect(stderr.output).toContain("Error creating repository");
    expect(stdout.output).toContain("Run npx @slicemachine/init again!");
    expect(fakeExit).toHaveBeenCalled();
  });
});
