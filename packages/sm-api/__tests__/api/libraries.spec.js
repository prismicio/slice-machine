describe("libraries", () => {
  it("should work", async () => {
    jest.mock("../../common/mongo", () => ({
      collections: {
        libraries: () => ({
          toArray: () =>
            require("../../__stubs__/libraries-mongo-libraries.json"),
        }),
      },
    }));

    const { libraries } = require("../../api");

    const event = {
      queryStringParameters: {
        /* framework, strip, list, preserveDefaults */
      },
    };

    const result = await libraries(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(body).toMatchSnapshot();

    jest.unmock("../../common/mongo");
  });

  // to-do: test query params.
});
