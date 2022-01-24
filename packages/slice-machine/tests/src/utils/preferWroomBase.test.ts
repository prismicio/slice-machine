import preferWroomBase from "../../../src/utils/preferWroomBase";

describe("src/utils/preferWroomBase", () => {
  test("when endpoint form env.manifest.apiEndpoint is not from wroom.io or wroom.test it should return the base in the from enn.prismicData.base (prismic config)", () => {
    const want = "https://prismic.io";
    const got = preferWroomBase("https://example.com", "https://prismic.io");
    expect(got).toBe(want);
  });

  test("when endpoint form env.manifest.apiEndpoint is example.wroom.io it should return the base for wroom.io", () => {
    const want = "https://wroom.io";
    const got = preferWroomBase(
      "https://example.wroom.io",
      "https://prisimc.io"
    );
    expect(got).toBe(want);
  });

  test("when endpoint form env.manifest.apiEndpoint is example.wroom.test it should return the base in the from enn.prismicData.base (prismic config)", () => {
    const want = "https://wroom.test";
    const got = preferWroomBase(
      "https://example.wroom.test",
      "https://prisimc.io"
    );
    expect(got).toBe(want);
  });

  test("when endpoint form env.manifest.apiEndpoint is not a valid url it should return the base from the prismic config", () => {
    const want = "https://wroom.io";
    const got = preferWroomBase("", "https://wroom.io");
    expect(got).toBe(want);
  });
});
