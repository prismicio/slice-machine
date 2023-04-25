import { TestContext } from "vitest";
import { rest } from "msw";

type MockCustomTypesAPIConfig = {
  endpoint?: string;
  onCustomTypeGetAll?: Parameters<typeof rest.get>[1];
  onCustomTypeGet?: Parameters<typeof rest.get>[1];
  onCustomTypeInsert?: Parameters<typeof rest.post>[1];
  onCustomTypeUpdate?: Parameters<typeof rest.post>[1];
  onSliceGetAll?: Parameters<typeof rest.get>[1];
  onSliceGet?: Parameters<typeof rest.get>[1];
  onSliceInsert?: Parameters<typeof rest.post>[1];
  onSliceUpdate?: Parameters<typeof rest.post>[1];
};

export const mockCustomTypesAPI = (
  ctx: TestContext,
  config?: MockCustomTypesAPIConfig
): void => {
  const endpoint = config?.endpoint ?? "https://customtypes.prismic.io";

  if (config?.onCustomTypeGetAll) {
    ctx.msw.use(
      rest.get(
        new URL("./customtypes", endpoint).toString(),
        config.onCustomTypeGetAll
      )
    );
  }

  if (config?.onCustomTypeGet) {
    ctx.msw.use(
      rest.get(
        new URL("./customtypes/:id", endpoint).toString(),
        (req, res, ctx) => {
          const customResponse = config.onCustomTypeGet?.(req, res, ctx);

          if (customResponse) {
            return customResponse;
          } else {
            return res(ctx.status(404));
          }
        }
      )
    );
  }

  if (config?.onCustomTypeInsert) {
    ctx.msw.use(
      rest.post(
        new URL("./customtypes/insert", endpoint).toString(),
        config.onCustomTypeInsert
      )
    );
  }

  if (config?.onCustomTypeUpdate) {
    ctx.msw.use(
      rest.post(
        new URL("./customtypes/update", endpoint).toString(),
        config.onCustomTypeUpdate
      )
    );
  }

  if (config?.onSliceGetAll) {
    ctx.msw.use(
      rest.get(new URL("./slices", endpoint).toString(), config.onSliceGetAll)
    );
  }

  if (config?.onSliceGet) {
    ctx.msw.use(
      rest.get(
        new URL("./slices/:id", endpoint).toString(),
        (req, res, ctx) => {
          const customResponse = config.onSliceGet?.(req, res, ctx);

          if (customResponse) {
            return customResponse;
          } else {
            return res(ctx.status(404));
          }
        }
      )
    );
  }

  if (config?.onSliceInsert) {
    ctx.msw.use(
      rest.post(
        new URL("./slices/insert", endpoint).toString(),
        config.onSliceInsert
      )
    );
  }

  if (config?.onSliceUpdate) {
    ctx.msw.use(
      rest.post(
        new URL("./slices/update", endpoint).toString(),
        config.onSliceUpdate
      )
    );
  }
};
