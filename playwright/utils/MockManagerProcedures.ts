import { Page, Route } from "@playwright/test";
import { encode, decode } from "@msgpack/msgpack";

type MockManagerProcedure = {
  handler: MockManagerProcedureHandler;
  config: MockManagerProcedureConfig;
};

type MockManagerProcedureHandler = (args: {
  data?: unknown;
  args: unknown[];
}) => unknown | Promise<unknown>;

type MockManagerProcedureConfig = {
  execute?: boolean;
  times?: number;
};

const FORCE_INIT = Symbol();

export class MockManagerProcedures {
  static async init(page: Page) {
    const mockManagerProcedures = new MockManagerProcedures(FORCE_INIT);

    await page.route(
      "*/**/_manager",
      mockManagerProcedures.#handleRoute.bind(mockManagerProcedures),
    );

    return mockManagerProcedures;
  }

  procedures = new Map<string, MockManagerProcedure[]>();

  /**
   * @depreacted Use `MockManagerProcedures.init` instead.
   */
  constructor(DO_NOT_USE_CONSTRUCTOR: typeof FORCE_INIT) {
    if (DO_NOT_USE_CONSTRUCTOR !== FORCE_INIT) {
      throw new Error(
        "`new MockManagerProcedures()` is forbidden. Use `await MockManagerProcedures.init(page)` instead.",
      );
    }
  }

  mock(
    path: string,
    handler: MockManagerProcedureHandler,
    config: MockManagerProcedureConfig = {},
  ) {
    this.procedures.set(path, [
      { handler, config },
      ...(this.procedures.get(path) ?? []),
    ]);
  }

  async #handleRoute(route: Route) {
    const postDataBuffer = route.request().postDataBuffer() as Buffer;
    const postData = decode(postDataBuffer) as {
      procedurePath: string[];
      procedureArgs: unknown[];
    };

    const procedures =
      this.procedures.get(postData.procedurePath.join(".")) ?? [];
    const procedure = procedures[0];

    if (!procedure) {
      return await route.continue();
    }

    let existingData: unknown = undefined;
    if (procedure.config.execute ?? true) {
      const response = await route.fetch();
      const existingBody = await response.body();
      existingData = (decode(existingBody) as Record<"data", unknown>)
        .data as Record<string, unknown>;
    }

    let newBodyContents: Record<string, unknown> = { data: existingData };
    try {
      newBodyContents = {
        data: await procedure.handler({
          data: existingData,
          args: postData.procedureArgs,
        }),
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

    if (typeof procedure.config.times === "number") {
      if (procedure.config.times <= 1) {
        procedures.shift();
      } else {
        procedure.config.times--;
      }
    }

    await route.fulfill({
      body: Buffer.from(encode(newBodyContents)),
    });
  }
}
