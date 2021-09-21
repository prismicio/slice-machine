describe("version", () => {
  it("should work", async () => {
    const pkg = require("../../package.json");

    const { version } = require("../../api");

    const result = await version();

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.current).toEqual(pkg.version);
  });
});
