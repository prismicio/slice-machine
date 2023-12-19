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
    data?: (
      data: Record<string, unknown>,
    ) =>
      | Record<string, unknown>
      | Record<string, unknown>[]
      | string
      | boolean
      | Error;

    /**
     * Whether to execute the procedure or not. Defaults to true.
     */
    execute?: boolean;
  }[];
};

/**
 * Mocks manager procedures from SliceMachineManagerClient.
 * If you mock multiple procedures with the same path, they will be executed in order.
 * The last one will be executed for all subsequent calls non directly covered.
 */
export async function mockManagerProcedures(args: MockManagerProceduresArgs) {
  const { page, procedures } = args;
  let proceduresCountObject: Record<string, number> = {};

  await page.route("*/**/_manager", async (route) => {
    const postDataBuffer = route.request().postDataBuffer() as Buffer;
    const postData = decode(postDataBuffer) as Record<
      "procedurePath",
      unknown[]
    >;
    const procedurePath = postData.procedurePath.join(".");
    const procedureCount: number = proceduresCountObject[procedurePath] ?? 0;

    const matchedProcedures = procedures.filter(
      (p) => p.path === procedurePath,
    );

    let procedure =
      matchedProcedures.length > 1
        ? matchedProcedures[procedureCount]
        : matchedProcedures[0];

    if (!procedure && matchedProcedures.length > 1) {
      procedure = matchedProcedures[matchedProcedures.length - 1];
    }

    if (procedure) {
      const { data, execute = true } = procedure;
      proceduresCountObject = {
        ...proceduresCountObject,
        [procedure.path]: procedureCount + 1,
      };

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
        try {
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
        } catch (error) {
          // noop: when the test end, it can happen a route is still pending and
          // we want to prevent executing a request if the context is closed.
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
