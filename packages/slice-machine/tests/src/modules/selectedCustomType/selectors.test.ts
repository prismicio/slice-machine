import "@testing-library/jest-dom";

import jsonModel from "./__mockData__/model.json";
import { selectIsCurrentCustomTypeHasPendingModifications } from "@src/modules/selectedCustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import { CustomTypes } from "@slicemachine/core/build/models/CustomType";

const model = CustomTypes.toSM(jsonModel as unknown as CustomType);

describe("[Selected Custom type selectors]", () => {
  describe("[selectIsCurrentCustomTypeHasPendingModifications]", () => {
    test("it computes correctly the state of the modifications 1/4", () => {
      const customTypeStatus = selectIsCurrentCustomTypeHasPendingModifications(
        {
          selectedCustomType: {
            model,
            initialModel: null,
            mockConfig: {},
            initialMockConfig: {},
          },
        }
      );

      expect(customTypeStatus).toBe(true);
    });
    test("it computes correctly the state of the modifications 2/4", () => {
      const customTypeStatus = selectIsCurrentCustomTypeHasPendingModifications(
        {
          selectedCustomType: {
            model,
            initialModel: model,
            mockConfig: {},
            initialMockConfig: {},
          },
        }
      );

      expect(customTypeStatus).toBe(false);
    });
    test("it computes correctly the state of the modifications 3/4", () => {
      const customTypeStatus = selectIsCurrentCustomTypeHasPendingModifications(
        {
          selectedCustomType: {
            model,
            initialModel: { ...model, label: `differ-from-${model.label}` },
            mockConfig: {},
            initialMockConfig: {},
          },
        }
      );
      expect(customTypeStatus).toBe(true);
    });
    test("it computes correctly the state of the modifications 4/4", () => {
      const customTypeStatus = selectIsCurrentCustomTypeHasPendingModifications(
        {
          selectedCustomType: {
            model,
            initialModel: { ...model, tabs: {} },
            mockConfig: {},
            initialMockConfig: {},
          },
        }
      );
      expect(customTypeStatus).toBe(true);
    });
  });
});
