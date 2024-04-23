import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { describe, expect, it } from "vitest";

import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { Slices } from "@/legacy/lib/models/common/Slice";

import { deleteRepeatableZone } from "../slice";

describe("deleteRepeatableZone", () => {
  it("removes the `items` property from a specific variation within a slice", (ctx) => {
    const variation = ctx.createMock.model.sharedSliceVariation({
      itemsFields: { foo: ctx.createMock.model.boolean() },
    });
    const model = ctx.createMock.model.sharedSlice({ variations: [variation] });
    const slice = buildMockSliceComponentUI(model);

    const res = deleteRepeatableZone({ slice, variationId: variation.id });
    expect(res.model.variations[0].items).toBeUndefined();
  });

  it("does nothing if the variation does not exist", (ctx) => {
    const model = ctx.createMock.model.sharedSlice();
    const slice = buildMockSliceComponentUI(model);

    const res = deleteRepeatableZone({ slice, variationId: "non-existent" });
    expect(res).toStrictEqual(slice);
  });
});

function buildMockSliceComponentUI(model: SharedSlice): ComponentUI {
  return {
    model: Slices.toSM(model),
    extension: "extension",
    fileName: "fileName",
    from: "from",
    href: "href",
    mocks: [],
    pathToSlice: "pathToSlice",
    screenshots: {},
  };
}
