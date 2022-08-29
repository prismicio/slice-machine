import "@testing-library/jest-dom";

import { ComponentUI, LibStatus } from "@lib/models/common/ComponentUI";
import backendEnvironment from "../../../__mocks__/backendEnvironment";
import allFieldComponent from "../../../__mocks__/componentModel";

describe("ComponentUI", () => {
  describe("build", () => {
    test("return NEW_SLICE as status when the slice don't exist", async () => {
      const componentUI = ComponentUI.build(
        allFieldComponent,
        [],
        backendEnvironment
      );
      expect(componentUI.__status).toBe(LibStatus.NewSlice);
    });
    test("return SYNCED as status when the slice don't exist", async () => {
      const componentUI = ComponentUI.build(
        allFieldComponent,
        [allFieldComponent.model],
        backendEnvironment
      );
      expect(componentUI.__status).toBe(LibStatus.Synced);
    });
    test("return MODIFIED as status when the slice don't exist", async () => {
      const modifiedAllFieldComponent = {
        ...allFieldComponent,
        model: {
          ...allFieldComponent.model,
          variations: [],
        },
      };
      const componentUI = ComponentUI.build(
        modifiedAllFieldComponent,
        [allFieldComponent.model],
        backendEnvironment
      );
      expect(componentUI.__status).toBe(LibStatus.Modified);
    });
  });
});
