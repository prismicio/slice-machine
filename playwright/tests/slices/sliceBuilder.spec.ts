import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.describe("Slice Builder", () => {
  test("I can add a static field to the builder", async ({
    slice,
    sliceBuilderPage,
  }) => {
    await sliceBuilderPage.goto(slice.name);

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

    await sliceBuilderPage.addStaticField(
      "Rich Text",
      "Description",
      "description",
    );

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(1);
  });
});
