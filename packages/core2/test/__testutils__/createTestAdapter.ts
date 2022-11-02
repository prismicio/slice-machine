import { expect } from "vitest";
import {
  defineSliceMachinePlugin,
  PluginOptions,
  SliceMachineHookTypes,
  SliceMachinePlugin,
} from "@slicemachine/plugin-kit";

type CreateTestAdapterArgs<TPluginOptions extends PluginOptions> = {
  setup?: SliceMachinePlugin<TPluginOptions>["setup"];
  autofillRequiredHooks?: boolean;
};

const REQUIRED_ADAPTER_HOOKS: SliceMachineHookTypes[] = [
  "slice:read",
  "slice:asset:update",
  "slice:asset:read",
  "slice:asset:delete",
  "slice-library:read",
  "custom-type:read",
  "custom-type:asset:update",
  "custom-type:asset:read",
  "custom-type:asset:delete",
  "custom-type-library:read",
  "slice-simulator:setup:read",
];

export const createTestAdapter = <TPluginOptions extends PluginOptions>({
  setup,
  autofillRequiredHooks = true,
}: CreateTestAdapterArgs<TPluginOptions> = {}): SliceMachinePlugin<TPluginOptions> => {
  const state = expect.getState();

  return defineSliceMachinePlugin({
    meta: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name: state.currentTestName!,
    },
    setup: async ({ hook, ...restSetupArgs }) => {
      const hookedTypes: string[] = [];

      const spiedOnHook = ((type, ...restHookArgs) => {
        hookedTypes.push(type);

        return hook(type, ...restHookArgs);
      }) as typeof hook;

      await setup?.({ hook: spiedOnHook, ...restSetupArgs });

      if (autofillRequiredHooks) {
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
