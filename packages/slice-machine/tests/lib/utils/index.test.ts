import "@testing-library/jest-dom";
import { simulatorIsSupported } from "@lib/utils";
import { Frameworks } from "@slicemachine/core/build/src/models";

describe("simulatorIsSupported", () => {
  test("Can create Storybook url from variation id", () => {
    expect(simulatorIsSupported(Frameworks.next)).toBeTruthy();
    expect(simulatorIsSupported(Frameworks.nuxt)).toBeTruthy();
    expect(simulatorIsSupported(Frameworks.vue)).toBeFalsy();
    expect(simulatorIsSupported(Frameworks.react)).toBeFalsy();
    expect(simulatorIsSupported(Frameworks.vanillajs)).toBeFalsy();
  });
});
