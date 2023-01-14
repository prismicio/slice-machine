import { afterEach, describe, expect, test, vi } from "vitest";
const TMP = "/tmp";
import { vol } from "memfs";
import { getComponentInfo } from "../../../core/libraries/component";
import path from "path";

vi.mock(`fs`, () => {
  return vol;
});

afterEach(() => {
  vol.reset();
});

describe("libaries/component", () => {
  describe("#getComponentInfo", () => {
    test("model with intergratoin fields", () => {
      const model =
        /* eslint-disable-next-line @typescript-eslint/no-var-requires */
        require("./__fixtures__/ProductListWithCta/model.json") as unknown;
      vol.fromJSON(
        {
          "ProductListWithCta/model.json": JSON.stringify(model),
        },
        TMP
      );

      const result = getComponentInfo(
        path.join(TMP, "ProductListWithCta"),
        [],
        TMP,
        path.join(TMP, "slices")
      );

      expect(result).toBeDefined();
    });
  });
});
