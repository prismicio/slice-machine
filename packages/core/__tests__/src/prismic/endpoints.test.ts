import { describe, expect, test } from "@jest/globals";
import {
  buildRepositoryEndpoint,
  extractDomainFromBase,
} from "../../../src/prismic";

describe("endpoints", () => {
  const baseDomain = "music.to.my.hears.io";
  const base = `https://${baseDomain}`;
  const fakeRepository = "dragonborn";
  const fakeRepositoryEndpoint = `https://${fakeRepository}.${baseDomain}/api/v2`;

  test("extractDomainFromBase function should work", () => {
    expect(extractDomainFromBase(base)).toEqual(baseDomain);
  });

  test("buildRepositoryEndpoint function should work", () => {
    expect(buildRepositoryEndpoint(base, fakeRepository)).toEqual(
      fakeRepositoryEndpoint
    );
  });
});
