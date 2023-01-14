import { describe, expect, test } from "vitest";
import { Endpoints } from "../../../core/prismic";

describe("endpoints", () => {
  const baseDomain = "music.to.my.hears.io";
  const base: Endpoints.Base = `https://${baseDomain}`;
  const fakeRepository = "dragonborn";
  const fakeRepositoryEndpoint = `https://${fakeRepository}.${baseDomain}/api/v2`;

  test("extractDomainFromBase function should work", () => {
    expect(Endpoints.extractDomainFromBase(base)).toEqual(baseDomain);
  });

  test("buildRepositoryEndpoint function should work", () => {
    expect(Endpoints.buildRepositoryEndpoint(base, fakeRepository)).toEqual(
      fakeRepositoryEndpoint
    );
  });
});
