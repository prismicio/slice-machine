import { encode, decode } from "@msgpack/msgpack";
import { Page } from "@playwright/test";

type MockManagerProceduresArgs = {
  /**
   * Playwright page object
   */
  page: Page;

  /**
   * Array of procedures to mock
   */
  procedures: {
    /**
     * Procedure path in the format of `getState` or `slices.readSlice`
     */
    path: string;

    /**
     * Function that takes the existing data and returns the data to return.
     */
    data?: (data: Record<string, unknown>) => Record<string, unknown>;

    /**
     * Whether to execute the procedure or not. Defaults to true.
     */
    execute?: boolean;
  }[];
};

/**
 * Mocks manager procedures from SliceMachineManagerClient
 */
export async function mockManagerProcedures(args: MockManagerProceduresArgs) {
  const { page, procedures } = args;

  await page.route("*/**/_manager", async (route) => {
    const postDataBuffer = route.request().postDataBuffer() as Buffer;
    const postData = decode(postDataBuffer) as Record<
      "procedurePath",
      unknown[]
    >;

    const procedure = procedures.find(
      (p) => p.path === postData.procedurePath.join("."),
    );

    if (procedure) {
      const { data, execute = true } = procedure;

      let newBody = Buffer.from(
        encode(
          data
            ? {
                data: data({}),
              }
            : {},
        ),
      );

      if (execute) {
        const response = await route.fetch();
        const existingBody = await response.body();
        const existingData = (decode(existingBody) as Record<"data", unknown>)
          .data as Record<string, unknown>;

        if (data) {
          newBody = Buffer.from(
            encode({
              data: data(existingData),
            }),
          );
        }
      }

      await route.fulfill({
        body: newBody,
      });
    } else {
      await route.continue();
    }
  });
}
