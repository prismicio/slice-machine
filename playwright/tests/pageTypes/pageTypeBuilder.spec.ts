import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.describe("Page types builder", () => {
  test.run()(
    "I can see default SEO & Metadata tab fields",
    async ({ pageTypesBuilderPage, reusablePageType }) => {
      await pageTypesBuilderPage.goto(reusablePageType.name);
      await pageTypesBuilderPage.getTab("SEO & Metadata").click();

      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldName("Meta Description"),
      ).toBeVisible();
      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldId(
          "data.meta_description",
        ),
      ).toBeVisible();

      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldName("Meta Image"),
      ).toBeVisible();
      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldId("data.meta_image"),
      ).toBeVisible();

      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldName("Meta Title"),
      ).toBeVisible();
      await expect(
        pageTypesBuilderPage.getStaticZoneListItemFieldId("data.meta_title"),
      ).toBeVisible();
    },
  );
});
