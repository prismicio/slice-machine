import "@testing-library/jest-dom";
import { CustomTypeStatus } from "@lib/models/ui/CustomTypeState";
import { CustomType } from "@lib/models/common/CustomType";

import jsonModel from "./__mockData__/model.json";
import {
  selectCustomTypeStatus,
  selectIsCurrentCustomTypeHasPendingModifications,
} from "@src/modules/selectedCustomType";

const model = CustomType.fromJsonModel(jsonModel.id, jsonModel);

describe("[Custom type selectors]", () => {
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
