import { changesPage } from "../../pages/changes/changesPage";
import { customTypeBuilder } from "../../pages/customTypes/customTypeBuilder";
import { sliceBuilder } from "../../pages/slices/sliceBuilder";

const random = Date.now();

const customTypeName = `My Test ${random}`;
const customTypeId = `my_test_${random}`;

const sliceName = `TestSlice${random}`;
const sliceId = `test_slice${random}`; // generated automatically from the slice name
const sliceLib = ".--slices";

describe("I am an existing SM user (Next) and I want to associate a Slice to a CT and review my experience.", () => {
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Create a Custom type with multiple fields", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.contains("Add a new Slice");
    cy.contains("SEO & Metadata").click();
    cy.should("not.have.text", "Add a new Slice");
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("a new tab");
    cy.get("#create-tab").submit();
    cy.contains("a new tab").click();
    cy.should("not.have.text", "Add a new Slice");

    cy.contains("Main").click();

    cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
    cy.addFieldToCustomType("Rich Text", "Rich Text Field", "rich_text_id");
    customTypeBuilder.save();

    cy.reload();
    cy.contains("Key Text Field");
    cy.contains("Rich Text Field");
  });

  it("Create a Slice with multiple fields (repeatable and non-repeatable)", () => {
    cy.createSlice(sliceLib, sliceId, sliceName);

    cy.addStaticFieldToSlice(
      "Key Text",
      "Static Key Text Field",
      "static_key_text_id"
    );

    cy.addStaticFieldToSlice(
      "Rich Text",
      "Static Rich Text Field",
      "static_rich_text_id"
    );

    cy.addRepeatableFieldToSlice(
      "Rich Text",
      "Repeatable Rich Text Field",
      "repeatable_rich_text_id"
    );

    cy.addRepeatableFieldToSlice(
      "Key Text",
      "Repeatable Key Text Field",
      "repeatable_key_text_id"
    );

    sliceBuilder.save();

    cy.reload();
    cy.contains("Static Key Text Field");
    cy.contains("Static Rich Text Field");
    cy.contains("Repeatable Rich Text Field");
    cy.contains("Repeatable Key Text Field");
  });

  it("Push the newly created custom type and slice", () => {
    changesPage.goTo().pushChanges().isUpToDate();
  });

  it("Add the Slice to the Custom Type", () => {
    cy.visit(`/custom-types/${customTypeId}`);

    cy.get("[data-cy=update-slices]").click();
    // forcing this because the input itself is invisible and an svg is displayed
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
    cy.get("[data-cy=update-slices-modal]").submit();

    customTypeBuilder.save();

    cy.reload();
    cy.contains(sliceName);
  });

  it("Push the custom type with the Slice associated", () => {
    changesPage.goTo().pushChanges().isUpToDate();
  });

  it("Displays and fill the satisfaction survey and the survey never reappears after", () => {
    const lastSyncChange = Date.now() - 1000 * 60 * 60 * 2;

    // Setting the context to display the survey
    cy.setSliceMachineUserContext({
      hasSendAReview: false,
      lastSyncChange,
    });

    // Visit a page
    cy.visit("/");

    cy.get("#review-form");
    cy.get("[data-cy=review-form-score-3]").click();
    cy.get("[data-cy=review-form-comment]").type(
      "Cypress test - testing the comment of the survey"
    );
    cy.get("#review-form").submit();

    cy.reload();
    cy.waitUntil(() => cy.get("[data-cy=create-ct]"));

    cy.get("#review-form").should("not.exist");
  });
});
