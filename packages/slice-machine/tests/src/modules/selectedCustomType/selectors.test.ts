import "@testing-library/jest-dom";

import jsonModel from "./__mockData__/model.json";
import {
  selectCustomTypeStatus,
  selectIsCurrentCustomTypeHasPendingModifications,
} from "@src/modules/selectedCustomType";
import { CustomType } from "@prismicio/types-internal/lib/customtypes/CustomType";
import { CustomTypes } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeStatus } from "../../../../src/modules/selectedCustomType/types";

const model = CustomTypes.toSM(jsonModel as unknown as CustomType);

describe("[Selected Custom type selectors]", () => {
  describe("[selectCustomTypeStatus]", () => {
    test("it computes correct status 1/4", () => {
      const customTypeStatus = selectCustomTypeStatus({
        selectedCustomType: {
          model,
          remoteModel: null,
        },
      });

      expect(customTypeStatus).toBe(CustomTypeStatus.New);
    });
    test("it computes correct status 2/4", () => {
      const customTypeStatus = selectCustomTypeStatus({
        selectedCustomType: {
          model,
          remoteModel: model,
        },
      });

      expect(customTypeStatus).toBe(CustomTypeStatus.Synced);
    });
    test("it computes correct status 3/4", () => {
      const customTypeStatus = selectCustomTypeStatus({
        selectedCustomType: {
          model,
          remoteModel: { ...model, label: `differ-from-${model.label}` },
        },
      });
      expect(customTypeStatus).toBe(CustomTypeStatus.Modified);
    });
    test("it computes correct status 4/4", () => {
      const customTypeStatus = selectCustomTypeStatus({
        selectedCustomType: {
          model,
          remoteModel: { ...model, tabs: {} },
        },
      });
      expect(customTypeStatus).toBe(CustomTypeStatus.Modified);
    });
  });
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
