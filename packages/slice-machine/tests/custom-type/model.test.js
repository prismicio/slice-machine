import equal from "fast-deep-equal";

import { CustomType } from "../../lib/models/common/CustomType";

import jsonModel from "./__mockData__/model.json";

test("it formats models correctly", () => {
  const model = CustomType.fromJsonModel(jsonModel.id, jsonModel);

  const asArray = CustomType.toArray(model);
  const fromArray = CustomType.toObject(asArray);
  const finalModel = CustomType.toJsonModel(fromArray);

  expect(equal(model, fromArray)).toBe(true);
  expect(equal(jsonModel, finalModel)).toBe(true);
});
