const random = Date.now();

const customTypeName = `My Test ${random}`;
const customTypeId = `my_test_${random}`;

const sliceName = `TestSlice${random}`;
const sliceId = `test_slice${random}`; // generated automatically from the slice name
const sliceLib = "slices";

describe("I am an existing SM user (Next) and I want to associate a Slice to a CT and review my experience.", () => {
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Create a Custom type with multiple fields", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.addFieldToCustomType("UID", "ID Field", "uid");
    cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
    cy.addFieldToCustomType("Rich Text", "Rich Text Field", "rich_text_id");
    cy.saveCustomTypeModifications();

    cy.reload();
    cy.contains('ID Field')
    cy.contains('Key Text Field')
    cy.contains('Rich Text Field')
  });

  it("Create a Slice with multiple fields (repeatable and non-repeatable)", () => {
    cy.createSlice(sliceLib, sliceId, sliceName);

    // clear the Slice
    cy.get('[data-cy="slice-menu-button"]').each(($element) => {
      cy.wrap($element).click();
      cy.contains("Delete field").click();
    });

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

    cy.saveSliceModifications();

    cy.reload();
    cy.contains('Static Key Text Field')
    cy.contains('Static Rich Text Field')
    cy.contains('Repeatable Rich Text Field')
    cy.contains('Repeatable Key Text Field')
  });

  it("Push the newly created custom type and slice", () => {
    cy.pushLocalChanges(2);
  });

  it("Add the Slice to the Custom Type", () => {
    cy.visit(`/cts/${customTypeId}`);

    cy.get("[data-cy=update-slices]").click();
    // forcing this because the input itself is invisible and an svg is displayed
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
    cy.get("[data-cy=update-slices-modal]").submit();

    cy.saveSliceModifications();

    cy.reload();
    cy.contains(sliceName);
  });

  it("Push the custom type with the Slice associated", () => {
    cy.pushLocalChanges(1);
  });

  it("Displays and fill the satisfaction survey and the survey never reappears after", () => {
    const lastSyncChange = Date.now() - (1000 * 60 * 60 * 2)
    
    // Setting the context to display the survey
    cy.setSliceMachineUserContext({
      hasSendAReview: false,
      lastSyncChange
    });

    // Visit a page
    cy.visit('/');

    cy.get('#review-form');
    cy.get('[data-cy=review-form-score-3]').click();
    cy.get('[data-cy=review-form-comment]').type('Cypress test - testing the comment of the survey');
    cy.get('#review-form').submit();

    cy.reload();
    cy.waitUntil(() => cy.get('[data-cy=create-ct]'));

    cy.get('#review-form').should('not.exist');
  })
});
