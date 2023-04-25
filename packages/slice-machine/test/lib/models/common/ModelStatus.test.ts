import { describe, test, expect } from "vitest";
import {
  ModelStatus,
  computeModelStatus,
} from "@lib/models/common/ModelStatus";
import { CustomTypes } from "@lib/models/common/CustomType";
import { customTypeMock } from "../../../__fixtures__/customType";

const model = CustomTypes.toSM(customTypeMock);

describe("Model Status", () => {
  test("computeModelStatus returns the status New", () => {
    const result = computeModelStatus({ local: model }, true);
    expect(result.status).toBe(ModelStatus.New);
  });

  test("computeModelStatus returns the status Modified", () => {
    const result = computeModelStatus(
      { local: model, remote: { ...model, name: "modified" } },
      true
    );
    expect(result.status).toBe(ModelStatus.Modified);
  });

  test("computeModelStatus returns the status Synced", () => {
    const result = computeModelStatus({ local: model, remote: model }, true);
    expect(result.status).toBe(ModelStatus.Synced);
  });

  test("computeModelStatus returns the status Unknown", () => {
    const result = computeModelStatus({ local: model, remote: model }, false);
    expect(result.status).toBe(ModelStatus.Unknown);
  });
});
