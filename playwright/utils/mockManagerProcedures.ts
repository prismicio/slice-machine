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
    data?: (data: unknown, args: unknown[]) => unknown;

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
      "procedurePath" | "procedureArgs",
      unknown[]
    >;

    const procedure = procedures.find(
      (p) => p.path === postData.procedurePath.join("."),
    );

    if (procedure) {
      const { data, execute = true } = procedure;

      let existingData: unknown = undefined;
      if (execute) {
        const response = await route.fetch();
        const existingBody = await response.body();
        existingData = (decode(existingBody) as Record<"data", unknown>)
          .data as Record<string, unknown>;
      }

      let newBodyContents: Record<string, unknown> = { data: existingData };
      if (data) {
        try {
          newBodyContents = {
            data: data(existingData, postData.procedureArgs),
          };
        } catch (error) {
          newBodyContents = {
            error:
              error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                  }
                : error,
          };
        }
      }

      await route.fulfill({
        body: Buffer.from(encode(newBodyContents)),
      });
    } else {
      await route.continue();
    }
  });
}
