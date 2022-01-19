import { validateEnv } from "../../server/src/api/screenshots/screenshots";

describe("screenshots", () => {
  test("it should error when unsupported framework is passed", async () => {
    const res = validateEnv("react", "url");
    expect(res).toBeDefined();
    expect(res.err).toBeDefined();
  });
  test("it should error when no localPreviewUrl is passed", async () => {
    const res = validateEnv("next");
    expect(res).toBeDefined();
    expect(res.err).toBeDefined();
  });
  test("it should validate when screenshot is authorized", async () => {
    const res = validateEnv("next", "url");
    expect(res).toBe(undefined);
  });
});
