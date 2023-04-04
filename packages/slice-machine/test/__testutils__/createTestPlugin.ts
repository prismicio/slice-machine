import {
  defineSliceMachinePlugin,
  SliceMachinePluginOptions,
  SliceMachineHookTypes,
  SliceMachinePlugin,
} from "@slicemachine/plugin-kit";
import { expect } from "vitest";
import * as crypto from "node:crypto";

const sha1 = (data: crypto.BinaryLike): string => {
  return crypto.createHash("sha1").update(data).digest("hex");
};

const REQUIRED_ADAPTER_HOOKS: SliceMachineHookTypes[] = [
  "slice:create",
  "slice:read",
  "slice:update",
  "slice:rename",
  "slice:delete",
  "slice:asset:update",
  "slice:asset:read",
  "slice:asset:delete",
  "slice-library:read",
  "custom-type:create",
  "custom-type:read",
  "custom-type:update",
  "custom-type:rename",
  "custom-type:delete",
  "custom-type:asset:update",
  "custom-type:asset:read",
  "custom-type:asset:delete",
  "custom-type-library:read",
  "slice-simulator:setup:read",
];

type CreateTestPluginArgs<TPluginOptions extends SliceMachinePluginOptions> =
  Partial<SliceMachinePlugin<TPluginOptions>> & {
    __autofillRequiredAdapterHooks?: boolean;
  };

export const createTestPlugin = <
  TPluginOptions extends SliceMachinePluginOptions
>({
  setup,
  __autofillRequiredAdapterHooks = true,
  ...plugin
}: CreateTestPluginArgs<TPluginOptions> = {}): SliceMachinePlugin<TPluginOptions> => {
  const state = expect.getState();

  return defineSliceMachinePlugin({
    ...plugin,
    meta: {
      ...plugin.meta,
      name:
        plugin.meta?.name ??
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        `test-plugin-${sha1(state.currentTestName!)}`,
    },
    setup: async ({ hook, ...restSetupArgs }) => {
      const hookedTypes: string[] = [];

      const spiedOnHook = ((type, ...restHookArgs) => {
        hookedTypes.push(type);

        return hook(type, ...restHookArgs);
      }) as typeof hook;

      await setup?.({ hook: spiedOnHook, ...restSetupArgs });

      if (__autofillRequiredAdapterHooks) {
        for (const hookType of REQUIRED_ADAPTER_HOOKS) {
          if (!hookedTypes.includes(hookType)) {
            hook(hookType, () => {
              throw new Error("not implemented");
            });
          }
        }
      }
    },
  });
};
