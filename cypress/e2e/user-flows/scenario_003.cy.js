describe("I am an existing SM user and I want to upload screenshots on variations of an existing Slice", () => {
  const slice = {
    id: "screenshots_e2_e",
    name: "ScreenshotsE2E",
  };

  const fixturePath = "cypress/fixtures/";
  const customScreenshot = "screenshots/preview_small.png";
  const newScreenshot = "screenshots/preview_medium.png";
  const variationScreenshot = "screenshots/preview_large.png";

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
    cy.createSlice("slices", slice.id, slice.name);
  });

  beforeEach("Navigate to Slice page", () => {
    cy.setSliceMachineUserContext({});
    cy.visit(`/slices/${slice.name}/default`);
  });

  it("Upload and replace a screenshot on the default variation", () => {
    cy.get("[alt='Preview image']").should("not.exist");

    // Upload custom screenshot on default variation
    cy.get("button").contains("Update screenshot").click();

    cy.get("[aria-modal]").within(() => {
      cy.get("[alt='Preview image']").should("not.exist");
      cy.contains("Select file").selectFile(
        `${fixturePath}${customScreenshot}`,
        { action: "drag-drop" }
      );
      cy.contains("Uploading file ...").should("be.visible");
      cy.get("[alt='Preview image']").isSameImageAs(customScreenshot);
      cy.get("[aria-label='Close']").click();
    });
    cy.get("[aria-modal]").should("not.exist");
    cy.get("[alt='Preview image']").isSameImageAs(customScreenshot);

    // Replace screenshot on default variation
    cy.get("button").contains("Update screenshot").click();

    cy.get("[aria-modal]").within(() => {
      cy.get("[alt='Preview image']").isSameImageAs(customScreenshot);
      cy.get('input[type="file"]').selectFile(
        `${fixturePath}${newScreenshot}`,
        { force: true }
      );
      cy.contains("Uploading file ...").should("be.visible");
      cy.get("[alt='Preview image']").isSameImageAs(newScreenshot);
      cy.get("[aria-label='Close']").click();
    });

    cy.get("[aria-modal]").should("not.exist");
    cy.get("[alt='Preview image']").isSameImageAs(newScreenshot);

    // Upload screenshot on variation from the Changes Page
    const missingScreenshotVariation = "Missing screenshot";
    cy.createSliceVariation(missingScreenshotVariation);

    cy.get("[alt='Preview image']").should("not.exist");
    cy.get("[data-cy='builder-save-button']").click();
    cy.get("[role='alert']").contains("success").should("be.visible");

    cy.get("nav li").contains("Changes").click();
    const sliceCard = `a[href^="/slices/${slice.name}"]`;

    cy.get(sliceCard).within(() => {
      cy.contains("1/2 screenshots missing").should("be.visible");
      cy.contains("button", "Update screenshot").click();
    });

    cy.get("[aria-modal]").within(() => {
      cy.get("[alt='Preview image']").isSameImageAs(newScreenshot);
      cy.contains("aside li", missingScreenshotVariation).click();
      cy.get("[alt='Preview image']").should("not.exist");
      cy.contains("Select file").selectFile(
        `${fixturePath}${variationScreenshot}`,
        { action: "drag-drop" }
      );
      cy.contains("Uploading file ...").should("be.visible");
      cy.get("[alt='Preview image']").isSameImageAs(variationScreenshot);
      cy.get("[aria-label='Close']").click();
    });
    cy.get("[aria-modal]").should("not.exist");
    cy.get(sliceCard).should("not.include.text", "screenshots missing");

    cy.get("nav li").contains("Slices").click();
    cy.get(sliceCard).get("[alt='Preview image']").isSameImageAs(newScreenshot);
  });

  it("Error displayed when non-image files are uploaded", () => {
    cy.createSliceVariation("Error handling");
    cy.get("button").contains("Update screenshot").click();

    cy.get("[aria-modal]").within(() => {
      cy.get("[alt='Preview image']").should("not.exist");
      cy.contains("Select file").selectFile(
        {
          contents: Cypress.Buffer.from("this is not an image"),
          fileName: "file.txt",
          mimeType: "text/plain",
        },
        { action: "drag-drop" }
      );
    });

    cy.get("[role='alert']")
      .contains("Only files of type png, jpg, jpeg are accepted.")
      .should("be.visible");

    cy.get("[aria-modal]").within(() => {
      cy.get("[alt='Preview image']").should("not.exist");
      cy.get("[aria-label='Close']").click();
    });
    cy.get("[aria-modal]").should("not.exist");
  });
});
